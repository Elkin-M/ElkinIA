from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from pydantic import BaseModel
from typing import List
import os
import logging

from fastapi.responses import FileResponse
# Imports corregidos basados en el código del scraper
from backend.database import create_tables, obtener_fichas, insertar_ficha
from backend.juicio_logic import encolar_descarga, procesar_descargas_pendientes
from scraper.run_scraper import ejecutar_scraper  # Importar la clase principal del scraper

# Configuración básica de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Ruta a la carpeta donde se almacenan los reportes
RUTA_REPORTES = Path(__file__).resolve().parent / "reportes_juicios"
BASE_URL = "https://590eb297030e.ngrok-free.app"  # ✅ URL actualizada

# Crear carpeta de reportes si no existe
RUTA_REPORTES.mkdir(exist_ok=True)

# Crear aplicación FastAPI
app = FastAPI(
    title="API de Juicios Evaluativos",
    description="Permite consultar, descargar y gestionar fichas del SENA y sus juicios evaluativos.",
    version="1.0.0"
)

# ✅ CONFIGURACIÓN CORS CORREGIDA
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://elkin-eym8red0s-elkin-ms-projects.vercel.app",  # ✅ Tu URL actual de Vercel
        "https://elkin-lemmgayal-elkin-ms-projects.vercel.app",   # ✅ URL anterior por si acaso
        "http://localhost:3000",    # Para desarrollo local
        "http://localhost:5173",    # Para Vite
        "http://localhost:8080",    # Para otros puertos
        "*"                         # ⚠️ Solo para desarrollo, quitar en producción
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Crear las tablas si no existen
create_tables()

# Montar carpeta de descargas como estáticos
app.mount("/descargas", StaticFiles(directory=RUTA_REPORTES), name="descargas")

# Modelo para validar fichas
class Ficha(BaseModel):
    numero_ficha: str
    denominacion_programa: str = None
    centro: str = None
    municipio: str = None
    estado_reporte: int = 0
    nombre_archivo: str = None

# Modelo para filtros
class FiltrosMapeo(BaseModel):
    centro: str = None
    municipio: str = None
    programa: str = None

# 📌 Endpoint: Listar fichas descargadas como archivos
@app.get("/fichas")
def listar_fichas():
    """
    Devuelve la lista de fichas disponibles en formato JSON.
    """
    if not RUTA_REPORTES.exists():
        raise HTTPException(status_code=500, detail="Directorio de reportes no encontrado")

    archivos = []

    for archivo in RUTA_REPORTES.glob("*.xls*"):  # Incluir .xls y .xlsx
        # Extraer número de ficha del nombre del archivo
        numero_ficha = archivo.stem.split('_')[0] if '_' in archivo.stem else archivo.stem
        
        archivos.append({
            "numero_ficha": numero_ficha,
            "denominacion_programa": "Programa SENA",
            "centro": "Centro SENA",
            "municipio": "Cartagena",
            "estado_descarga": "descargado",  # ✅ Cambié para consistencia con frontend
            "estado_reporte": 1,
            "nombre_archivo": archivo.name,
            "url": f"{BASE_URL}/descargas/{archivo.name}"
        })

    return archivos

# 📌 Endpoint: Agregar ficha a la base de datos
@app.post("/fichas")
def agregar_ficha(ficha: Ficha):
    """
    Guarda una ficha en la base de datos.
    """
    try:
        insertar_ficha(ficha.dict())
        return {"mensaje": "Ficha guardada correctamente"}
    except Exception as e:
        logger.error(f"Error al guardar ficha: {e}")
        raise HTTPException(status_code=500, detail="Error al guardar ficha")

# 📌 Endpoint: Ver descargas pendientes
@app.get("/pendientes")
def ver_pendientes():
    """
    Retorna la cola de descargas pendientes.
    """
    try:
        return procesar_descargas_pendientes()
    except Exception as e:
        logger.error(f"Error obteniendo pendientes: {e}")
        return {"pendientes": [], "mensaje": "Error obteniendo pendientes"}

# 📌 Endpoint: Descargar archivo específico
@app.get("/descargas/{filename}")
def descargar_archivo(filename: str):
    """
    Devuelve el archivo .xls solicitado si existe.
    """
    archivo = RUTA_REPORTES / filename
    if not archivo.exists():
        raise HTTPException(status_code=404, detail="Archivo no encontrado")

    return FileResponse(
        path=archivo, 
        media_type='application/vnd.ms-excel', 
        filename=archivo.name
    )

# 📌 Endpoint: Ejecutar scraper completo
@app.post("/proceso-completo")  # ✅ Cambié a POST para consistencia
def ejecutar_scraper_endpoint(filtros: FiltrosMapeo = None):
    """
    Ejecuta el scraper completo para mapear y descargar fichas.
    """
    try:
        logger.info("Iniciando proceso de scraping completo...")
        scraper = ejecutar_scraper()
        scraper.ejecutar_scraping_completo()
        
        return {
            "status": "success",
            "mensaje": "Scraper ejecutado correctamente",
            "detalles": "Proceso de mapeo y descarga completado",
            "fichas_mapeadas": 0,  # ✅ Agregar para consistencia con frontend
            "descargas_exitosas": 0
        }
    except Exception as e:
        logger.error(f"Error al ejecutar scraper: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error ejecutando scraper: {str(e)}"
        )

# 📌 Endpoint: Solo mapear fichas (sin descargar)
@app.post("/mapear-fichas")  # ✅ Cambié a POST
def mapear_fichas_endpoint(filtros: FiltrosMapeo = None):
    """
    Ejecuta solo el mapeo de fichas disponibles sin descargar juicios.
    """
    try:
        logger.info(f"Iniciando mapeo de fichas con filtros: {filtros}")
        scraper = ejecutar_scraper()
        
        # Crear una versión simplificada que solo mapee
        with scraper.driver_manager.safe_operation():
            scraper._realizar_login()
            scraper._navegar_a_reportes()
            fichas_encontradas = scraper._buscar_y_mapear_fichas()
            
        return {
            "status": "success",
            "mensaje": "Mapeo de fichas completado",
            "fichas_encontradas": len(fichas_encontradas),
            "fichas": fichas_encontradas.to_dict('records') if not fichas_encontradas.empty else []
        }
    except Exception as e:
        logger.error(f"Error en mapeo de fichas: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error en mapeo: {str(e)}"
        )

# 📌 Endpoint: Descargar juicios específicos
@app.post("/descargar-juicios")
def descargar_juicios_especificos(request: dict):
    """
    Descarga juicios para fichas específicas.
    """
    try:
        fichas = request.get("fichas", [])
        logger.info(f"Iniciando descarga de juicios para {len(fichas)} fichas...")
        scraper = ejecutar_scraper()
        
        # Procesar cada ficha
        resultados = []
        for numero_ficha in fichas:
            try:
                ficha_dict = {"NumeroFicha": numero_ficha}
                exito = scraper._descargar_juicio_individual(ficha_dict)
                resultados.append({
                    "ficha": numero_ficha,
                    "estado": "exitoso" if exito else "fallido"
                })
            except Exception as e:
                logger.error(f"Error descargando ficha {numero_ficha}: {e}")
                resultados.append({
                    "ficha": numero_ficha,
                    "estado": "error",
                    "error": str(e)
                })
        
        exitosos = len([r for r in resultados if r["estado"] == "exitoso"])
        fallidos = len(fichas) - exitosos
        
        return {
            "status": "completed",
            "mensaje": f"Descarga completada: {exitosos}/{len(fichas)} exitosas",
            "descargas_exitosas": exitosos,  # ✅ Para consistencia con frontend
            "descargas_fallidas": fallidos,
            "resultados": resultados
        }
    except Exception as e:
        logger.error(f"Error en descarga de juicios: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error en descarga: {str(e)}"
        )

# ✅ NUEVOS ENDPOINTS PARA EL FRONTEND
@app.post("/descargar-ficha/{numero_ficha}")
def descargar_ficha_individual(numero_ficha: str):
    """
    Descarga el juicio para una ficha específica.
    """
    try:
        logger.info(f"Descargando ficha individual: {numero_ficha}")
        scraper = ejecutar_scraper()
        
        ficha_dict = {"NumeroFicha": numero_ficha}
        exito = scraper._descargar_juicio_individual(ficha_dict)
        
        return {
            "status": "success" if exito else "failed",
            "mensaje": f"Descarga {'exitosa' if exito else 'fallida'} para ficha {numero_ficha}",
            "ficha": numero_ficha
        }
    except Exception as e:
        logger.error(f"Error descargando ficha {numero_ficha}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error descargando ficha: {str(e)}"
        )

@app.post("/descargar-bulk")
def descargar_bulk(request: dict):
    """
    Descarga múltiples fichas seleccionadas.
    """
    try:
        fichas = request.get("fichas", [])
        logger.info(f"Descarga bulk de {len(fichas)} fichas")
        scraper = ejecutar_scraper()
        
        resultados = []
        for numero_ficha in fichas:
            try:
                ficha_dict = {"NumeroFicha": numero_ficha}
                exito = scraper._descargar_juicio_individual(ficha_dict)
                resultados.append({
                    "ficha": numero_ficha,
                    "exito": exito
                })
            except Exception as e:
                logger.error(f"Error en descarga bulk ficha {numero_ficha}: {e}")
                resultados.append({
                    "ficha": numero_ficha,
                    "exito": False,
                    "error": str(e)
                })
        
        return {
            "status": "completed",
            "resultados": resultados
        }
    except Exception as e:
        logger.error(f"Error en descarga bulk: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error en descarga bulk: {str(e)}"
        )

# 📌 Endpoint: Estado del sistema
@app.get("/estado")
def estado_sistema():
    """
    Retorna el estado actual del sistema.
    """
    try:
        # Contar archivos descargados
        archivos_descargados = len(list(RUTA_REPORTES.glob("*.xls*")))
        
        return {
            "status": "online",
            "archivos_descargados": archivos_descargados,
            "ruta_reportes": str(RUTA_REPORTES),
            "base_url": BASE_URL
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }

# 📌 Endpoint: Limpiar archivos descargados
@app.delete("/limpiar-descargas")
def limpiar_descargas():
    """
    Elimina todos los archivos descargados.
    """
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
        raise HTTPException(
            status_code=500, 
            detail=f"Error limpiando archivos: {str(e)}"
        )

# 📌 Endpoint raíz
@app.get("/")
def raiz():
    """
    Endpoint raíz con información de la API.
    """
    return {
        "mensaje": "API de Juicios Evaluativos SENA",
        "version": "1.0.0",
        "base_url": BASE_URL,
        "endpoints": {
            "fichas": "/fichas",
            "mapear_fichas": "/mapear-fichas",
            "descargar_juicios": "/descargar-juicios", 
            "proceso_completo": "/proceso-completo",
            "descargar_ficha": "/descargar-ficha/{numero_ficha}",
            "descargar_bulk": "/descargar-bulk",
            "estado": "/estado",
            "docs": "/docs"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)