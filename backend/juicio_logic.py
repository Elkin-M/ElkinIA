from .database import agregar_descarga_pendiente, obtener_descargas_pendientes, actualizar_estado_descarga
import pandas as pd
import time
import logging
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
import os

# Configurar logging
logger = logging.getLogger(__name__)

# Importar clases del scraper original
from scraper.selenium_utils import WebDriverManager, SeleniumUtils

class JuicioLogic:
    def __init__(self, driver_manager):
        self.driver_manager = driver_manager
        self.selenium_utils = SeleniumUtils(driver_manager)

        # Constantes del scraper original
        self.IFRAME_CONTENIDO = 'contenido'
        self.IFRAME_MODAL = "modalDialogContentviewDialog2"
        self.BOTON_ABRIR_BUSCADOR_FICHAS = 'frmForma1:cmdlnkShow145'
        self.INPUT_CODIGO_FICHA_MODAL = 'form:codigoFichaITX'
        self.SELECT_DEPARTAMENTO_MODAL = 'form:departamentoSOM'
        self.SELECT_MUNICIPIO_MODAL = '/html/body[1]/div[2]/form/fieldset/div/table/tbody/tr[2]/td[4]/select'
        self.SELECT_JORNADA_MODAL = 'form:jornadaSOM'
        self.BOTON_CONSULTAR_MODAL = 'form:buscarCBT'
        self.XPATH_TABLA_FICHAS_MODAL = '//*[@id="form:dtFichas"]'
        self.XPATH_BOTON_PAGINACION_NEXT_MODAL = '//*[@id="form:dsFichasnext"]'
        self.BOTON_CONSULTAR_FICHA = '//*[@id="frmForma1:btnConsultar"]'

def procesar_descargas_pendientes():
    """Procesa todas las descargas pendientes en la cola"""
    tareas = obtener_descargas_pendientes()
    juicio_logic = JuicioLogic()
    
    for tarea in tareas:
        id_descarga = tarea['id']
        print(f"\nDescargando juicio para ficha {tarea['NumeroFicha']}...")
        try:
            success = descargar_juicio_evaluacion_por_ficha(tarea, juicio_logic)
            if success:
                actualizar_estado_descarga(id_descarga, 'descargado')
                print(f"✅ Descarga exitosa para ficha {tarea['NumeroFicha']}")
            else:
                actualizar_estado_descarga(id_descarga, 'fallido', 'Descarga fallida')
                print(f"❌ Descarga fallida para ficha {tarea['NumeroFicha']}")
        except Exception as e:
            actualizar_estado_descarga(id_descarga, 'fallido', str(e))
            print(f"💥 Error descargando ficha {tarea['NumeroFicha']}: {e}")
    
    # Cleanup
    juicio_logic.driver_manager.close_driver()

def encolar_descarga(ficha_id):
    """Encola una ficha para descarga"""
    agregar_descarga_pendiente(ficha_id)
    print(f"📋 Ficha {ficha_id} encolada para descarga")

def descargar_juicio_evaluacion_por_ficha(ficha_dict: dict, juicio_logic: JuicioLogic, max_reintentos: int = 3) -> bool:
    """Descarga el juicio de evaluación para una ficha específica"""
    numero_ficha = str(ficha_dict["NumeroFicha"]).strip()
    
    for intento in range(1, max_reintentos + 1):
        logger.info(f"🔄 Intento {intento}/{max_reintentos} para ficha {numero_ficha}")
        
        try:
            with juicio_logic.driver_manager.safe_operation() as driver:
                # Asegurar que estamos en el contexto correcto
                juicio_logic.selenium_utils.safe_switch_to_default()
                
                # Ir al iframe de contenido
                if not juicio_logic.selenium_utils.safe_switch_to_frame(juicio_logic.IFRAME_CONTENIDO):
                    raise Exception("No se pudo acceder al iframe de contenido")
                
                juicio_logic.selenium_utils.wait_for_overlay_disappear()
                
                # Abrir buscador de fichas
                if not juicio_logic.selenium_utils.safe_click(juicio_logic.BOTON_ABRIR_BUSCADOR_FICHAS, By.ID):
                    raise Exception("Error abriendo buscador")
                
                # Cambiar al modal
                if not juicio_logic.selenium_utils.safe_switch_to_frame(juicio_logic.IFRAME_MODAL):
                    raise Exception("No se pudo acceder al modal")
                
                juicio_logic.selenium_utils.wait_for_overlay_disappear()
                
                # Buscar ficha específica
                if not juicio_logic.selenium_utils.safe_send_keys(juicio_logic.INPUT_CODIGO_FICHA_MODAL, numero_ficha, By.ID):
                    raise Exception("Error ingresando código de ficha")
                
                if not juicio_logic.selenium_utils.safe_click(juicio_logic.BOTON_CONSULTAR_MODAL, By.ID):
                    raise Exception("Error ejecutando búsqueda")
                
                juicio_logic.selenium_utils.wait_for_overlay_disappear()
                
                # Seleccionar la ficha
                xpath_seleccion = '//*[@id="form:dtFichas:0:cmdlnkShow"]'
                if not juicio_logic.selenium_utils.safe_click(xpath_seleccion, By.XPATH):
                    raise Exception("Error seleccionando ficha")
                
                # Volver al iframe principal
                juicio_logic.selenium_utils.safe_switch_to_default()
                if not juicio_logic.selenium_utils.safe_switch_to_frame(juicio_logic.IFRAME_CONTENIDO):
                    raise Exception("Error volviendo al iframe de contenido")
                
                juicio_logic.selenium_utils.wait_for_overlay_disappear()
                
                # Preparar para descarga
                archivos_antes = set(os.listdir(juicio_logic.driver_manager.download_dir))
                
                # Ejecutar descarga
                if not juicio_logic.selenium_utils.safe_click(juicio_logic.BOTON_CONSULTAR_FICHA, By.XPATH):
                    raise Exception("Error ejecutando descarga")
                
                # Esperar archivo descargado
                archivo_descargado = _esperar_descarga_completa(juicio_logic.driver_manager.download_dir, archivos_antes)
                if not archivo_descargado:
                    raise Exception("No se completó la descarga")
                
                # Renombrar archivo
                _renombrar_archivo_descargado(archivo_descargado, ficha_dict, juicio_logic.driver_manager.download_dir)
                
                logger.info(f"✅ Descarga exitosa para ficha {numero_ficha}")
                return True
                
        except Exception as e:
            logger.error(f"❌ Intento {intento} fallido para ficha {numero_ficha}: {e}")
            
            if intento == max_reintentos:
                logger.error(f"💥 Todos los intentos fallaron para ficha {numero_ficha}")
                return False
            
            # Pausa antes del siguiente intento
            time.sleep(3)
    
    return False

def manejar_paginacion_modal(filtros: dict, juicio_logic: JuicioLogic) -> pd.DataFrame:
    """Maneja la paginación del modal y extrae todas las fichas"""
    todas_las_fichas = pd.DataFrame()
    fichas_vistas = set()
    pagina_actual = 1
    max_paginas_sin_datos = 3
    paginas_sin_datos = 0
    
    while True:
        logger.info(f"📄 Procesando página {pagina_actual} del modal...")
        
        fichas_antes = len(fichas_vistas)
        df_pagina = _extraer_fichas_pagina_actual(pagina_actual, filtros, fichas_vistas, juicio_logic)
        fichas_nuevas = len(fichas_vistas) - fichas_antes
        
        if fichas_nuevas == 0:
            paginas_sin_datos += 1
            logger.info(f"Sin datos nuevos en página {pagina_actual} ({paginas_sin_datos}/{max_paginas_sin_datos})")
            
            if paginas_sin_datos >= max_paginas_sin_datos:
                logger.info("Finalizando paginación - sin datos nuevos")
                break
        else:
            paginas_sin_datos = 0
            logger.info(f"✅ {fichas_nuevas} fichas nuevas en página {pagina_actual}")
        
        if not df_pagina.empty:
            todas_las_fichas = pd.concat([todas_las_fichas, df_pagina], ignore_index=True)
        
        # Intentar ir a siguiente página
        if not _ir_siguiente_pagina_modal(juicio_logic):
            logger.info("No hay más páginas - finalizando")
            break
            
        pagina_actual += 1
    
    logger.info(f"🗺️ Mapeo completado: {len(todas_las_fichas)} fichas totales")
    return todas_las_fichas

def _extraer_fichas_pagina_actual(pagina: int, filtros: dict, fichas_vistas: set, juicio_logic: JuicioLogic) -> pd.DataFrame:
    """Extrae las fichas de la página actual"""
    fichas_pagina = []
    
    try:
        driver = juicio_logic.driver_manager.get_driver()
        tabla = driver.find_element(By.XPATH, juicio_logic.XPATH_TABLA_FICHAS_MODAL)
        filas = tabla.find_elements(By.XPATH, ".//tbody/tr")
        
        for i, fila in enumerate(filas):
            try:
                numero_ficha = fila.find_element(By.XPATH, ".//td[2]").text.strip()
                nombre_programa = fila.find_element(By.XPATH, ".//td[3]").text.strip()
                fecha_inicio = fila.find_element(By.XPATH, ".//td[4]").text.strip()
                
                if numero_ficha and numero_ficha not in fichas_vistas:
                    xpath_seleccion = f'//*[@id="form:dtFichas:0:cmdlnkShow"]'
                    
                    ficha_data = {
                        'NumeroFicha': numero_ficha,
                        'NombrePrograma': nombre_programa,
                        'FechaInicio': fecha_inicio,
                        'XPathSeleccion': xpath_seleccion,
                        'PaginaModal': pagina,
                        'PosicionEnPagina': i + 1,
                        **{f'filtro_{k}': v for k, v in filtros.items()}
                    }
                    
                    fichas_pagina.append(ficha_data)
                    fichas_vistas.add(numero_ficha)
                    
                    logger.info(f"  ✓ Ficha {numero_ficha} - {nombre_programa}")
            
            except Exception as e:
                logger.error(f"Error procesando fila {i + 1}: {e}")
                continue
    
    except Exception as e:
        logger.error(f"Error extrayendo fichas de página {pagina}: {e}")
    
    return pd.DataFrame(fichas_pagina)

def _ir_siguiente_pagina_modal(juicio_logic: JuicioLogic) -> bool:
    """Intenta ir a la siguiente página del modal"""
    try:
        driver = juicio_logic.driver_manager.get_driver()
        next_btn = driver.find_element(By.XPATH, juicio_logic.XPATH_BOTON_PAGINACION_NEXT_MODAL)
        
        if 'ui-state-disabled' in next_btn.get_attribute('class'):
            return False
        
        driver.execute_script("arguments[0].click();", next_btn)
        juicio_logic.selenium_utils.wait_for_overlay_disappear()
        
        # Esperar que se actualice la tabla
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.XPATH, f"{juicio_logic.XPATH_TABLA_FICHAS_MODAL}//tbody/tr"))
        )
        time.sleep(1)
        return True
        
    except Exception as e:
        logger.error(f"Error navegando a siguiente página: {e}")
        return False

def _esperar_descarga_completa(download_dir: str, archivos_anteriores: set, timeout: int = 120):
    """Espera a que se complete la descarga de un archivo"""
    tiempo_limite = time.time() + timeout
    
    while time.time() < tiempo_limite:
        try:
            archivos_actuales = set(os.listdir(download_dir))
            nuevos_archivos = [
                f for f in archivos_actuales - archivos_anteriores 
                if not f.endswith('.crdownload') and not f.endswith('.tmp')
            ]
            
            if nuevos_archivos:
                archivo_path = os.path.join(download_dir, nuevos_archivos[0])
                
                # Verificar que el archivo esté completamente descargado
                if _verificar_archivo_completo(archivo_path):
                    logger.info(f"📁 Archivo descargado: {nuevos_archivos[0]}")
                    return archivo_path
            
            time.sleep(1)
            
        except Exception as e:
            logger.error(f"Error verificando descarga: {e}")
            time.sleep(1)
    
    logger.error("⏰ Timeout esperando descarga")
    return None

def _verificar_archivo_completo(archivo_path: str, max_intentos: int = 5) -> bool:
    """Verifica que un archivo esté completamente descargado"""
    for _ in range(max_intentos):
        try:
            with open(archivo_path, 'rb'):
                return True
        except (PermissionError, FileNotFoundError):
            time.sleep(0.5)
    return False

def _renombrar_archivo_descargado(archivo_path: str, ficha_dict: dict, download_dir: str):
    """Renombra el archivo descargado con un nombre descriptivo"""
    import shutil
    import re
    
    try:
        numero_ficha = ficha_dict['NumeroFicha']
        programa_slug = _slugify(ficha_dict.get('NombrePrograma', 'programa'))
        
        # Determinar extensión
        _, ext_original = os.path.splitext(archivo_path)
        ext = ext_original.lower() if ext_original.lower() in {'.xls', '.xlsx', '.csv', '.pdf'} else '.xls'
        
        # Crear nuevo nombre
        nuevo_nombre = f"{numero_ficha}_{programa_slug}{ext}"
        nuevo_path = os.path.join(download_dir, nuevo_nombre)
        
        # Evitar sobrescribir archivos existentes
        contador = 1
        while os.path.exists(nuevo_path):
            base_nombre = f"{numero_ficha}_{programa_slug}_{contador}{ext}"
            nuevo_path = os.path.join(download_dir, base_nombre)
            contador += 1
        
        shutil.move(archivo_path, nuevo_path)
        logger.info(f"📝 Archivo renombrado: {os.path.basename(nuevo_path)}")
        
    except Exception as e:
        logger.error(f"Error renombrando archivo: {e}")

def _slugify(texto: str) -> str:
    """Convierte texto a slug seguro para nombres de archivo"""
    import re
    slug = re.sub(r"[^\w\s-]", "", texto, flags=re.UNICODE).strip().lower()
    return re.sub(r"[\s_-]+", "_", slug)[:50]  # Limitar longitud