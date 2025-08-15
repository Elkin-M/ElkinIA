from fastapi import FastAPI, HTTPException
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
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
from backend.juicios_router import router as juicios_router


# Configuración básica de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Ruta a la carpeta donde se almacenan los reportes
RUTA_REPORTES = Path(__file__).resolve().parent.parent / "reportes_juicios"
BASE_URL = "https://aa6a52a8c27f.ngrok-free.app"  # ✅ URL actualizada

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
        # "https://elkin-eym8red0s-elkin-ms-projects.vercel.app",  # Vercel actual
        # "https://elkin-lemmgayal-elkin-ms-projects.vercel.app",   # Vercel anterior
        # "https://gerardoia.onrender.com",                         # ✅ Render (frontend actual)
        # "http://localhost:3000",                                  # Desarrollo local
        # "http://localhost:5173",                                  # Vite
        # "http://localhost:8080"                                   # Otros puertos
        # "http://127.0.0.1:50268",     # donde se ejecuta tu HTML
        # "http://localhost:5500",      # LiveServer si usas VSCode
        # "https://aa6a52a8c27f.ngrok-free.app"
         "*"  
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuración de carpetas
BASE_DIR = Path(__file__).parent
TEMPLATES_DIR = BASE_DIR / "templates"
STATIC_DIR = BASE_DIR / "static"

# Crear directorios de templates y estáticos si no existen si no existen
TEMPLATES_DIR.mkdir(exist_ok=True)
STATIC_DIR.mkdir(exist_ok=True)

# Configurar Jinja2 para templates y archivos estaticos
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))

# Montar carpeta estática (CSS , JS , imagenes, etc.)
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

# Crear las tablas si no existen
create_tables()

# Montar carpeta de descargas como estáticos
app.mount("/descargas", StaticFiles(directory=RUTA_REPORTES), name="descargas")

# Incluir el router de juicios
app.include_router(juicios_router)



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
@app.get("/proceso-completo")  # ✅ Cambié a POST para consistencia
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
    
@app.get("/juicios-web", response_class=HTMLResponse)
async def juicios_web_view():
    """Sirve la interfaz web para consultar juicios."""
    try:
        #leer el archivo html que creamos
        html_file = TEMPLATES_DIR / "juicios.html"
        
        if not html_file.exists():
            #si no existe el archivo, crear uno basico
            crear_archivo_html_basico()

        with open(html_file, 'r', encoding='utf-8') as f:
            return f.read()
        
    except Exception as e:
        return f"""
        <!DOCTYPE html>
        <html>
        <head><title>Error</title></head>
        <body>
            <h1>Error cargando la interfaz</h1>
            <p>Error: {str(e)}</p>
            <p>Por favor, verifique que el archivo templates/juicios.html existe.</p>
        </body>
        </html>
        """
    
def crear_archivo_html_basico():
    """Crea un archivo HTML básico si no existe"""
    html_content = """<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Consulta de Juicios - SENA Bolívar</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
        .header { background: #2c5aa0; color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .filters { background: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .btn { background: #2c5aa0; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
        .btn:hover { background: #1e3c72; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎓 Consulta de Juicios Evaluativos</h1>
            <p>SENA Regional Bolívar</p>
        </div>
        
        <div class="filters">
            <h3>Filtros de Búsqueda</h3>
            <p><strong>Fichas:</strong> <input type="text" id="fichas" placeholder="Ej: 23492,25958"></p>
            <p><strong>Aprendiz:</strong> <input type="text" id="aprendiz" placeholder="Nombre del aprendiz"></p>
            <p><strong>Competencia:</strong> <input type="text" id="competencia" placeholder="Buscar competencia"></p>
            <p><strong>Resultado:</strong> 
                <select id="juicio">
                    <option value="">Todos</option>
                    <option value="APROBADO">Aprobado</option>
                    <option value="REPROBADO">Reprobado</option>
                </select>
            </p>
            <button class="btn" onclick="buscarJuicios()">🔍 Buscar</button>
            <button class="btn" onclick="limpiarFiltros()">🗑️ Limpiar</button>
        </div>
        
        <div id="resultados">
            <p>Utilice los filtros para consultar los juicios evaluativos.</p>
        </div>
    </div>
    
    <script>
        async function buscarJuicios() {
            const fichas = document.getElementById('fichas').value;
            const aprendiz = document.getElementById('aprendiz').value;
            const competencia = document.getElementById('competencia').value;
            const juicio = document.getElementById('juicio').value;
            
            const params = new URLSearchParams();
            if (fichas) fichas.split(',').forEach(f => params.append('fichas', f.trim()));
            if (aprendiz) params.append('aprendiz', aprendiz);
            if (competencia) params.append('competencia', competencia);
            if (juicio) params.append('juicio', juicio);
            
            try {
                const response = await fetch(`/juicios/?${params}`);
                const data = await response.json();
                
                let html = `<h3>Resultados (${data.total_juicios} juicios encontrados)</h3>`;
                
                data.resultados.forEach(ficha => {
                    html += `
                        <div style="border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px;">
                            <h4>📋 Ficha ${ficha.ficha} - ${ficha.info_programa.denominacion || 'N/A'}</h4>
                            <p><strong>Total juicios:</strong> ${ficha.total_juicios}</p>
                            
                            <table border="1" style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                                <tr style="background: #2c5aa0; color: white;">
                                    <th style="padding: 8px;">Aprendiz</th>
                                    <th style="padding: 8px;">Competencia</th>
                                    <th style="padding: 8px;">Juicio</th>
                                    <th style="padding: 8px;">Fecha</th>
                                </tr>
                    `;
                    
                    ficha.juicios.forEach(juicio => {
                        html += `
                            <tr>
                                <td style="padding: 8px;">${juicio.nombre_completo}</td>
                                <td style="padding: 8px;">${juicio.competencia.substring(0, 50)}...</td>
                                <td style="padding: 8px; color: ${juicio.aprobado ? 'green' : 'red'};">
                                    <strong>${juicio.juicio_evaluacion}</strong>
                                </td>
                                <td style="padding: 8px;">${juicio.fecha_hora_juicio}</td>
                            </tr>
                        `;
                    });
                    
                    html += '</table></div>';
                });
                
                document.getElementById('resultados').innerHTML = html;
                
            } catch (error) {
                document.getElementById('resultados').innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
            }
        }
        
        function limpiarFiltros() {
            document.getElementById('fichas').value = '';
            document.getElementById('aprendiz').value = '';
            document.getElementById('competencia').value = '';
            document.getElementById('juicio').value = '';
            document.getElementById('resultados').innerHTML = '<p>Utilice los filtros para consultar los juicios evaluativos.</p>';
        }
    </script>
</body>
</html>"""
    
    with open(TEMPLATES_DIR / "juicios.html", 'w', encoding='utf-8') as f:
        f.write(html_content)

# Mantén todas tus rutas existentes aquí...
# Por ejemplo, si tienes rutas para scraping:

# @app.post("/scraper/ejecutar")
# async def ejecutar_scraper():
#     # Tu lógica existente
#     pass

# @app.get("/fichas")  
# async def obtener_fichas():
#     # Tu lógica existente
#     pass



#health check 
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return{
        "status": "healthy",
        "service": "SENA Bolivar System",
        "endpoints_available": [
            "GET /juicios - Consulta los juicios evaluativos con filtros",
            "GET /juicios/{ficha} - juicios de una ficha especificada",
            "GET /juicios/fichas-disponibles - lista de fichas disponibles",
            "GET /juicios/estadisticas/resumen - Estadisticas Globales",
            "GET /juicios-web - Interfaz web para consultar juicios"
        ]        
    }
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)



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
            "docs": "/docs",
            "juicios": "/juicios",
            "juicios_html": "/juicios-web",
            "fichas_disponibles": "/juicios/fichas-disponibles",
            "estadisticas": "/juicios/estadisticas/resumen"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)