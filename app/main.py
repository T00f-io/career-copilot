# app/main.py
from fastapi import FastAPI, UploadFile, File, Form, Request, HTTPException
from pydantic import BaseModel

from app.schemas import Resume, Job, GapReport
from app.services.parsing import (
    extract_text_from_file,
    parse_resume_text,
    parse_jd_text,
)

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

# ------------ Ingestion endpoints (MVP) ------------

class ResumeIngestResponse(BaseModel):
    resume: Resume

@app.post("/ingest/resume", response_model=ResumeIngestResponse)
async def ingest_resume(
    request: Request,
    file: UploadFile | None = File(default=None),
    text: str | None = Form(default=None),
):
    """
    Accept either:
      - multipart/form-data with `file` (PDF/DOCX/TXT) and/or `text`
      - application/json body: {"text": "..."}
    """
    raw_text: str | None = None

    # Case 1: multipart form
    if file or text is not None:
        if file:
            raw_bytes = await file.read()
            raw_text = extract_text_from_file(file.filename, raw_bytes)
        if text:
            raw_text = f"{raw_text or ''}\n{text}".strip()

    # Case 2: JSON payload with {"text": "..."}
    if raw_text is None:
        try:
            payload = await request.json()
            raw_text = (payload or {}).get("text")
        except Exception:
            raw_text = None

    if not raw_text:
        raise HTTPException(
            status_code=400,
            detail="Provide a resume via `file` (PDF/DOCX/TXT) or JSON body with {'text': '...'}."
        )

    try:
        resume = parse_resume_text(raw_text)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    return {"resume": resume}


class JobIngestRequest(BaseModel):
    text: str

class JobIngestResponse(BaseModel):
    job: Job

@app.post("/ingest/job", response_model=JobIngestResponse)
async def ingest_job(req: JobIngestRequest):
    """
    Accepts JD text; returns normalized Job model.
    """
    if not req.text or len(req.text.strip()) < 20:
        raise HTTPException(status_code=400, detail="Job text seems empty; paste a full description.")
    job = parse_jd_text(req.text)
    return {"job": job}
