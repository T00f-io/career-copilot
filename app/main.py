from fastapi import FastAPI

app = FastAPI()

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/")
def root():
    return {"message": "Career Copilot API is running!"}

