from fastapi import FastAPI, Depends, HTTPException, Request
from sqlmodel import Session, select
from database import create_db_and_tables, get_session
from models import Course, CompletedCourse, DegreeRequirement, Prerequisite, ElectiveGroup
from sqlalchemy.exc import IntegrityError
from fastapi.middleware.cors import CORSMiddleware
import anthropic
import json
import re

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://aggie-path.vercel.app"
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.get("/")
def read_root():
    return {"message": "Welcome to AggiePath!"}

@app.post("/courses")
def add_course(course: Course, session: Session = Depends(get_session)):
    try:
        session.add(course)
        session.commit()
        session.refresh(course)
        return course
    except IntegrityError:
        session.rollback()
        raise HTTPException(status_code=400, detail=f"Course '{course.course_id}' already exists")

@app.get("/courses")
def get_courses(session: Session = Depends(get_session)):
    courses = session.exec(select(Course)).all()
    return courses

@app.post("/completed-courses")
def add_completed_course(completed: CompletedCourse, session: Session = Depends(get_session)):
    course = session.get(Course, completed.course_id)
    if not course:
        course = Course(course_id=completed.course_id, name=completed.course_id, units=4)
        session.add(course)
        session.flush()

    session.add(completed)
    try:
        session.commit()
        session.refresh(completed)
        return completed
    except Exception:
        session.rollback()
        return completed

@app.post("/extract-courses")
async def extract_courses(request: Request):
    body = await request.json()
    image_data = body.get("image_data")
    media_type = body.get("media_type")

    client = anthropic.Anthropic()

    message = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=1000,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": media_type,
                            "data": image_data
                        }
                    },
                    {
                        "type": "text",
                        "text": """This is a UC Davis academic transcript or course list.
                                Extract all completed courses and return ONLY a JSON array with no other text or markdown.
                                Each item should have: course_id, term, grade.
                                Example format: [{"course_id": "ECS 36A", "term": "Fall 2023", "grade": "A"}]
                                If grade is not visible use empty string. If term is not visible use empty string.
                                Only include courses that appear completed (have a grade or are marked complete).
                                Use the exact UC Davis course ID format with a space (e.g. ECS 36A not ECS36A)."""
                    }
                ]
            }
        ]
    )

    text = message.content[0].text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    text = text.strip()
    courses = json.loads(text)
    for course in courses:
        course['course_id'] = re.sub(r'(\w+)\s+0+(\d+)', r'\1 \2', course['course_id'])

    return {"courses": courses}


def prereq_satisfied(prereq_id: str, completed_ids: set) -> bool:
    if "/" in prereq_id:
        alternatives = [alt.strip() for alt in prereq_id.split("/")]
        return any(alt in completed_ids for alt in alternatives)
    return prereq_id in completed_ids


@app.get("/progress/{student_id}")
def get_progress(student_id: int, major: str, session: Session = Depends(get_session)):
    required = session.exec(
        select(DegreeRequirement).where(DegreeRequirement.major_name == major)
    ).all()

    completed = session.exec(
        select(CompletedCourse).where(CompletedCourse.student_id == student_id)
    ).all()

    completed_ids = set(c.course_id for c in completed)

    # Category progress
    categories = {}
    for req in required:
        if req.category not in categories:
            categories[req.category] = []
        categories[req.category].append(req.course_id)

    category_progress = {}
    for category, course_ids in categories.items():
        required_set = set(course_ids)
        done = required_set & completed_ids
        remaining = required_set - completed_ids
        category_progress[category] = {
            "total": len(required_set),
            "completed": len(done),
            "remaining": list(remaining)
        }

    # Elective group progress (e.g. science: pick 3 of 9)
    elective_groups_raw = session.exec(
        select(ElectiveGroup).where(ElectiveGroup.major_name == major)
    ).all()

    elective_group_progress = {}
    for eg in elective_groups_raw:
        if eg.group_name not in elective_group_progress:
            elective_group_progress[eg.group_name] = {
                "courses_needed": eg.courses_needed,
                "options": [],
                "completed": [],
                "remaining_needed": eg.courses_needed
            }
        elective_group_progress[eg.group_name]["options"].append(eg.course_id)

    for group_name, data in elective_group_progress.items():
        done = [c for c in data["options"] if c in completed_ids]
        data["completed"] = done
        data["remaining_needed"] = max(0, data["courses_needed"] - len(done))

    # CS electives: completed ECS courses not in requirements
    required_ids = set(r.course_id for r in required)
    all_courses = session.exec(select(Course)).all()
    course_units = {c.course_id: c.units for c in all_courses}

    cs_electives = [
        c.course_id for c in completed
        if c.course_id.startswith("ECS") and c.course_id not in required_ids
    ]

    # Overall progress — core requirements + elective groups
    total_required = len(required_ids)
    total_completed = len(required_ids & completed_ids)

    for group_name, data in elective_group_progress.items():
        total_required += data["courses_needed"]
        total_completed += min(len(data["completed"]), data["courses_needed"])

    units_completed = sum(course_units.get(c, 0) for c in completed_ids if c in required_ids)
    percentage = round((total_completed / total_required) * 100, 1) if total_required > 0 else 0

    return {
        "student_id": student_id,
        "major": major,
        "total_required": total_required,
        "total_completed": total_completed,
        "units_completed": units_completed,
        "percentage": percentage,
        "by_category": category_progress,
        "elective_groups": elective_group_progress,
        "cs_electives": cs_electives
    }

@app.get("/what-if/{student_id}")
def what_if(student_id: int, major: str, add_program: str, session: Session = Depends(get_session)):
    current_required = session.exec(
        select(DegreeRequirement).where(DegreeRequirement.major_name == major)
    ).all()
    current_ids = set(r.course_id for r in current_required)

    addon_required = session.exec(
        select(DegreeRequirement).where(DegreeRequirement.major_name == add_program)
    ).all()
    addon_ids = set(r.course_id for r in addon_required)

    completed = session.exec(
        select(CompletedCourse).where(CompletedCourse.student_id == student_id)
    ).all()
    completed_ids = set(c.course_id for c in completed)

    all_prereqs = session.exec(select(Prerequisite)).all()
    prereq_map = {}
    for p in all_prereqs:
        if p.course_id not in prereq_map:
            prereq_map[p.course_id] = set()
        prereq_map[p.course_id].add(p.prereq_id)

    combined_ids = current_ids | addon_ids
    overlap = current_ids & addon_ids
    extra_courses = addon_ids - current_ids - completed_ids

    extra_prereqs = set()
    for course_id in extra_courses:
        prereqs = prereq_map.get(course_id, set())
        for prereq in prereqs:
            already_covered = (
                prereq_satisfied(prereq, completed_ids)
                or prereq in current_ids
                or prereq in addon_ids
            )
            if not already_covered:
                extra_prereqs.add(prereq)

    current_remaining = current_ids - completed_ids
    combined_remaining = combined_ids - completed_ids

    return {
        "student_id": student_id,
        "major": major,
        "add_program": add_program,
        "current_remaining": len(current_remaining),
        "combined_remaining": len(combined_remaining),
        "overlap_courses": list(overlap),
        "extra_courses_needed": list(extra_courses),
        "extra_count": len(extra_courses),
        "uncovered_prereqs": list(extra_prereqs)
    }

@app.get("/available-courses/{student_id}")
def get_available_courses(student_id: int, major: str, session: Session = Depends(get_session)):
    required = session.exec(
        select(DegreeRequirement).where(DegreeRequirement.major_name == major)
    ).all()
    required_ids = set(r.course_id for r in required)

    completed = session.exec(
        select(CompletedCourse).where(CompletedCourse.student_id == student_id)
    ).all()
    completed_ids = set(c.course_id for c in completed)

    remaining_ids = required_ids - completed_ids

    available = []
    for course_id in remaining_ids:
        prereqs = session.exec(
            select(Prerequisite).where(Prerequisite.course_id == course_id)
        ).all()

        prereq_ids = [p.prereq_id for p in prereqs]

        if all(prereq_satisfied(pid, completed_ids) for pid in prereq_ids):
            available.append(course_id)

    return {
        "student_id": student_id,
        "major": major,
        "available_courses": sorted(available)
    }

@app.delete("/completed-courses/{record_id}")
def delete_completed_course(record_id: int, session: Session = Depends(get_session)):
    record = session.get(CompletedCourse, record_id)
    if not record:
        raise HTTPException(status_code=404, detail=f"Record '{record_id}' not found")
    session.delete(record)
    session.commit()
    return {"message": f"Deleted record {record_id}"}

@app.get("/completed-courses/{student_id}")
def get_completed_courses(student_id: int, session: Session = Depends(get_session)):
    courses = session.exec(
        select(CompletedCourse).where(CompletedCourse.student_id == student_id)
    ).all()
    return courses

@app.get("/plan/{student_id}")
def get_plan(student_id: int, major: str, units_per_quarter: int = 16, max_required_per_quarter: int = 3, session: Session = Depends(get_session)):
    required = session.exec(
        select(DegreeRequirement).where(DegreeRequirement.major_name == major)
    ).all()
    required_ids = set(r.course_id for r in required)

    completed = session.exec(
        select(CompletedCourse).where(CompletedCourse.student_id == student_id)
    ).all()
    completed_ids = set(c.course_id for c in completed)

    all_courses = session.exec(select(Course)).all()
    course_units = {c.course_id: c.units for c in all_courses}

    all_prereqs = session.exec(select(Prerequisite)).all()

    prereq_map = {}
    for p in all_prereqs:
        if p.course_id not in prereq_map:
            prereq_map[p.course_id] = set()
        prereq_map[p.course_id].add(p.prereq_id)

    dependent_map = {}
    for p in all_prereqs:
        if p.prereq_id not in dependent_map:
            dependent_map[p.prereq_id] = set()
        dependent_map[p.prereq_id].add(p.course_id)

    def priority_score(course_id, visited=None):
        if visited is None:
            visited = set()
        if course_id in visited:
            return 0
        visited.add(course_id)
        dependents = dependent_map.get(course_id, set())
        required_dependents = dependents & required_ids
        score = len(required_dependents)
        for dep in required_dependents:
            score += priority_score(dep, visited)
        return score

    scheduled = set(completed_ids)
    remaining = required_ids - completed_ids
    quarters = []
    max_quarters = 20

    while remaining and len(quarters) < max_quarters:
        available = []
        for course_id in remaining:
            prereqs = prereq_map.get(course_id, set())
            if all(prereq_satisfied(pid, scheduled) for pid in prereqs):
                available.append(course_id)

        if not available:
            break

        available.sort(key=lambda c: priority_score(c), reverse=True)

        quarter_courses = []
        quarter_units = 0

        for course_id in available:
            if len(quarter_courses) >= max_required_per_quarter:
                break
            units = course_units.get(course_id, 4)
            if quarter_units + units <= units_per_quarter:
                quarter_courses.append(course_id)
                quarter_units += units

        placeholders = []
        while quarter_units + 4 <= units_per_quarter:
            placeholders.append("GE/Elective")
            quarter_units += 4

        quarter_courses_display = quarter_courses + placeholders

        quarters.append({
            "quarter": len(quarters) + 1,
            "courses": quarter_courses_display,
            "required_courses": quarter_courses,
            "units": quarter_units
        })

        for c in quarter_courses:
            scheduled.add(c)
            remaining.discard(c)

    return {
        "student_id": student_id,
        "major": major,
        "units_per_quarter": units_per_quarter,
        "quarters_to_graduation": len(quarters),
        "plan": quarters
    }

@app.post("/seed")
def seed_data(session: Session = Depends(get_session)):
    courses = [
        Course(course_id="MAT 21A", name="Calculus", units=4),
        Course(course_id="MAT 21B", name="Calculus", units=4),
        Course(course_id="MAT 21C", name="Calculus", units=4),
        Course(course_id="MAT 22A", name="Linear Algebra", units=3),
        Course(course_id="ECS 20", name="Discrete Mathematics for CS", units=4),
        Course(course_id="ECS 36A", name="Programming and Problem Solving", units=4),
        Course(course_id="ECS 36B", name="Software Development and OOP", units=4),
        Course(course_id="ECS 36C", name="Data Structures and Algorithms", units=4),
        Course(course_id="ECS 50", name="Computer Organization", units=4),
        Course(course_id="ECS 120", name="Theory of Computation", units=4),
        Course(course_id="ECS 122A", name="Algorithm Design and Analysis", units=4),
        Course(course_id="ECS 132", name="Probability and Statistical Modeling", units=4),
        Course(course_id="ECS 140A", name="Programming Languages", units=4),
        Course(course_id="ECS 150", name="Operating Systems", units=4),
        Course(course_id="ECS 154A", name="Computer Architecture", units=4),
        Course(course_id="PHY 9A", name="Classical Physics", units=4),
        Course(course_id="PHY 9B", name="Classical Physics", units=4),
        Course(course_id="PHY 9C", name="Classical Physics", units=4),
        Course(course_id="CHE 2A", name="General Chemistry", units=5),
        Course(course_id="CHE 2B", name="General Chemistry", units=5),
        Course(course_id="CHE 2C", name="General Chemistry", units=5),
        Course(course_id="BIO 2A", name="Introduction to Biology", units=5),
        Course(course_id="BIO 2B", name="Introduction to Biology", units=5),
        Course(course_id="BIO 2C", name="Introduction to Biology", units=5),
        Course(course_id="STA 106", name="Applied Statistical Methods: ANOVA", units=4),
        Course(course_id="STA 108", name="Applied Statistical Methods: Regression", units=4),
        Course(course_id="STA 131A", name="Introduction to Probability Theory", units=4),
        Course(course_id="STA 131B", name="Mathematical Statistics", units=4),
        Course(course_id="STA 141A", name="Fundamentals of Statistical Data Science", units=4),
        Course(course_id="STA 013", name="Elementary Statistics", units=4),
        Course(course_id="STA 032", name="Gateway to Statistical Data Science", units=4),
    ]

    for course in courses:
        existing = session.get(Course, course.course_id)
        if not existing:
            session.add(course)
    session.commit()

    requirements = [
        DegreeRequirement(major_name="Computer Science", course_id="MAT 21A", category="math"),
        DegreeRequirement(major_name="Computer Science", course_id="MAT 21B", category="math"),
        DegreeRequirement(major_name="Computer Science", course_id="MAT 21C", category="math"),
        DegreeRequirement(major_name="Computer Science", course_id="MAT 22A", category="math"),
        DegreeRequirement(major_name="Computer Science", course_id="ECS 20", category="lower_div_cs"),
        DegreeRequirement(major_name="Computer Science", course_id="ECS 36A", category="lower_div_cs"),
        DegreeRequirement(major_name="Computer Science", course_id="ECS 36B", category="lower_div_cs"),
        DegreeRequirement(major_name="Computer Science", course_id="ECS 36C", category="lower_div_cs"),
        DegreeRequirement(major_name="Computer Science", course_id="ECS 50", category="lower_div_cs"),
        DegreeRequirement(major_name="Computer Science", course_id="ECS 120", category="upper_div_cs"),
        DegreeRequirement(major_name="Computer Science", course_id="ECS 122A", category="upper_div_cs"),
        DegreeRequirement(major_name="Computer Science", course_id="ECS 132", category="upper_div_cs"),
        DegreeRequirement(major_name="Computer Science", course_id="ECS 140A", category="upper_div_cs"),
        DegreeRequirement(major_name="Computer Science", course_id="ECS 150", category="upper_div_cs"),
        DegreeRequirement(major_name="Computer Science", course_id="ECS 154A", category="upper_div_cs"),
        DegreeRequirement(major_name="Statistics Minor", course_id="STA 106", category="core"),
        DegreeRequirement(major_name="Statistics Minor", course_id="STA 108", category="core"),
        DegreeRequirement(major_name="Statistics Minor", course_id="STA 131A", category="series"),
        DegreeRequirement(major_name="Statistics Minor", course_id="STA 131B", category="series"),
        DegreeRequirement(major_name="Statistics Minor", course_id="STA 141A", category="elective"),
    ]

    existing_reqs = session.exec(select(DegreeRequirement)).all()
    existing_req_pairs = {(r.major_name, r.course_id) for r in existing_reqs}
    for req in requirements:
        if (req.major_name, req.course_id) not in existing_req_pairs:
            session.add(req)
    session.commit()

    prerequisites = [
        Prerequisite(course_id="MAT 21B", prereq_id="MAT 21A"),
        Prerequisite(course_id="MAT 21C", prereq_id="MAT 21B"),
        Prerequisite(course_id="MAT 22A", prereq_id="MAT 21C"),
        Prerequisite(course_id="ECS 36B", prereq_id="ECS 36A"),
        Prerequisite(course_id="ECS 36C", prereq_id="ECS 20"),
        Prerequisite(course_id="ECS 36C", prereq_id="ECS 36B"),
        Prerequisite(course_id="ECS 50",  prereq_id="ECS 36B"),
        Prerequisite(course_id="ECS 122A", prereq_id="ECS 20"),
        Prerequisite(course_id="ECS 122A", prereq_id="ECS 36C"),
        Prerequisite(course_id="ECS 120",  prereq_id="ECS 20"),
        Prerequisite(course_id="ECS 140A", prereq_id="ECS 20"),
        Prerequisite(course_id="ECS 140A", prereq_id="ECS 50"),
        Prerequisite(course_id="ECS 140A", prereq_id="ECS 36C"),
        Prerequisite(course_id="ECS 154A", prereq_id="ECS 50"),
        Prerequisite(course_id="ECS 150",  prereq_id="ECS 36C"),
        Prerequisite(course_id="ECS 150",  prereq_id="ECS 154A"),
        Prerequisite(course_id="ECS 132",  prereq_id="ECS 20"),
        Prerequisite(course_id="ECS 132",  prereq_id="MAT 21C"),
        Prerequisite(course_id="ECS 132",  prereq_id="ECS 36B"),
        Prerequisite(course_id="ECS 132",  prereq_id="MAT 22A"),
        Prerequisite(course_id="PHY 9A",  prereq_id="MAT 21B"),
        Prerequisite(course_id="PHY 9B",  prereq_id="PHY 9A"),
        Prerequisite(course_id="PHY 9B",  prereq_id="MAT 21C"),
        Prerequisite(course_id="PHY 9C",  prereq_id="PHY 9B"),
        Prerequisite(course_id="PHY 9C",  prereq_id="MAT 22A"),
        Prerequisite(course_id="STA 131B", prereq_id="STA 131A"),
        Prerequisite(course_id="STA 141A", prereq_id="STA 131A"),
        Prerequisite(course_id="STA 106",  prereq_id="STA 013/STA 032"),
        Prerequisite(course_id="STA 108",  prereq_id="STA 013/STA 032"),
    ]

    existing_prereqs = session.exec(select(Prerequisite)).all()
    existing_prereq_pairs = {(p.course_id, p.prereq_id) for p in existing_prereqs}
    for prereq in prerequisites:
        if (prereq.course_id, prereq.prereq_id) not in existing_prereq_pairs:
            session.add(prereq)
    session.commit()

    elective_groups = [
        ElectiveGroup(major_name="Computer Science", group_name="science", course_id="PHY 9A", courses_needed=3),
        ElectiveGroup(major_name="Computer Science", group_name="science", course_id="PHY 9B", courses_needed=3),
        ElectiveGroup(major_name="Computer Science", group_name="science", course_id="PHY 9C", courses_needed=3),
        ElectiveGroup(major_name="Computer Science", group_name="science", course_id="CHE 2A", courses_needed=3),
        ElectiveGroup(major_name="Computer Science", group_name="science", course_id="CHE 2B", courses_needed=3),
        ElectiveGroup(major_name="Computer Science", group_name="science", course_id="CHE 2C", courses_needed=3),
        ElectiveGroup(major_name="Computer Science", group_name="science", course_id="BIO 2A", courses_needed=3),
        ElectiveGroup(major_name="Computer Science", group_name="science", course_id="BIO 2B", courses_needed=3),
        ElectiveGroup(major_name="Computer Science", group_name="science", course_id="BIO 2C", courses_needed=3),
    ]

    existing_egs = session.exec(select(ElectiveGroup)).all()
    existing_eg_pairs = {(e.major_name, e.group_name, e.course_id) for e in existing_egs}
    for eg in elective_groups:
        if (eg.major_name, eg.group_name, eg.course_id) not in existing_eg_pairs:
            session.add(eg)
    session.commit()

    return {"message": f"Seeded {len(courses)} courses, {len(requirements)} requirements, {len(prerequisites)} prerequisites, {len(elective_groups)} elective group entries"}