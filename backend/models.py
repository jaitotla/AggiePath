from sqlmodel import SQLModel, Field
from typing import Optional

class Course(SQLModel, table=True):
    course_id: str = Field(primary_key=True)
    name: str
    units: int

class DegreeRequirement(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    major_name: str
    course_id: str
    category: str

class CompletedCourse(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int
    course_id: str
    term: str
    grade: str

class Prerequisite(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    course_id: str
    prereq_id: str

class ElectiveGroup(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    major_name: str
    group_name: str
    course_id: str
    courses_needed: int