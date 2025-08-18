from typing import List, Optional
from pydantic import BaseModel

class Job(BaseModel):
    title: str
    company: Optional[str] = None
    location: Optional[str] = None
    years_required: Optional[int] = 0
    must_have: List[str] = []
    nice_to_have: List[str] = []
    tools: List[str] = []
    responsibilities: List[str] = []
