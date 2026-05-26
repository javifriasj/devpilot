from fastapi import FastAPI

app = FastAPI(title="devpilot-backend")

@app.get("/")
async def root():
    return {"message":"devpilot FastAPI backend"}

@app.get("/health")
async def health():
    return {"status":"ok"}
