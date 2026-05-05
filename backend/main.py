from fastapi import FastAPI, Depends, HTTPException
from sqlmodel import Session, select
from database import create_db_and_tables, get_session
from models import Course, CompletedCourse, DegreeRequirement, Prerequisite
from sqlalchemy.exc import IntegrityError
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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
    # Check if the course exists first
    course = session.get(Course, completed.course_id)
    if not course:
        raise HTTPException(status_code=404, detail=f"Course '{completed.course_id}' not found")
    
    session.add(completed)
    session.commit()
    session.refresh(completed)
    return completed

@app.get("/progress/{student_id}")
def get_progress(student_id: int, major: str, session: Session = Depends(get_session)):
    # Get all required courses for this major
    required = session.exec(
        select(DegreeRequirement).where(DegreeRequirement.major_name == major)
    ).all()

    # Get all completed courses for this student
    completed = session.exec(
        select(CompletedCourse).where(CompletedCourse.student_id == student_id)
    ).all()

    completed_ids = set(c.course_id for c in completed)

    # Group requirements by category
    categories = {}
    for req in required:
        if req.category not in categories:
            categories[req.category] = []
        categories[req.category].append(req.course_id)

    # Calculate progress per category
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

    # Calculate overall progress
    required_ids = set(r.course_id for r in required)
    total_required = len(required_ids)
    total_completed = len(required_ids & completed_ids)
    all_courses = session.exec(select(Course)).all()
    course_units = {c.course_id: c.units for c in all_courses}
    units_completed = sum(course_units.get(c, 0) for c in completed_ids if c in required_ids)
    percentage = round((total_completed / total_required) * 100, 1) if total_required > 0 else 0

    return {
        "student_id": student_id,
        "major": major,
        "total_required": total_required,
        "total_completed": total_completed,
        "units_completed": units_completed,
        "percentage": percentage,
        "by_category": category_progress
    }

@app.get("/what-if/{student_id}")
def what_if(student_id: int, major: str, add_program: str, session: Session = Depends(get_session)):
    # Get current major requirements
    current_required = session.exec(
        select(DegreeRequirement).where(DegreeRequirement.major_name == major)
    ).all()
    current_ids = set(r.course_id for r in current_required)

    # Get add-on program requirements
    addon_required = session.exec(
        select(DegreeRequirement).where(DegreeRequirement.major_name == add_program)
    ).all()
    addon_ids = set(r.course_id for r in addon_required)

    # Get completed courses
    completed = session.exec(
        select(CompletedCourse).where(CompletedCourse.student_id == student_id)
    ).all()
    completed_ids = set(c.course_id for c in completed)

    # Get all prerequisites
    all_prereqs = session.exec(select(Prerequisite)).all()
    prereq_map = {}
    for p in all_prereqs:
        if p.course_id not in prereq_map:
            prereq_map[p.course_id] = set()
        prereq_map[p.course_id].add(p.prereq_id)

    # Combined requirements
    combined_ids = current_ids | addon_ids

    # Overlap — courses that count for both
    overlap = current_ids & addon_ids

    # Extra courses needed by adding the program
    extra_courses = addon_ids - current_ids - completed_ids

    # Find prereqs for extra courses that aren't already covered
    extra_prereqs = set()
    for course_id in extra_courses:
        prereqs = prereq_map.get(course_id, set())
        for prereq in prereqs:
            if prereq not in current_ids and prereq not in completed_ids and prereq not in addon_ids:
                extra_prereqs.add(prereq)

    # What's left in each scenario
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
    # Step 1: Get all required course IDs for this major
    required = session.exec(
        select(DegreeRequirement).where(DegreeRequirement.major_name == major)
    ).all()
    required_ids = set(r.course_id for r in required)

    # Step 2: Get all completed course IDs for this student
    completed = session.exec(
        select(CompletedCourse).where(CompletedCourse.student_id == student_id)
    ).all()
    completed_ids = set(c.course_id for c in completed)

    # Step 3: Remaining = required - completed
    remaining_ids = required_ids - completed_ids

    # Step 4: For each remaining course, check if all prereqs are satisfied
    available = []
    for course_id in remaining_ids:
        prereqs = session.exec(
            select(Prerequisite).where(Prerequisite.course_id == course_id)
        ).all()

        prereq_ids = set(p.prereq_id for p in prereqs)

        # All prereqs must be in completed_ids
        if prereq_ids.issubset(completed_ids):
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
    # Get all required course IDs
    required = session.exec(
        select(DegreeRequirement).where(DegreeRequirement.major_name == major)
    ).all()
    required_ids = set(r.course_id for r in required)

    # Get all completed course IDs
    completed = session.exec(
        select(CompletedCourse).where(CompletedCourse.student_id == student_id)
    ).all()
    completed_ids = set(c.course_id for c in completed)

    # Get all courses to know their units
    all_courses = session.exec(select(Course)).all()
    course_units = {c.course_id: c.units for c in all_courses}

    # Get all prerequisites
    all_prereqs = session.exec(select(Prerequisite)).all()

    # Build prereq map: course → set of its prereqs
    prereq_map = {}
    for p in all_prereqs:
        if p.course_id not in prereq_map:
            prereq_map[p.course_id] = set()
        prereq_map[p.course_id].add(p.prereq_id)

    # Build dependent map: course → set of courses that need it
    dependent_map = {}
    for p in all_prereqs:
        if p.prereq_id not in dependent_map:
            dependent_map[p.prereq_id] = set()
        dependent_map[p.prereq_id].add(p.course_id)

    # Calculate priority score — how many required courses does this unlock?
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

    # Simulate quarters
    scheduled = set(completed_ids)
    remaining = required_ids - completed_ids
    quarters = []
    max_quarters = 20  # safety limit

    while remaining and len(quarters) < max_quarters:
        # Find available courses this quarter
        available = []
        for course_id in remaining:
            prereqs = prereq_map.get(course_id, set())
            if prereqs.issubset(scheduled):
                available.append(course_id)

        if not available:
            break  # No progress possible — shouldn't happen with valid data

        # Sort by priority score descending
        available.sort(key=lambda c: priority_score(c), reverse=True)

        # Fill quarter with required courses up to max_required_per_quarter
        quarter_courses = []
        quarter_units = 0

        for course_id in available:
            if len(quarter_courses) >= max_required_per_quarter:
                break
            units = course_units.get(course_id, 4)
            if quarter_units + units <= units_per_quarter:
                quarter_courses.append(course_id)
                quarter_units += units

        # Fill remaining slots with GE/Elective placeholders
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

        # Mark as scheduled for next iteration
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
    # First seed all courses
    courses = [
        # Math
        Course(course_id="MAT 21A", name="Calculus", units=4),
        Course(course_id="MAT 21B", name="Calculus", units=4),
        Course(course_id="MAT 21C", name="Calculus", units=4),
        Course(course_id="MAT 22A", name="Linear Algebra", units=3),
        # Lower Division CS
        Course(course_id="ECS 20", name="Discrete Mathematics for CS", units=4),
        Course(course_id="ECS 36A", name="Programming and Problem Solving", units=4),
        Course(course_id="ECS 36B", name="Software Development and OOP", units=4),
        Course(course_id="ECS 36C", name="Data Structures and Algorithms", units=4),
        Course(course_id="ECS 50", name="Computer Organization", units=4),
        # Upper Division CS
        Course(course_id="ECS 120", name="Theory of Computation", units=4),
        Course(course_id="ECS 122A", name="Algorithm Design and Analysis", units=4),
        Course(course_id="ECS 132", name="Probability and Statistical Modeling", units=4),
        Course(course_id="ECS 140A", name="Programming Languages", units=4),
        Course(course_id="ECS 150", name="Operating Systems", units=4),
        Course(course_id="ECS 154A", name="Computer Architecture", units=4),
        # Science
        Course(course_id="PHY 9A", name="Classical Physics", units=4),
        Course(course_id="PHY 9B", name="Classical Physics", units=4),
        Course(course_id="PHY 9C", name="Classical Physics", units=4),
        # Statistics Minor courses
        Course(course_id="STA 106", name="Applied Statistical Methods: ANOVA", units=4),
        Course(course_id="STA 108", name="Applied Statistical Methods: Regression", units=4),
        Course(course_id="STA 131A", name="Introduction to Probability Theory", units=4),
        Course(course_id="STA 131B", name="Mathematical Statistics", units=4),
        Course(course_id="STA 141A", name="Fundamentals of Statistical Data Science", units=4),
        Course(course_id="STA 013/STA 032", name="Elementary Statistics or Gateway to Statistical Data Science", units=4),
    ]

    for course in courses:
        session.add(course)

    # Then seed degree requirements
    requirements = [
        # Math
        DegreeRequirement(major_name="Computer Science", course_id="MAT 21A", category="math"),
        DegreeRequirement(major_name="Computer Science", course_id="MAT 21B", category="math"),
        DegreeRequirement(major_name="Computer Science", course_id="MAT 21C", category="math"),
        DegreeRequirement(major_name="Computer Science", course_id="MAT 22A", category="math"),
        # Lower Division CS
        DegreeRequirement(major_name="Computer Science", course_id="ECS 20", category="lower_div_cs"),
        DegreeRequirement(major_name="Computer Science", course_id="ECS 36A", category="lower_div_cs"),
        DegreeRequirement(major_name="Computer Science", course_id="ECS 36B", category="lower_div_cs"),
        DegreeRequirement(major_name="Computer Science", course_id="ECS 36C", category="lower_div_cs"),
        DegreeRequirement(major_name="Computer Science", course_id="ECS 50", category="lower_div_cs"),
        # Upper Division CS
        DegreeRequirement(major_name="Computer Science", course_id="ECS 120", category="upper_div_cs"),
        DegreeRequirement(major_name="Computer Science", course_id="ECS 122A", category="upper_div_cs"),
        DegreeRequirement(major_name="Computer Science", course_id="ECS 132", category="upper_div_cs"),
        DegreeRequirement(major_name="Computer Science", course_id="ECS 140A", category="upper_div_cs"),
        DegreeRequirement(major_name="Computer Science", course_id="ECS 150", category="upper_div_cs"),
        DegreeRequirement(major_name="Computer Science", course_id="ECS 154A", category="upper_div_cs"),
        # Science
        DegreeRequirement(major_name="Computer Science", course_id="PHY 9A", category="science"),
        DegreeRequirement(major_name="Computer Science", course_id="PHY 9B", category="science"),
        DegreeRequirement(major_name="Computer Science", course_id="PHY 9C", category="science"),
        # Statistics Minor requirements
        DegreeRequirement(major_name="Statistics Minor", course_id="STA 106", category="core"),
        DegreeRequirement(major_name="Statistics Minor", course_id="STA 108", category="core"),
        DegreeRequirement(major_name="Statistics Minor", course_id="STA 131A", category="series"),
        DegreeRequirement(major_name="Statistics Minor", course_id="STA 131B", category="series"),
        DegreeRequirement(major_name="Statistics Minor", course_id="STA 141A", category="elective"),
    ]

    for req in requirements:
        session.add(req)

    prerequisites = [
    # MAT chain
    Prerequisite(course_id="MAT 21B", prereq_id="MAT 21A"),
    Prerequisite(course_id="MAT 21C", prereq_id="MAT 21B"),
    Prerequisite(course_id="MAT 22A", prereq_id="MAT 21C"),
    # ECS 36 chain
    Prerequisite(course_id="ECS 36B", prereq_id="ECS 36A"),
    Prerequisite(course_id="ECS 36C", prereq_id="ECS 20"),
    Prerequisite(course_id="ECS 36C", prereq_id="ECS 36B"),
    Prerequisite(course_id="ECS 50",  prereq_id="ECS 36B"),
    # Upper division
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
    # PHY chain
    Prerequisite(course_id="PHY 9A",  prereq_id="MAT 21B"),
    Prerequisite(course_id="PHY 9B",  prereq_id="PHY 9A"),
    Prerequisite(course_id="PHY 9B",  prereq_id="MAT 21C"),
    Prerequisite(course_id="PHY 9C",  prereq_id="PHY 9B"),
    Prerequisite(course_id="PHY 9C",  prereq_id="MAT 22A"),
    # Statistics Minor prerequisites
    Prerequisite(course_id="STA 131B", prereq_id="STA 131A"),
    Prerequisite(course_id="STA 141A", prereq_id="STA 131A"),
    Prerequisite(course_id="STA 106",  prereq_id="STA 013/STA 032"),
    Prerequisite(course_id="STA 108",  prereq_id="STA 013/STA 032"),
    ]

    for prereq in prerequisites:
        session.add(prereq)

    session.commit()
    return {"message": f"Seeded {len(courses)} courses, {len(requirements)} requirements, {len(prerequisites)} prerequisites"}