from typing import Dict, List
from pydantic import BaseModel, Field

class GapReport(BaseModel):
    coverage_score: int = Field(ge=0, le=100)
    must_have_gaps: List[str] = []
    nice_to_have_gaps: List[str] = []
    # maps skill/requirement -> up to a few resume lines that prove it
    evidence_map: Dict[str, List[str]] = {}

class TailoredBullet(BaseModel):
    text: str
    evidence: List[str] = []

class TailoredBullets(BaseModel):
    bullets: List[TailoredBullet]

class LearningPlanRow(BaseModel):
    week: int
    focus: str
    outcomes: List[str] = []
    resources: List[str] = []

class LearningPlan(BaseModel):
    rows: List[LearningPlanRow] = []
