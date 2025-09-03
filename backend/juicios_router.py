from fastapi import APIRouter, Query, Body
from pathlib import Path
import pandas as pd
from typing import Optional, Dict, Any
from datetime import datetime
import logging
from fastapi.responses import FileResponse
import tempfile
import os
from io import BytesIO

# Importar lógica
from backend.juicio_logic import procesar_df_juicios

router = APIRouter()

# Configurar logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Carpeta donde están los reportes
REPORTES_FOLDER = Path("reportes_juicios")


try:
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False


# ==============================
# Función para limpiar y cargar Excel
# ==============================
def cargar_excel_limpio(path: Path) -> pd.DataFrame:
    df_raw = pd.read_excel(path, header=None)

    fila_inicio = df_raw.index[df_raw.iloc[:, 0] == "Tipo de Documento"].tolist()
    if not fila_inicio:
        raise ValueError(f"No se encontró encabezado válido en {path.name}")
    fila_inicio = fila_inicio[0]

    df = pd.read_excel(path, header=fila_inicio)
    df = procesar_df_juicios(df)
    df = df.where(pd.notna(df), None)

    # 👇 Aquí para ver qué columnas trae el archivo ya procesado
    print("📌 Columnas después de procesar:", df.columns.tolist())

    return df


# ==============================
# Endpoint: Buscar juicios por filtros
# ==============================
@router.get("/juicios")
def buscar_juicios(
    aprendiz: Optional[str] = Query(None),
    regional: Optional[str] = Query(None),
    centro: Optional[str] = Query(None),
    jornada: Optional[str] = Query(None),
    fecha: Optional[str] = Query(None),
) -> Dict[str, Any]:
    logger.info(f"🔎 Búsqueda de juicios en: {REPORTES_FOLDER.resolve()}")
    archivos = list(REPORTES_FOLDER.glob("*.xls"))
    resultados = []
    archivos_procesados = 0

    for archivo_path in archivos:
        try:
            df = cargar_excel_limpio(archivo_path)

            # Aplicar filtros dinámicos
            if aprendiz and "nombre" in df.columns:
                df = df[df["nombre"].str.contains(aprendiz, case=False, na=False)]
            if regional and "regional" in df.columns:
                df = df[df["regional"].str.contains(regional, case=False, na=False)]
            if centro and "centro_formacion" in df.columns:
                df = df[df["centro_formacion"].str.contains(centro, case=False, na=False)]
            if jornada and "jornada" in df.columns:
                df = df[df["jornada"].str.contains(jornada, case=False, na=False)]
            if fecha and "fecha_juicio" in df.columns:
                df["fecha_juicio_str"] = pd.to_datetime(
                    df["fecha_juicio"], errors="coerce"
                ).dt.strftime("%Y-%m-%d")
                df = df[df["fecha_juicio_str"] == fecha]

            if not df.empty:
                df = df.where(pd.notna(df), None)  # NaN -> None
                for col in df.select_dtypes(include=["datetime64[ns]"]).columns:
                    df[col] = df[col].dt.strftime("%Y-%m-%d")  # fechas -> string
                resultados.extend(df.to_dict(orient="records"))


            archivos_procesados += 1
        except Exception as e:
            logger.error(f"❌ Error procesando {archivo_path.name}: {e}")
            continue

    return {
        "success": True,
        "query": {
            "aprendiz": aprendiz,
            "regional": regional,
            "centro": centro,
            "jornada": jornada,
            "fecha": fecha,
        },
        "archivos_procesados": archivos_procesados,
        "juicios_encontrados": len(resultados),
        "resultados": resultados,
    }


# ==============================
# Endpoint: Resumen estadístico
# ==============================
@router.get("/juicios/estadisticas/resumen")
def resumen_estadisticas() -> Dict[str, Any]:
    logger.info(f"📂 Buscando archivos en: {REPORTES_FOLDER.resolve()}")
    archivos = list(REPORTES_FOLDER.glob("*.xls"))

    logger.info(f"📑 Archivos encontrados: {[a.name for a in archivos]}")

    estadisticas_globales = {
        "fichas_analizadas": 0,
        "total_juicios": 0,
        "aprobados": 0,
        "reprobados": 0,
        "programas": {},
        "centros": []
    }

    try:
        for archivo in archivos:
            try:
                logger.info(f"➡ Procesando archivo: {archivo.name}")
                df = cargar_excel_limpio(archivo)

                estadisticas_globales["fichas_analizadas"] += 1
                estadisticas_globales["total_juicios"] += len(df)

                # Contar aprobados/reprobados
                if "juicio_evaluacion" in df.columns:
                    for estado, cantidad in df["juicio_evaluacion"].value_counts().items():
                        if isinstance(estado, str):
                            estado = estado.strip().upper()
                            if estado == "APROBADO":
                                estadisticas_globales["aprobados"] += int(cantidad)
                            elif estado == "REPROBADO":
                                estadisticas_globales["reprobados"] += int(cantidad)

                # Centros
                if "centro_formacion" in df.columns:
                    centros_validos = [c for c in df["centro_formacion"].unique() if c]
                    estadisticas_globales["centros"].extend(centros_validos)

            except Exception as e:
                logger.error(f"❌ Error procesando {archivo.name}: {e}")
                continue

        # Eliminar duplicados en centros
        estadisticas_globales["centros"] = list(set(estadisticas_globales["centros"]))

        return {
            "success": True,
            "timestamp": datetime.now().isoformat(),
            "estadisticas": estadisticas_globales
        }

    except Exception as e:
        logger.error(f"⚠️ Error general en resumen_estadisticas: {e}")
        return {
            "success": False,
            "error": str(e)
        }


# ==============================
# Endpoint: Generar reportes
# ==============================
@router.get("/juicios/reportes/generar")
def generar_reporte(
    fecha_inicio: Optional[str] = Query(None),
    fecha_fin: Optional[str] = Query(None),
    formato: str = Query("excel"),
    tipo: str = Query("completo"),
    incluir_graficos: Optional[str] = Query("false"),
    incluir_resumen: Optional[str] = Query("false"),
    fichas: Optional[str] = Query(None),
    centro: Optional[str] = Query(None),
    municipio: Optional[str] = Query(None),
    estudiante: Optional[str] = Query(None),  # nombre o cédula
    competencia: Optional[str] = Query(None),
    estado: Optional[str] = Query(None),      # APROBADO, REPROBADO, POR EVALUAR
    compacto: Optional[str] = Query("false"), # "true" para resumen compacto
):
    """
    Genera un reporte filtrado y lo retorna como archivo descargable.
    Permite filtrar por fichas, centro, municipio, estudiante, competencia, estado.
    Si compacto=true, genera resumen por estudiante.
    """
    archivos = list(REPORTES_FOLDER.glob("*.xls"))
    df_total = []
    fichas_list = [f.strip() for f in fichas.split(",")] if fichas else None

    for archivo_path in archivos:
        try:
            df = cargar_excel_limpio(archivo_path)
            # Filtrar por fecha
            if fecha_inicio and "fecha_juicio" in df.columns:
                df = df[
                    pd.to_datetime(df["fecha_juicio"], errors="coerce") >= pd.to_datetime(fecha_inicio)
                ]
            if fecha_fin and "fecha_juicio" in df.columns:
                df = df[
                    pd.to_datetime(df["fecha_juicio"], errors="coerce") <= pd.to_datetime(fecha_fin)
                ]
            # Filtros adicionales
            if fichas_list and "ficha" in df.columns:
                df = df[df["ficha"].astype(str).isin(fichas_list)]
            if centro and "centro_formacion" in df.columns:
                df = df[df["centro_formacion"].str.contains(centro, case=False, na=False)]
            if municipio and "municipio" in df.columns:
                df = df[df["municipio"].str.contains(municipio, case=False, na=False)]
            if estudiante:
                # Buscar por nombre o cédula
                if "nombre" in df.columns:
                    df = df[df["nombre"].str.contains(estudiante, case=False, na=False)]
                if "cedula" in df.columns:
                    df = df[df["cedula"].astype(str).str.contains(estudiante, case=False, na=False)]
            if competencia and "competencia" in df.columns:
                df = df[df["competencia"].str.contains(competencia, case=False, na=False)]
            if estado and "juicio_evaluacion" in df.columns:
                df = df[df["juicio_evaluacion"].str.upper() == estado.upper()]
            df_total.append(df)
        except Exception as e:
            logger.error(f"Error procesando {archivo_path.name}: {e}")
            continue

    if not df_total:
        raise Exception("No hay datos para generar el reporte.")

    df_final = pd.concat(df_total, ignore_index=True)

    # Si compacto, genera resumen por estudiante
    if compacto == "true":
        resumen = []
        # Agrupa por estudiante (nombre y cédula)
        agrupado = df_final.groupby(["nombre", "cedula"])
        for (nombre, cedula), grupo in agrupado:
            total_competencias = grupo.shape[0]
            aprobadas = grupo[grupo["juicio_evaluacion"].str.upper() == "APROBADO"].shape[0]
            reprobadas = grupo[grupo["juicio_evaluacion"].str.upper() == "REPROBADO"].shape[0]
            por_evaluar = grupo[grupo["juicio_evaluacion"].str.upper() == "POR EVALUAR"].shape[0]
            # Si hay reprobadas, muestra detalles de la reprobada
            detalles_reprobada = []
            if reprobadas > 0:
                detalles_reprobada = grupo[grupo["juicio_evaluacion"].str.upper() == "REPROBADO"][["competencia", "resultado_aprendizaje", "fecha_juicio"]].to_dict(orient="records")
            # Si hay por evaluar, muestra detalles
            detalles_por_evaluar = []
            if por_evaluar > 0:
                detalles_por_evaluar = grupo[grupo["juicio_evaluacion"].str.upper() == "POR EVALUAR"][["competencia", "resultado_aprendizaje", "fecha_juicio"]].to_dict(orient="records")
            resumen.append({
                "nombre": nombre,
                "cedula": cedula,
                "total_competencias": total_competencias,
                "aprobadas": aprobadas,
                "reprobadas": reprobadas,
                "por_evaluar": por_evaluar,
                "detalles_reprobada": detalles_reprobada,
                "detalles_por_evaluar": detalles_por_evaluar,
            })
        # Convierte a DataFrame para exportar
        df_final = pd.DataFrame(resumen)

    # Si tipo es resumen, solo deja algunas columnas
    elif tipo == "resumen":
        cols = [c for c in df_final.columns if c in ["nombre", "centro_formacion", "juicio_evaluacion", "fecha_juicio"]]
        df_final = df_final[cols]
    elif tipo == "programas":
        cols = [c for c in df_final.columns if c in ["nombre", "programa", "centro_formacion", "juicio_evaluacion", "fecha_juicio"]]
        df_final = df_final[cols]
    # Si tipo es completo, deja todo

    ext = ".xlsx" if formato == "excel" else f".{formato}"

    # Exportación PDF real si se solicita
    if formato == "pdf":
        if REPORTLAB_AVAILABLE:
            buffer = BytesIO()
            c = canvas.Canvas(buffer, pagesize=letter)
            width, height = letter
            c.setFont("Helvetica", 10)
            y = height - 40
            # Escribe encabezados
            for col in df_final.columns:
                c.drawString(40 + 120 * list(df_final.columns).index(col), y, str(col))
            y -= 20
            # Escribe filas
            for idx, row in df_final.iterrows():
                for col_idx, col in enumerate(df_final.columns):
                    c.drawString(40 + 120 * col_idx, y, str(row[col])[:100])
                y -= 18
                if y < 40:
                    c.showPage()
                    y = height - 40
            c.save()
            buffer.seek(0)
            download_name = f"reporte_{tipo}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
            headers = {"Content-Disposition": f'attachment; filename="{download_name}"'}
            return FileResponse(buffer, headers=headers, media_type="application/pdf")
        else:
            # Si no hay reportlab, exporta CSV y advierte
            logger.warning("ReportLab no disponible, exportando CSV en vez de PDF.")
            ext = ".csv"
            with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
                filename = tmp.name
                df_final.to_csv(filename, index=False)
            download_name = f"reporte_{tipo}_{datetime.now().strftime('%Y%m%d_%H%M%S')}{ext}"
            headers = {"Content-Disposition": f'attachment; filename="{download_name}"'}
            return FileResponse(filename, headers=headers, media_type="text/csv")

    # Exportación Excel/CSV normal
    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
        filename = tmp.name
        if formato == "excel":
            df_final.to_excel(filename, index=False)
        elif formato == "csv":
            df_final.to_csv(filename, index=False)
        else:
            df_final.to_excel(filename, index=False)

    download_name = f"reporte_{tipo}_{datetime.now().strftime('%Y%m%d_%H%M%S')}{ext}"
    headers = {"Content-Disposition": f'attachment; filename="{download_name}"'}

    return FileResponse(filename, headers=headers, media_type="application/octet-stream")


# ==============================
# Endpoint: Juicios filtrados (POST)
# ==============================
@router.post("/juicios-filtrados")
def obtener_juicios_filtrados(filtros: Dict[str, Optional[str]] = Body(...)):
    """
    Recibe los filtros como payload y retorna los juicios filtrados.
    """
    archivos = list(REPORTES_FOLDER.glob("*.xls"))
    resultados = []

    aprendiz = filtros.get("aprendiz")
    regional = filtros.get("regional")
    centro = filtros.get("centro")
    jornada = filtros.get("jornada")
    fecha = filtros.get("fecha")

    for archivo_path in archivos:
        try:
            df = cargar_excel_limpio(archivo_path)
            if aprendiz and "nombre" in df.columns:
                df = df[df["nombre"].str.contains(aprendiz, case=False, na=False)]
            if regional and "regional" in df.columns:
                df = df[df["regional"].str.contains(regional, case=False, na=False)]
            if centro and "centro_formacion" in df.columns:
                df = df[df["centro_formacion"].str.contains(centro, case=False, na=False)]
            if jornada and "jornada" in df.columns:
                df = df[df["jornada"].str.contains(jornada, case=False, na=False)]
            if fecha and "fecha_juicio" in df.columns:
                df["fecha_juicio_str"] = pd.to_datetime(
                    df["fecha_juicio"], errors="coerce"
                ).dt.strftime("%Y-%m-%d")
                df = df[df["fecha_juicio_str"] == fecha]
            if not df.empty:
                df = df.where(pd.notna(df), None)
                for col in df.select_dtypes(include=["datetime64[ns]"]).columns:
                    df[col] = df[col].dt.strftime("%Y-%m-%d")
                resultados.extend(df.to_dict(orient="records"))
        except Exception as e:
            logger.error(f"❌ Error procesando {archivo_path.name}: {e}")
            continue

    return {
        "success": True,
        "filtros": filtros,
        "juicios_encontrados": len(resultados),
        "resultados": resultados,
    }


# ==============================
# Endpoint: Opciones para filtros (GET)
# ==============================
@router.get("/opciones-filtros")
def obtener_opciones_filtros():
    """
    Devuelve listas únicas para los desplegables de regionales, centros y jornadas.
    """
    archivos = list(REPORTES_FOLDER.glob("*.xls"))
    regionales = set()
    centros = set()
    jornadas = set()
    for archivo_path in archivos:
        try:
            df = cargar_excel_limpio(archivo_path)
            if "regional" in df.columns:
                regionales.update(df["regional"].dropna().unique())
            if "centro_formacion" in df.columns:
                centros.update(df["centro_formacion"].dropna().unique())
            if "jornada" in df.columns:
                jornadas.update(df["jornada"].dropna().unique())
        except Exception as e:
            logger.error(f"Error obteniendo opciones: {e}")
            continue
    return {
        "regionales": sorted(regionales),
        "centros": sorted(centros),
        "jornadas": sorted(jornadas),
    }