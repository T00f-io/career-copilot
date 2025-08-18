from fastapi import FastAPI
from pydantic import BaseModel

from app.schemas import Resume, Job, GapReport

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Career Copilot API is running! See /docs for endpoints."}

@app.get("/health")
def health():
    return {"ok": True}

# ----- validation helpers for Week 1 -----

@app.post("/validate/resume", response_model=Resume)
def validate_resume(resume: Resume):
    return resume

@app.post("/validate/job", response_model=Job)
def validate_job(job: Job):
    return job

# ----- typed analyze stub (real logic comes Week 3) -----

class AnalyzeRequest(BaseModel):
    resume: Resume
    job: Job

@app.post("/analyze", response_model=GapReport)
def analyze(req: AnalyzeRequest):
    # Gather resume lines (bullets only for MVP)
    lines = []
    for exp in req.resume.experiences:
        for b in exp.bullets:
            if b.text:
                lines.append(b.text)

    # simple must-have detection
    must = [m.lower() for m in req.job.must_have]
    have = set()
    for ln in lines:
        low = ln.lower()
        for m in must:
            if m in low:
                have.add(m)

    must_gaps = [m for m in must if m not in have]
    coverage = 0 if not must else int(round(100 * (len(have) / len(must))))

    evidence = {}
    for m in have:
        evidence[m] = [ln for ln in lines if m in ln.lower()][:3]

    return GapReport(
        coverage_score=coverage,
        must_have_gaps=must_gaps,
        nice_to_have_gaps=[],
        evidence_map=evidence,
    )
