from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import HTMLResponse, FileResponse
from typing import Optional, List, Dict, Any
import pandas as pd
import os
from pathlib import Path
from datetime import datetime
import json
import logging

# Configuración
REPORTES_FOLDER = Path("reportes_juicios")
logger = logging.getLogger(__name__)

# Crear la instancia del router
router = APIRouter()

# 📌 Endpoints de Consulta de Datos

@router.get("/juicios/fichas-disponibles", summary="Obtener Fichas Disponibles")
def obtener_fichas_disponibles():
    """Obtiene una lista de fichas con archivos de reporte disponibles."""
    if not REPORTES_FOLDER.exists():
        return []
    archivos = [archivo.stem for archivo in REPORTES_FOLDER.glob("*.xls")]
    return sorted(archivos)

@router.get("/juicios/{ficha}", summary="Obtener Juicios por Ficha")
def obtener_juicios_por_ficha(ficha: str):
    """
    Obtiene todos los juicios para una ficha específica leyendo el archivo de reporte.
    """
    archivo_path = REPORTES_FOLDER / f"{ficha}.xls"
    if not archivo_path.exists():
        raise HTTPException(status_code=404, detail=f"Archivo para ficha {ficha} no encontrado")

    try:
        df = pd.read_excel(archivo_path)
        data = df.to_dict(orient="records")
        return {
            "success": True,
            "info_programa": {"denominacion": "N/A", "centro_formacion": "N/A"},
            "juicios": data,
        }
    except Exception as e:
        logger.error(f"Error leyendo archivo de Excel: {e}")
        raise HTTPException(status_code=500, detail=f"Error al procesar el archivo: {str(e)}")

@router.get("/juicios/estadisticas/resumen", summary="Obtener Estadísticas")
def obtener_estadisticas_resumen():
    """Calcula y devuelve estadísticas resumidas de todos los juicios."""
    estadisticas_globales = {
        "fichas_analizadas": 0,
        "total_juicios": 0,
        "aprobados": 0,
        "reprobados": 0,
        "programas": {},
        "centros": set()
    }

    try:
        archivos = list(REPORTES_FOLDER.glob("*.xls*"))
        estadisticas_globales["fichas_analizadas"] = len(archivos)

        for archivo in archivos:
            try:
                df = pd.read_excel(archivo)
                datos = {
                    "juicios": df.to_dict(orient="records"),
                    "info_programa": {"denominacion": "N/A", "centro_formacion": "N/A"}
                }
                
                # Contar juicios
                estadisticas_globales["total_juicios"] += len(datos["juicios"])
                
                # Contar aprobados/reprobados
                for juicio in datos["juicios"]:
                    if juicio["aprobado"]:
                        estadisticas_globales["aprobados"] += 1
                    elif "REPROBADO" in juicio.get('juicio_evaluacion', '').upper():
                        estadisticas_globales["reprobados"] += 1

            except Exception as e:
                logger.error(f"Error procesando estadísticas de archivo {archivo.name}: {e}")
                continue
        
        estadisticas_globales["centros"] = list(estadisticas_globales["centros"])
        
        return {
            "success": True,
            "timestamp": datetime.now().isoformat(),
            "estadisticas": estadisticas_globales
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al generar estadísticas: {str(e)}")