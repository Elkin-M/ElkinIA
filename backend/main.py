### backend/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from typing import List
import os
from .database import create_tables, obtener_fichas, insertar_ficha
from .juicio_logic import encolar_descarga, procesar_descargas_pendientes
from scraper.run_scraper import ejecutar_scraper
from scraper.run_scraper import descargar_juicios_evaluacion

# Ruta a la carpeta donde se almacenan los reportes
RUTA_REPORTES = Path(__file__).resolve().parent.parent / "reportes_juicios"
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

create_tables()

@app.get("/fichas")
def listar_fichas():
    archivos = []
    for archivo in RUTA_REPORTES.glob("*.xls"):
        archivos.append({
            "numero_ficha": archivo.stem,
            "denominacion_programa": "Nombre del programa desconocido",
            "centro": "Centro no definido",
            "municipio": "Desconocido",
            "estado_reporte": 1,
            "nombre_archivo": archivo.name,
            "url": f"/descargas/{archivo.name}"
        })
    return archivos

# Servir archivos PDF como estáticos
app.mount("/descargas", StaticFiles(directory=RUTA_REPORTES), name="descargas")


@app.post("/fichas")
def agregar_ficha(ficha: dict):
    insertar_ficha(ficha)
    return {"mensaje": "Ficha guardada"}

@app.get("/pendientes")
def pendientes():
    return procesar_descargas_pendientes()

@app.post("/descargar/{id_ficha}")
def descargar(id_ficha: int):
    try:
        encolar_descarga(id_ficha)
        return {"mensaje": f"Ficha {id_ficha} encolada para descarga"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.get("/ejecutar-scraper")
def ejecutar():
    ejecutar_scraper()
    return {"status": "Scraper ejecutado correctamente"}

@app.get("/descargar-juicios")
def ejecutar():
    descargar_juicios_evaluacion()
    return {"status": "Descargas de juicios encoladas correctamente"}

@app.get("/mapear-fichas")
def mapear_fichas():
    """
    Lanza el scraper completo de manera síncrona.
    Si quisieras que fuera asíncrono, usa threading, Celery, etc.
    """
    try:
        ejecutar_scraper()          # ← aquí llamas a tu función real
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
