from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict

app = FastAPI()

# -------- Models --------
class AnalyzeRequest(BaseModel):
    resume_text: str
    job_text: str

class AnalyzeResponse(BaseModel):
    coverage_score: int
    must_have_gaps: List[str]
    nice_to_have_gaps: List[str]
    evidence_map: Dict[str, List[str]]

# -------- Simple routes --------
@app.get("/health")
def health():
    return {"ok": True}

@app.get("/")
def root():
    return {"message": "Career Copilot API is running! See /docs for endpoints."}

# -------- Stub logic (replace later with embeddings, etc.) --------
@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest):
    resume_lower = req.resume_text.lower()
    job_lower = req.job_text.lower()

    # naive “must-haves” detected from JD text
    must_haves = []
    for kw in ["python", "sql", "fastapi", "streamlit", "langchain"]:
        if kw in job_lower:
            must_haves.append(kw.capitalize() if kw != "sql" else "SQL")

    # naive skills we "have" based on resume text
    have = []
    for kw in ["python", "sql", "fastapi", "streamlit", "langchain"]:
        if kw in resume_lower:
            have.append(kw.capitalize() if kw != "sql" else "SQL")

    must_gaps = [m for m in must_haves if m not in have]
    nice_gaps = []  # fill later

    coverage = 0 if not must_haves else int(round(100 * (len(set(must_haves) & set(have)) / len(set(must_haves)))))

    # crude “evidence”: lines from resume that mention a matched skill
    evidence: Dict[str, List[str]] = {}
    resume_lines = [ln.strip() for ln in req.resume_text.splitlines() if ln.strip()]
    for skill in have:
        lines = [ln for ln in resume_lines if skill.lower() in ln.lower()]
        evidence[skill] = lines[:3] if lines else []

    return AnalyzeResponse(
        coverage_score=coverage,
        must_have_gaps=must_gaps,
        nice_to_have_gaps=nice_gaps,
        evidence_map=evidence
    )
