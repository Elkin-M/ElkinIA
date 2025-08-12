"""
Router para manejo de juicios evaluativos
backend/juicios_router.py
"""

from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import HTMLResponse
from typing import Optional, List, Dict, Any
import pandas as pd
import os
from pathlib import Path
from datetime import datetime

# Configuración
REPORTES_FOLDER = Path("reportes_juicios")

class JuiciosService:
    """Servicio para procesar archivos de juicios evaluativos"""
    
    def __init__(self, reportes_folder: Path):
        self.reportes_folder = reportes_folder
    
    def obtener_archivos_disponibles(self) -> List[str]:
        """Obtiene lista de fichas disponibles basado en archivos .xls"""
        if not self.reportes_folder.exists():
            return []
        
        archivos = list(self.reportes_folder.glob("*.xls"))
        fichas = [archivo.stem for archivo in archivos]
        return sorted(fichas)
    
    def leer_archivo_juicios(self, ficha: str) -> Dict[str, Any]:
        """Lee un archivo .xls específico y lo convierte a formato estructurado"""
        archivo_path = self.reportes_folder / f"{ficha}.xls"
        
        if not archivo_path.exists():
            raise FileNotFoundError(f"No se encontró archivo para ficha {ficha}")
        
        try:
            # Leer el archivo Excel
            df = pd.read_excel(archivo_path, engine='xlrd')
            
            # Extraer información del encabezado
            info_ficha = self._extraer_info_encabezado(df)
            
            # Buscar dónde empiezan los datos tabulares
            inicio_datos = self._encontrar_inicio_datos(df)
            
            if inicio_datos is None:
                raise ValueError("No se encontró la estructura de datos esperada")
            
            # Extraer y procesar los datos de juicios
            datos_juicios = df.iloc[inicio_datos:].copy()
            datos_juicios.columns = datos_juicios.iloc[0]
            datos_juicios = datos_juicios.drop(datos_juicios.index[0])
            
            juicios_procesados = self._procesar_juicios(datos_juicios)
            
            return {
                "ficha": ficha,
                "info_programa": info_ficha,
                "total_juicios": len(juicios_procesados),
                "juicios": juicios_procesados
            }
            
        except Exception as e:
            raise Exception(f"Error procesando archivo {ficha}: {str(e)}")
    
    def _encontrar_inicio_datos(self, df: pd.DataFrame) -> Optional[int]:
        """Encuentra el índice donde empiezan los datos tabulares"""
        for idx, row in df.iterrows():
            if len(row) > 0 and 'Tipo de Documento' in str(row.iloc[0]):
                return idx
        return None
    
    def _extraer_info_encabezado(self, df: pd.DataFrame) -> Dict[str, str]:
        """Extrae información del encabezado del reporte"""
        info = {}
        campos_mapeo = {
            'Fecha del Reporte:': 'fecha_reporte',
            'Ficha de Caracterización:': 'ficha_caracterizacion',
            'Código:': 'codigo',
            'Cógigo:': 'codigo',  # Typo común en los archivos
            'Denominación:': 'denominacion',
            'Estado de la Ficha de Caracterización:': 'estado',
            'Fecha Inicio:': 'fecha_inicio',
            'Fecha Fin:': 'fecha_fin',
            'Modalidad de Formación:': 'modalidad',
            'Regional:': 'regional',
            'Centro de Formación:': 'centro_formacion'
        }
        
        for idx in range(min(15, len(df))):
            row = df.iloc[idx]
            row_str = ' '.join([str(cell) for cell in row if pd.notna(cell)])
            
            for campo, clave in campos_mapeo.items():
                if campo in row_str:
                    info[clave] = self._extraer_valor_campo(row_str, campo)
        
        return info
    
    def _extraer_valor_campo(self, texto: str, campo: str) -> str:
        """Extrae el valor después del campo especificado"""
        if campo in texto:
            partes = texto.split(campo)
            if len(partes) > 1:
                valor = partes[1].strip()
                return valor.split()[0] if valor.split() else ""
        return ""
    
    def _procesar_juicios(self, df_juicios: pd.DataFrame) -> List[Dict[str, Any]]:
        """Procesa los datos de juicios evaluativos"""
        juicios = []
        
        columnas_esperadas = [
            'tipo_documento', 'numero_documento', 'nombre', 'apellidos', 
            'estado', 'competencia', 'resultado_aprendizaje', 'juicio_evaluacion',
            'observaciones', 'fecha_hora_juicio', 'funcionario_registro'
        ]
        
        for _, row in df_juicios.iterrows():
            if pd.isna(row.iloc[0]) or str(row.iloc[0]).strip() == '':
                continue
            
            juicio = {}
            for i, columna in enumerate(columnas_esperadas):
                if i < len(row):
                    juicio[columna] = str(row.iloc[i]) if pd.notna(row.iloc[i]) else ""
                else:
                    juicio[columna] = ""
            
            # Campos calculados
            juicio["nombre_completo"] = f"{juicio['nombre']} {juicio['apellidos']}".strip()
            juicio["aprobado"] = "APROBADO" in juicio.get('juicio_evaluacion', '').upper()
            
            juicios.append(juicio)
        
        return juicios
    
    def aplicar_filtros(self, juicios: List[Dict], **filtros) -> List[Dict]:
        """Aplica filtros a la lista de juicios"""
        resultado = juicios.copy()
        
        if filtros.get('aprendiz'):
            term = filtros['aprendiz'].lower()
            resultado = [j for j in resultado if term in j['nombre_completo'].lower()]
        
        if filtros.get('competencia'):
            term = filtros['competencia'].lower()
            resultado = [j for j in resultado if term in j['competencia'].lower()]
        
        if filtros.get('estado'):
            term = filtros['estado'].upper()
            resultado = [j for j in resultado if term in j['estado'].upper()]
        
        if filtros.get('juicio'):
            term = filtros['juicio'].upper()
            resultado = [j for j in resultado if term in j['juicio_evaluacion'].upper()]
        
        return resultado

# Instanciar el servicio
juicios_service = JuiciosService(REPORTES_FOLDER)

# Crear el router
router = APIRouter(prefix="/juicios", tags=["Juicios Evaluativos"])

@router.get("/fichas-disponibles")
async def obtener_fichas_disponibles():
    """Obtiene la lista de fichas disponibles"""
    try:
        fichas = juicios_service.obtener_archivos_disponibles()
        return {
            "success": True,
            "total_fichas": len(fichas),
            "fichas": fichas
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo fichas: {str(e)}")

@router.get("/")
async def obtener_juicios(
    fichas: Optional[List[str]] = Query(None, description="Lista de fichas específicas"),
    aprendiz: Optional[str] = Query(None, description="Filtrar por nombre de aprendiz"),
    competencia: Optional[str] = Query(None, description="Filtrar por competencia"),
    estado: Optional[str] = Query(None, description="Filtrar por estado"),
    juicio: Optional[str] = Query(None, description="Filtrar por juicio evaluativo"),
    formato: Optional[str] = Query("json", description="Formato de salida: json o resumen")
):
    """Obtiene los juicios evaluativos con filtros opcionales"""
    try:
        fichas_disponibles = juicios_service.obtener_archivos_disponibles()
        
        if not fichas_disponibles:
            raise HTTPException(status_code=404, detail="No se encontraron archivos de juicios")
        
        # Determinar fichas a procesar
        fichas_a_procesar = fichas if fichas else fichas_disponibles
        
        # Validar fichas
        fichas_no_encontradas = [f for f in fichas_a_procesar if f not in fichas_disponibles]
        if fichas_no_encontradas:
            raise HTTPException(
                status_code=404,
                detail=f"Fichas no encontradas: {', '.join(fichas_no_encontradas)}"
            )
        
        resultados = []
        total_juicios = 0
        estadisticas = {"aprobados": 0, "reprobados": 0, "otros": 0}
        
        # Procesar cada ficha
        for ficha in fichas_a_procesar:
            try:
                datos_ficha = juicios_service.leer_archivo_juicios(ficha)
                
                # Aplicar filtros
                filtros = {
                    'aprendiz': aprendiz,
                    'competencia': competencia,
                    'estado': estado,
                    'juicio': juicio
                }
                
                juicios_filtrados = juicios_service.aplicar_filtros(
                    datos_ficha["juicios"], 
                    **{k: v for k, v in filtros.items() if v}
                )
                
                # Calcular estadísticas
                for j in juicios_filtrados:
                    if j["aprobado"]:
                        estadisticas["aprobados"] += 1
                    elif "REPROBADO" in j.get('juicio_evaluacion', '').upper():
                        estadisticas["reprobados"] += 1
                    else:
                        estadisticas["otros"] += 1
                
                datos_ficha["juicios"] = juicios_filtrados
                datos_ficha["total_juicios"] = len(juicios_filtrados)
                
                if formato == "resumen":
                    # Solo información básica para resúmenes
                    datos_ficha = {
                        "ficha": datos_ficha["ficha"],
                        "denominacion": datos_ficha["info_programa"].get("denominacion", "N/A"),
                        "total_juicios": len(juicios_filtrados),
                        "aprobados": sum(1 for j in juicios_filtrados if j["aprobado"]),
                        "estado": datos_ficha["info_programa"].get("estado", "N/A")
                    }
                
                resultados.append(datos_ficha)
                total_juicios += len(juicios_filtrados)
                
            except Exception as e:
                print(f"Error procesando ficha {ficha}: {str(e)}")
                continue
        
        return {
            "success": True,
            "timestamp": datetime.now().isoformat(),
            "total_fichas_procesadas": len(resultados),
            "total_juicios": total_juicios,
            "estadisticas": estadisticas,
            "filtros_aplicados": {
                "fichas": fichas,
                "aprendiz": aprendiz,
                "competencia": competencia,
                "estado": estado,
                "juicio": juicio
            },
            "resultados": resultados
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error procesando juicios: {str(e)}")

@router.get("/{ficha}")
async def obtener_juicios_ficha(ficha: str):
    """Obtiene los juicios de una ficha específica"""
    try:
        datos_ficha = juicios_service.leer_archivo_juicios(ficha)
        return {
            "success": True,
            "data": datos_ficha
        }
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Ficha {ficha} no encontrada")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error procesando ficha {ficha}: {str(e)}")

@router.get("/estadisticas/resumen")
async def obtener_estadisticas():
    """Obtiene estadísticas generales de todas las fichas"""
    try:
        fichas_disponibles = juicios_service.obtener_archivos_disponibles()
        
        estadisticas_globales = {
            "total_fichas": len(fichas_disponibles),
            "fichas_procesadas": 0,
            "total_juicios": 0,
            "aprobados": 0,
            "reprobados": 0,
            "programas": {},
            "centros": set()
        }
        
        for ficha in fichas_disponibles:
            try:
                datos = juicios_service.leer_archivo_juicios(ficha)
                estadisticas_globales["fichas_procesadas"] += 1
                estadisticas_globales["total_juicios"] += len(datos["juicios"])
                
                # Contar aprobados/reprobados
                for juicio in datos["juicios"]:
                    if juicio["aprobado"]:
                        estadisticas_globales["aprobados"] += 1
                    elif "REPROBADO" in juicio.get('juicio_evaluacion', '').upper():
                        estadisticas_globales["reprobados"] += 1
                
                # Programas y centros
                programa = datos["info_programa"].get("denominacion", "N/A")
                centro = datos["info_programa"].get("centro_formacion", "N/A")
                
                if programa not in estadisticas_globales["programas"]:
                    estadisticas_globales["programas"][programa] = 0
                estadisticas_globales["programas"][programa] += 1
                
                estadisticas_globales["centros"].add(centro)
                
            except Exception as e:
                print(f"Error procesando estadísticas de ficha {ficha}: {e}")
                continue
        
        estadisticas_globales["centros"] = list(estadisticas_globales["centros"])
        
        return {
            "success": True,
            "timestamp": datetime.now().isoformat(),
            "estadisticas": estadisticas_globales
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando estadísticas: {str(e)}")