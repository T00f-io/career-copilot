# app/services/parsing.py
from __future__ import annotations
from typing import List, Optional
import io
import re

from app.schemas import Resume, Basics, Skill, Bullet, Experience, Job

# --- low-dependency extractors (MVP) ---
def _extract_text_from_pdf(raw: bytes) -> str:
    try:
        from PyPDF2 import PdfReader
    except Exception:
        return ""
    try:
        reader = PdfReader(io.BytesIO(raw))
        pages = [p.extract_text() or "" for p in reader.pages]
        return "\n".join(pages)
    except Exception:
        return ""

def _extract_text_from_docx(raw: bytes) -> str:
    try:
        from docx import Document  # python-docx
    except Exception:
        return ""
    try:
        doc = Document(io.BytesIO(raw))
        return "\n".join(p.text for p in doc.paragraphs if p.text)
    except Exception:
        return ""

def extract_text_from_file(filename: str, raw: bytes) -> str:
    name = (filename or "").lower()
    if name.endswith(".pdf"):
        return _extract_text_from_pdf(raw)
    if name.endswith(".docx"):
        return _extract_text_from_docx(raw)
    # Fallback: assume plain text
    return raw.decode("utf-8", errors="ignore")

# --- helpers ---
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
LINE_SPLIT = re.compile(r"\r?\n+")

# A tiny skills/tools seed list for MVP heuristics (expand later)
SEED_SKILLS = {"python", "sql", "etl", "ml", "machine learning", "statistics"}
SEED_TOOLS = {"fastapi", "streamlit", "pandas", "numpy", "airflow", "docker", "aws"}

def _tokenize_lines(text: str) -> List[str]:
    return [ln.strip() for ln in LINE_SPLIT.split(text or "") if ln.strip()]

def _find_email(text: str) -> Optional[str]:
    m = EMAIL_RE.search(text or "")
    return m.group(0) if m else None

# --- Resume parsing (pragmatic MVP) ---
def parse_resume_text(text: str) -> Resume:
    lines = _tokenize_lines(text)
    email = _find_email(text)
    if not email:
        # Fail fast so the client can supply an email; our Resume schema requires it.
        raise ValueError("Could not detect email in resume text. Please include your email or use JSON upload later.")

    # Name heuristic: first non-empty line without '@'
    name = next((ln for ln in lines if "@" not in ln), "Candidate")

    # crude skills/tools detection by presence
    lower = text.lower()
    skills = [Skill(name=s) for s in sorted({s for s in SEED_SKILLS if s in lower})]
    tools = sorted({t for t in SEED_TOOLS if t in lower})

    # bullets: take lines that look like bullets or sentences with enough tokens (MVP)
    bullets: List[Bullet] = []
    for ln in lines:
        if ln.startswith(("-", "•", "*")) or len(ln.split()) >= 6:
            bullets.append(Bullet(text=ln.lstrip("-•* ").strip()))
    if not bullets:
        bullets = [Bullet(text=l) for l in lines[:5]]

    exp = Experience(company="Unknown Co", title="Unknown Title", bullets=bullets[:8])

    return Resume(
        basics=Basics(name=name[:80], email=email, years_experience=0),
        skills=skills,
        tools=tools,
        experiences=[exp],
    )

# --- Job parsing (simple rules) ---
HEAD_REQ = re.compile(r"requirement|qualification|must[- ]have", re.I)
HEAD_PREF = re.compile(r"preferred|nice[- ]to[- ]have|plus", re.I)
HEAD_RESP = re.compile(r"responsibilit|duties|what you.*do", re.I)
HEAD_TOOLS = re.compile(r"tool|tech|stack|technology", re.I)

BULLETish = re.compile(r"^(\s*[-*•]\s+)|(.{0,2}\d\.)")

def parse_jd_text(text: str) -> Job:
    lines = _tokenize_lines(text)
    must: List[str] = []
    nice: List[str] = []
    tools: List[str] = []
    resp: List[str] = []

    target: Optional[str] = None
    for ln in lines:
        # detect section heads
        if HEAD_REQ.search(ln):
            target = "must"
            continue
        if HEAD_PREF.search(ln):
            target = "nice"
            continue
        if HEAD_RESP.search(ln):
            target = "resp"
            continue
        if HEAD_TOOLS.search(ln):
            target = "tools"
            continue

        # collect bullet-like lines under current target
        if BULLETish.search(ln) and target:
            item = ln.lstrip("-*•0123456789. ").strip()
            if target == "must":
                must.append(item)
            elif target == "nice":
                nice.append(item)
            elif target == "resp":
                resp.append(item)
            elif target == "tools":
                tools.append(item)

    # fallbacks: if no sections found, do keyword mining
    lower = text.lower()
    if not must:
        for s in SEED_SKILLS:
            if s in lower:
                must.append(s)
    if not tools:
        for t in SEED_TOOLS:
            if t in lower:
                tools.append(t)

    # Better MVP: take the first non-empty line as title,
    # but avoid common section headers like "Requirements:" etc.
    title = next((ln for ln in lines if ln.strip()), "Unknown Role")
    header_re = re.compile(
        r"(requirement|qualification|responsibilit|duties|preferred|nice[- ]to[- ]have|tools|stack|technology)",
        re.I,
    )
    if header_re.search(title):
        title = next((ln for ln in lines if ln.strip() and not header_re.search(ln)), "Unknown Role")

    return Job(
        title=title,
        must_have=sorted(set(must)),
        nice_to_have=sorted(set(nice)),
        responsibilities=resp[:20],
        tools=sorted(set(tools)),
        years_required=0,
    )
