from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pathlib import Path
from pydantic import BaseModel
from typing import List, Optional
import logging
import time
from datetime import datetime

# Importar las funciones de backend y scraper
from backend.juicio_logic import encolar_descarga
from scraper.run_scraper import ejecutar_scraper

# Importar el router de juicios
from backend.juicios_router import router as juicios_router

# Configuración básica de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Rutas de los directorios
RUTA_REPORTES = Path(__file__).resolve().parent.parent / "reportes_juicios"
STATIC_DIR = Path(__file__).parent / "static"

# Crear carpetas si no existen
RUTA_REPORTES.mkdir(exist_ok=True)
STATIC_DIR.mkdir(exist_ok=True)

# Crear aplicación FastAPI
app = FastAPI(
    title="API de Juicios Evaluativos",
    description="Permite consultar, descargar y gestionar fichas del SENA y sus juicios evaluativos.",
    version="1.0.0"
)

# Configuración CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Montar carpetas estáticas y de descargas
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
app.mount("/descargas", StaticFiles(directory=RUTA_REPORTES), name="descargas")

# ✨ Incluir el router de juicios para que sus endpoints sean accesibles
app.include_router(juicios_router)

# Modelos de datos
class FiltrosMapeo(BaseModel):
    regional: Optional[str] = None
    centro: Optional[str] = None
    jornada: Optional[str] = None
    fecha: Optional[str] = None
    codigo_ficha: Optional[str] = None

class ActionRequest(BaseModel):
    action: str
    filters: FiltrosMapeo

# 📌 Endpoints de Operaciones de Scraping
@app.post("/api/ejecutar_proceso", summary="Ejecutar Proceso de Scraping")
async def ejecutar_proceso_scraper(request_data: ActionRequest):
    """
    Inicia el proceso de web scraping (mapear o descargar) con los filtros proporcionados.
    """
    try:
        accion_seleccionada = request_data.action
        filtros_recibidos = request_data.filters.dict()

        logger.info(f"✅ Solicitud recibida: Acción '{accion_seleccionada}' con filtros: {filtros_recibidos}")

        ejecutar_scraper(filtros_recibidos)
        
        return JSONResponse(content={"status": "success", "message": "Proceso de scraping iniciado."})

    except Exception as e:
        logger.error(f"❌ Error en el endpoint de la API: {e}")
        raise HTTPException(status_code=500, detail=f"Error en el servidor: {str(e)}")

@app.delete("/api/limpiar-descargas", summary="Limpiar Descargas")
def limpiar_descargas():
    """Elimina todos los archivos descargados de la carpeta de reportes."""
    try:
        archivos_eliminados = 0
        for archivo in RUTA_REPORTES.glob("*.xls*"):
            archivo.unlink()
            archivos_eliminados += 1
        return {
            "status": "success",
            "mensaje": f"Se eliminaron {archivos_eliminados} archivos"
        }
    except Exception as e:
        logger.error(f"Error limpiando descargas: {e}")
        raise HTTPException(status_code=500, detail=f"Error limpiando archivos: {str(e)}")

# 📌 Endpoints de Utilidad
@app.get("/health", summary="Health Check")
def health_check():
    """Verifica el estado de salud de la API."""
    return {"status": "healthy"}