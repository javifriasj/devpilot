from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import logging
import zipfile
import tempfile
import os
import io
import uuid
from typing import List

app = FastAPI(title="DevPilot Backend API")

# Configurar logging básico
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("devpilot")

# Almacenamiento en memoria para uploads
UPLOADS = {}


@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url}")
    # log some useful headers
    logger.info(f"Headers: Content-Type={request.headers.get('content-type')} Content-Length={request.headers.get('content-length')}")
    response = await call_next(request)
    logger.info(f"Response: {response.status_code} for {request.method} {request.url}")
    return response

# CORS para desarrollo local
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload-zip")
async def upload_zip(request: Request, file: UploadFile = File(...)):
    # logs para depuración de boundary/content-type
    logger.info("Handling /upload-zip")
    logger.info(f"Request content-type: {request.headers.get('content-type')}")
    try:
        if not file.filename.endswith('.zip'):
            raise HTTPException(status_code=400, detail="Solo se permiten archivos .zip")

        contents = await file.read()
        logger.info(f"Received upload {file.filename} size={len(contents)} bytes")

        # Procesar zip en memoria
        try:
            z = zipfile.ZipFile(io.BytesIO(contents))
        except zipfile.BadZipFile:
            raise HTTPException(status_code=400, detail="Archivo ZIP inválido")

        files = []
        for info in z.infolist():
            files.append({
                "path": info.filename,
                "is_dir": info.is_dir(),
                "size": info.file_size,
            })

        upload_id = uuid.uuid4().hex
        # Guardar en memoria (bytes + metadata)
        UPLOADS[upload_id] = {
            "filename": file.filename,
            "bytes": contents,
            "files": files,
        }

        logger.info(f"Stored upload in memory id={upload_id} files={len(files)}")

        return {"id": upload_id, "filename": file.filename, "count": len(files), "files": files}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error procesando upload-zip")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze")
def analyze_repo():
    # Aquí se conectaría con el agente Analyzer y MCP filesystem
    return JSONResponse({"message": "Análisis en desarrollo"})

@app.post("/generate-docs")
def generate_docs():
    # Aquí se conectaría con el agente Docs
    return JSONResponse({"message": "Generación de documentación en desarrollo"})

@app.post("/generate-tests")
def generate_tests():
    # Aquí se conectaría con el agente Coder
    return JSONResponse({"message": "Generación de tests en desarrollo"})

@app.post("/explain-file")
def explain_file():
    # Aquí se conectaría con el agente Analyzer
    return JSONResponse({"message": "Explicación de archivo en desarrollo"})

@app.post("/improve-architecture")
def improve_architecture():
    # Aquí se conectaría con el agente Coder
    return JSONResponse({"message": "Mejora de arquitectura en desarrollo"})
@app.get("/")
async def root():
    return {"message":"devpilot FastAPI backend"}


@app.get("/health")
async def health():
    return {"status":"ok"}


@app.delete("/upload-zip/{upload_id}")
async def delete_upload(upload_id: str):
    logger.info(f"Delete request for upload_id={upload_id}")
    item = UPLOADS.pop(upload_id, None)
    if item is None:
        raise HTTPException(status_code=404, detail="Upload not found")
    # opcional: borrar bytes de memoria explícitamente
    try:
        del item["bytes"]
    except Exception:
        pass
    return JSONResponse({"message": "Removed", "id": upload_id})
