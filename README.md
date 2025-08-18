# Career Copilot

Career Copilot is an **AI-powered career assistant** that helps you close the gap between your current resume and the roles you want.  
It analyzes your resume against job postings, highlights missing skills, and generates:
- Tailored learning roadmaps  
- ATS-friendly resume bullets backed by real evidence  
- Clear skill and tool coverage scores  

This project is being built step by step as a **hands-on portfolio project** to demonstrate applied large language model development, workflow automation, and ethical AI practices.

---

## ✨ Features (MVP)
- Upload a resume (PDF, DOCX, or text)  
- Paste a job description for analysis  
- Identify must-have vs. nice-to-have gaps  
- Generate 12-week personalized learning plans  
- Output ATS-optimized resume bullets without fabricating experience  
- Interactive Streamlit web app + REST API (FastAPI)  

---

## 🛠️ Tech Stack
- **Language**: Python 3.11  
- **Backend**: FastAPI, Pydantic  
- **Frontend**: Streamlit  
- **LLM Integration**: OpenAI / Anthropic via LangChain  
- **Vector DB**: Chroma (local) → Pinecone (scalable)  
- **Workflow Automation**: n8n (job fetcher, weekly reports)  
- **Database**: PostgreSQL (via Docker)  

---

## 🚀 Roadmap
- [x] Dev container + Codespaces setup  
- [ ] Resume & job parsers → JSON schema  
- [ ] Rule-based + embedding-based gap analysis  
- [ ] Tailored resume bullets & learning plan generator  
- [ ] Streamlit MVP UI  
- [ ] n8n workflows for automation  
- [ ] Evaluation & public demo  

---

## 📜 Ethics
Career Copilot does **not fabricate experience**. All tailored outputs are based on real evidence from your resume. Inputs are processed securely, and PII is not logged.  

---

## ⚡ Quick Start
Clone and run locally:
```bash
git clone https://github.com/YOUR-USERNAME/career-copilot.git
cd career-copilot
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
streamlit run web/app.py
