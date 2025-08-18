from typing import List, Optional
from pydantic import BaseModel, EmailStr, field_validator

class Basics(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    location: Optional[str] = None
    years_experience: Optional[int] = 0

    @field_validator("years_experience")
    @classmethod
    def non_negative(cls, v):
        return max(0, v or 0)

class Skill(BaseModel):
    name: str
    level: Optional[str] = None  # beginner/intermediate/advanced (optional)

class Bullet(BaseModel):
    text: str
    tags: Optional[List[str]] = None  # e.g., ["python","etl"]

class Experience(BaseModel):
    company: str
    title: str
    start_date: Optional[str] = None  # keep ISO-like strings for MVP
    end_date: Optional[str] = None
    bullets: List[Bullet] = []

class Resume(BaseModel):
    basics: Basics
    skills: List[Skill] = []
    tools: List[str] = []
    experiences: List[Experience] = []
