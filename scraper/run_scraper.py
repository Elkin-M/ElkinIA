from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import TimeoutException, NoSuchElementException, WebDriverException, ElementClickInterceptedException, StaleElementReferenceException, NoSuchFrameException
import time
#----------------------Hilos-----------------------------
from concurrent.futures import ThreadPoolExecutor
#--------------------------------------------------------
import traceback
import json
import requests
import pandas as pd
from datetime import datetime, timedelta
import sqlite3
import os, re, time, shutil
from backend.uploader_drive import subir_archivo_individual_a_drive


# --- Configuración para el control de versiones ---
from hashlib import sha256
from datetime import datetime
from pathlib import Path

# --- OPCIÓN 1: Variable global con inicialización perezosa ---
GAS_URL = "https://script.google.com/macros/s/AKfycby17IUaE5GI71cIUjewXA9_2nuHJgQiAVgy7d2_oi53nH9efjzBqWilSTzEAKPbkR0z/exec"
driver = None  # Solo declara la variable, no inicializa el driver
VERSIONS_FILE = Path(__file__).resolve().parent / "datos" / "versiones_juicios.json"

#----------------------Hilos----------------------------------
executor_postprocesamiento = ThreadPoolExecutor(max_workers=6)
#-------------------------------------------------------------

# ====================================================================
# OPTIMIZACIÓN DE CLICS - BASADO EN ANÁLISIS DE LOGS
# ====================================================================
# Elementos que SIEMPRE fallan con clic normal y requieren JavaScript directo

JAVASCRIPT_ONLY_ELEMENTS = {
    'frmForma1:cmdlnkShow145',  # Modal de búsqueda de fichas
    '//*[@id="form:dtFichas:0:cmdlnkShow"]'  # Selección de ficha específica
}

# Elementos que SIEMPRE funcionan con clic normal
NORMAL_CLICK_ONLY_ELEMENTS = {
    'form:buscarCBT',  # Botones de búsqueda en modal
    '//*[@id="frmForma1:btnConsultar"]',  # Botón consultar final
    # Navegación de submenús (siempre funcionan)
    '/html/body[1]/div[1]/div[1]/nav/div[2]/div/div/form[2]/ul/li[6]/ul/li[1]/a',
    '/html/body[1]/div[1]/div[1]/nav/div[2]/div/div/form[2]/ul/li[6]/ul/li[1]/ul/li[3]/a',
    '/html/body[1]/div[1]/div[1]/nav/div[2]/div/div/form[2]/ul/li[6]/ul/li[1]/ul/li[3]/ul/li[4]/a'
}

# Elementos que tienen overlay inicial (necesitan espera + clic normal)
OVERLAY_ELEMENTS = {
    '/html/body[1]/div[1]/div[1]/nav/div[2]/div/div/form[2]/ul/li[6]/a'  # Menú principal
}

def wait_for_overlay_to_disappear(driver, timeout=10):
    """
    Espera específicamente a que desaparezcan los overlays que interceptan clics
    """
    overlays_to_wait = [
        ".blockUI.blockOverlay",
        ".dialogUnderlay",
        "[style*='z-index: 2000']",
        "[style*='z-index: 998']",
        "div.blockUI.blockOverlay",
        "div.dialogUnderlay[style*='display: block']"
    ]
    
    for overlay in overlays_to_wait:
        try:
            WebDriverWait(driver, timeout).until_not(
                EC.presence_of_element_located((By.CSS_SELECTOR, overlay))
            )
        except TimeoutException:
            continue  # Si no encuentra el overlay, continúa
    
    # También esperar que no haya elementos con opacity específica que bloqueen
    try:
        WebDriverWait(driver, 5).until_not(
            EC.presence_of_element_located((By.XPATH, "//div[contains(@style,'opacity: 0.4')]"))
        )
    except TimeoutException:
        pass

def click_with_javascript(driver, locator, by_method=By.ID, timeout=10):
    """
    Ejecuta clic usando JavaScript directamente
    """
    try:
        element = WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located((by_method, locator))
        )
        driver.execute_script("arguments[0].click();", element)
        print(f"✅ Clic exitoso con JavaScript en: '{locator}'")
        return True
    except Exception as e:
        print(f"❌ Error en clic JavaScript para '{locator}': {e}")
        return False

def click_normal_optimized(driver, locator, by_method=By.ID, timeout=10):
    """
    Ejecuta clic normal optimizado
    """
    try:
        element = WebDriverWait(driver, timeout).until(
            EC.element_to_be_clickable((by_method, locator))
        )
        element.click()
        method_name = "ID" if by_method == By.ID else "XPATH" if by_method == By.XPATH else str(by_method)
        print(f"✅ Clic normal exitoso en '{locator}' usando {method_name}")
        return True
    except Exception as e:
        print(f"❌ Error en clic normal para '{locator}': {e}")
        return False

def llamar_click_optimizado(locator, timeout=20, by_method=By.XPATH):
    """
    FUNCIÓN OPTIMIZADA que reemplaza a llamar_click_solo()
    Usa estrategias específicas basadas en el análisis de logs
    """
    elemento_selector = locator
    
    print(f"🎯 Ejecutando clic optimizado en: {elemento_selector}")
    
    # ESTRATEGIA 1: JavaScript directo para elementos problemáticos
    if elemento_selector in JAVASCRIPT_ONLY_ELEMENTS:
        print("📱 Usando JavaScript directo (patrón identificado)")
        if click_with_javascript(driver, locator, by_method, timeout):
            return
        else:
            raise Exception(f"Falló JavaScript para elemento crítico: {locator}")
    
    # ESTRATEGIA 2: Clic normal directo para elementos confiables  
    elif elemento_selector in NORMAL_CLICK_ONLY_ELEMENTS:
        print("🔧 Usando clic normal directo (patrón confiable)")
        if click_normal_optimized(driver, locator, by_method, timeout):
            return
        else:
            # Fallback a JavaScript si falla inesperadamente
            print("⚠️ Clic normal falló inesperadamente, probando JavaScript...")
            if click_with_javascript(driver, locator, by_method, timeout):
                return
            else:
                raise Exception(f"Falló ambos métodos para elemento confiable: {locator}")
    
    # ESTRATEGIA 3: Esperar overlay + clic normal
    elif elemento_selector in OVERLAY_ELEMENTS:
        print("⏳ Esperando que desaparezca overlay + clic normal")
        wait_for_overlay_to_disappear(driver, timeout=15)
        time.sleep(1)  # Pausa adicional tras desaparecer overlay
        
        if click_normal_optimized(driver, locator, by_method, timeout):
            return
        else:
            # Fallback a JavaScript
            print("⚠️ Clic normal falló tras esperar overlay, probando JavaScript...")
            if click_with_javascript(driver, locator, by_method, timeout):
                return
            else:
                raise Exception(f"Falló ambos métodos para elemento con overlay: {locator}")
    
    # ESTRATEGIA 4: Comportamiento adaptativo (1 intento normal + JavaScript)
    else:
        print("🔄 Usando estrategia adaptativa (1 normal + JavaScript)")
        
        # Esperar overlays preventivamente
        wait_for_overlay_to_disappear(driver, timeout=5)
        
        # 1 intento normal
        if click_normal_optimized(driver, locator, by_method, timeout):
            return
        
        # Fallback inmediato a JavaScript
        print("🔀 Cambiando a JavaScript tras fallo normal...")
        if click_with_javascript(driver, locator, by_method, timeout):
            return
        
        # Si ambos fallan, lanzar excepción
        raise Exception(f"Ambos métodos fallaron para: {locator}")



def get_driver():
    """
    Función que retorna el driver, inicializándolo si es necesario
    """
    global driver
    if driver is None:
        print("Inicializando WebDriver...")
        
        # Configuración del driver
        chrome_options = Options()
        chrome_options.add_argument("--start-maximized")
        chrome_options.add_argument("--disable-notifications")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--remote-debugging-port=9222")

        
        # Configuraciones para descarga automática
        DOWNLOAD_DIR = os.path.abspath(os.path.join(os.getcwd(), "reportes_juicios"))
        os.makedirs(DOWNLOAD_DIR, exist_ok=True)
        print(f"Carpeta de descargas creada: {DOWNLOAD_DIR}")

        prefs = {
            "download.default_directory": DOWNLOAD_DIR,
            "download.prompt_for_download": False,
            "download.directory_upgrade": True,
            "safeBrowse.enabled": True
        }
        chrome_options.add_experimental_option("prefs", prefs)
        
        # Ruta del driver
        ruta_driver = "/usr/local/bin/chromedriver"
        service = Service(ruta_driver)
        
        # Crear el driver
        driver = webdriver.Chrome(service=service, options=chrome_options)
        print("WebDriver inicializado correctamente")
    
    return driver

def close_driver():
    """
    Función para cerrar el driver cuando ya no se necesite
    """
    global driver
    if driver is not None:
        driver.quit()
        driver = None
        print("WebDriver cerrado")


def inicializar_driver():
    """
    Inicializa el WebDriver con todas las configuraciones necesarias
    """
    global driver
    
    if driver is not None:
        print("⚠️ WebDriver ya está inicializado")
        return driver
    
    print("🚀 Inicializando WebDriver...")
    
    try:
        # Crear la carpeta de descargas si no existe
        if not os.path.exists(DOWNLOAD_DIR):
            os.makedirs(DOWNLOAD_DIR)
            print(f"📁 Carpeta de descargas creada: {DOWNLOAD_DIR}")
        else:
            print(f"📁 Carpeta de descargas existente: {DOWNLOAD_DIR}")

        # Configurar opciones de Chrome
        chrome_options = Options()
        chrome_options.add_argument("--start-maximized")
        chrome_options.add_argument("--disable-notifications")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--remote-debugging-port=9222")

        # Configuraciones para descarga automática
        prefs = {
            "download.default_directory": DOWNLOAD_DIR,
            "download.prompt_for_download": False,
            "download.directory_upgrade": True,
            "safeBrowse.enabled": True
        }
        chrome_options.add_experimental_option("prefs", prefs)

        # Ruta del driver
        ruta_driver = "/usr/local/bin/chromedriver"
        service = Service(ruta_driver)

        # Crear el driver
        driver = webdriver.Chrome(service=service, options=chrome_options)
        print("✅ WebDriver inicializado correctamente")
        
        return driver
        
    except Exception as e:
        print(f"❌ Error al inicializar WebDriver: {e}")
        raise

def cerrar_driver():
    """
    Cierra el WebDriver si está activo
    """
    global driver
    if driver is not None:
        try:
            driver.quit()
            driver = None
            print("🔒 WebDriver cerrado correctamente")
        except Exception as e:
            print(f"⚠️ Error al cerrar WebDriver: {e}")
            driver = None

# --- OPCIÓN 2: Clase para manejar el WebDriver ---
class WebDriverManager:
    def __init__(self):
        self.driver = None
        self.download_dir = os.path.join(os.getcwd(), "reportes_juicios")
        self.ruta_driver = "/usr/local/bin/chromedriver"
        
    def get_driver(self):
        """Retorna el driver, inicializándolo si es necesario"""
        if self.driver is None:
            self._initialize_driver()
        return self.driver
    
    def _initialize_driver(self):
        """Inicializa el WebDriver con todas las configuraciones"""
        print("Inicializando WebDriver...")
        
        # Crear carpeta de descargas si no existe
        if not os.path.exists(self.download_dir):
            os.makedirs(self.download_dir)
            print(f"Carpeta de descargas creada: {self.download_dir}")
        
        # Configurar opciones de Chrome
        chrome_options = Options()
        chrome_options.add_argument("--start-maximized")
        chrome_options.add_argument("--disable-notifications")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--remote-debugging-port=9222")

        
        prefs = {
            "download.default_directory": self.download_dir,
            "download.prompt_for_download": False,
            "download.directory_upgrade": True,
            "safeBrowse.enabled": True
        }
        chrome_options.add_experimental_option("prefs", prefs)
        
        # Crear el driver
        service = Service(self.ruta_driver)
        self.driver = webdriver.Chrome(service=service, options=chrome_options)
        print("WebDriver inicializado correctamente")
    
    def close_driver(self):
        """Cierra el driver si está activo"""
        if self.driver is not None:
            self.driver.quit()
            self.driver = None
            print("WebDriver cerrado")
    
    def restart_driver(self):
        """Reinicia el driver (útil para recuperarse de errores)"""
        self.close_driver()
        self._initialize_driver()

# --- Configuración Global ---
estado = ""
ficha = ""
url = "http://senasofiaplus.edu.co/sofia-public/"
usuario_login = "1050962935"
contrasena_login = "PapaJose92805331050*"

# Instanciar el manager del driver (OPCIÓN 2)
driver_manager = WebDriverManager()

# --- Base de Datos SQLite ---
DB_NAME = 'sena_datos.db'
conn = None


# --- Definición de XPaths y IDs ---
# XPaths para el inicio de sesión
XPATH_BOTON_INGRESAR = "//a[contains(text(), 'Ingresar')]"
XPATH_INPUT_USUARIO_LOGIN = "/html/body/form/div/div/div/div[2]/input"
XPATH_INPUT_CONTRASENA_LOGIN = "/html/body/form/div/div/div/div[3]/input"
XPATH_BOTON_LOGIN_FORM = "/html/body/form/div/div/div/div[7]/input"

# XPaths para la navegación específica del rol de "Gestión Desarrollo Curricular"
XPATH_SELECT_ROL_DROPDOWN = '//*[@id="seleccionRol:roles"]'
XPATH_MENU_GESTION_DESARROLLO_CURRICULAR = 'Gestión Desarrollo Curricular'
XPATH_MENU_EJECUCION_FORMACION_GDC = '/html/body[1]/div[1]/div[1]/nav/div[2]/div/div/form[2]/ul/li[6]/a'
XPATH_MENU_ADMINISTRAR_RUTA_APRENDIZAJE_GDC = '/html/body[1]/div[1]/div[1]/nav/div[2]/div/div/form[2]/ul/li[6]/ul/li[1]/a'
XPATH_MENU_REPORTES_GDC = '/html/body[1]/div[1]/div[1]/nav/div[2]/div/div/form[2]/ul/li[6]/ul/li[1]/ul/li[3]/a'
XPATH_MENU_REPORTES_JUICIOS_EVALUACION_GDC = '/html/body[1]/div[1]/div[1]/nav/div[2]/div/div/form[2]/ul/li[6]/ul/li[1]/ul/li[3]/ul/li[4]/a'
XPATH_BOTON_PAGINACION_PREV_MODAL = '//*[@id="form:dsFichasprevious"]'

# XPaths para la selección de ficha de caracterización (dentro del iframe 'contenido')
XPATH_BOTON_ABRIR_BUSCADOR_FICHAS = 'frmForma1:cmdlnkShow145'

# --- IDs y XPaths del Modal ---
# El iframe del modal se llama "modalDialogContentviewDialog2"
XPATH_INPUT_CODIGO_FICHA_MODAL = 'form:codigoFichaITX'
XPATH_INPUT_FECHA_INICIAL_MODAL = '/html/body[1]/div[2]/form/fieldset/div/table/tbody/tr[3]/td[2]/div/input'
XPATH_INPUT_FECHA_FINAL_MODAL = '/html/body[1]/div[2]/form/fieldset/div/table/tbody/tr[4]/td[2]/div/input'
XPATH_SELECT_DEPARTAMENTO_MODAL = 'form:departamentoSOM'
XPATH_SELECT_MUNICIPIO_MODAL = '/html/body[1]/div[2]/form/fieldset/div/table/tbody/tr[2]/td[4]/select'
XPATH_SELECT_JORNADA_MODAL = 'form:jornadaSOM'
XPATH_BOTON_CONSULTAR_MODAL = 'form:buscarCBT'
IFRAME_CONTENIDO_ID = 'contenido'
XPATH_BOTON_PAGINACION_PRIMERO_MODAL = '//*[@id="form:dsFichasidx1"]'

# --- Actualizado: XPath para la tabla de resultados del modal ---
XPATH_TABLA_FICHAS_MODAL_ROOT = '//*[@id="form:dtFichas"]'
# --- Corrección: XPath para el botón de siguiente página en el modal ---
XPATH_BOTON_PAGINACION_NEXT_MODAL_SIMPLE = '//*[@id="form:dsFichasnext"]'


# XPaths para la navegación final y extracción de datos
XPATH_BOTON_CONSULTAR_FICHA = '//*[@id="frmConsulta:btnSearch"]'
XPATH_BOTON_CONTENIDO_TABLA = '//*[@id="frmConsulta:j_id_jsp_2083795539_119"]'
XPATH_TABLA_RESULTADOS = '//*[@id="frmConsulta:dtResultadosJuicios"]' # Esta es la tabla final de juicios
XPATH_MATERIA_TEMPLATE = '//*[@id="frmConsulta:dtResultadosJuicios:{}:j_id_jsp_1471184667_23"]'
XPATH_ESTADO_TEMPLATE = '//*[@id="frmConsulta:dtResultadosJuicios:{}:siAprobado"]'

# XPath para el overlay de carga (se usa para esperar que desaparezca)
XPATH_BLOCKUI_OVERLAY = "//div[contains(@class, 'blockUI blockOverlay')]"
IFRAME_MODAL_ID = "modalDialogContentviewDialog2" # ID del iframe del modal
DOWNLOAD_DIR = "/home/sennova/Documentos/sennova/reportes_juicios"   # ⚠️ Ajusta tu carpeta de descargas 

# --- Funciones de Base de Datos ---

def connect_db():
    """Establece la conexión a la base de datos SQLite."""
    global conn, cursor
    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        print(f"Conectado a la base de datos: {DB_NAME}")
    except sqlite3.Error as e:
        print(f"Error al conectar a la base de datos: {e}")
        raise

def create_tables():
    try:
        # Tabla 'fichas' con columnas de filtro y navegación
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS fichas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                numero_ficha TEXT UNIQUE,
                denominacion_programa TEXT, -- Cambiado de 'nombre_programa' para consistencia con DF
                departamento TEXT, -- Columna 'departamento' faltaba en la creación inicial de tu versión
                municipio TEXT,    -- Columna 'municipio' faltaba en la creación inicial de tu versión
                jornada TEXT,      -- Columna 'jornada' faltaba en la creación inicial de tu versión
                fecha_inicio TEXT,
                fecha_fin TEXT,    -- Columna 'fecha_fin' faltaba en la creación inicial de tu versión
                estado TEXT,       -- Columna 'estado' faltaba en la creación inicial de tu versión
                filtro_codigo_ficha TEXT, -- Esta columna puede que también falte
                filtro_departamento TEXT,
                filtro_municipio TEXT,
                filtro_fecha_inicial TEXT,
                filtro_fecha_final TEXT,
                filtro_jornada TEXT,
                -- Nuevas columnas para navegación
                pagina_modal_encontrada INTEGER,
                posicion_en_pagina INTEGER,
                xpath_seleccion_ficha TEXT,
                fecha_extraccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit() # Commit para asegurar que la tabla base exista antes de añadir columnas

        # Lógica para añadir columnas si la tabla ya existe pero le faltan (migración básica)
        existing_columns = [col[1] for col in cursor.execute("PRAGMA table_info(fichas)").fetchall()]
        
        columns_to_add = {
            "denominacion_programa": "TEXT", # Añadir si no existe
            "departamento": "TEXT",          # Añadir si no existe
            "municipio": "TEXT",             # Añadir si no existe
            "jornada": "TEXT",               # Añadir si no existe
            "fecha_fin": "TEXT",             # Añadir si no existe
            "estado": "TEXT",                # Añadir si no existe
            "filtro_codigo_ficha": "TEXT",   # Añadir si no existe
            "filtro_departamento": "TEXT",
            "filtro_municipio": "TEXT",
            "filtro_fecha_inicial": "TEXT",
            "filtro_fecha_final": "TEXT",
            "filtro_jornada": "TEXT",
            "pagina_modal_encontrada": "INTEGER",
            "posicion_en_pagina": "INTEGER",
            "xpath_seleccion_ficha": "TEXT"
        }

        # La columna 'xpath_tabla_resultados' de tu versión anterior parece que ya no es necesaria con el nuevo 'xpath_seleccion_ficha'.
        # Si no se usa en otra parte, se podría omitir su adición, o considerarla obsoleta.
        # Por ahora, la he omitido de 'columns_to_add' ya que el nuevo diseño usa 'xpath_seleccion_ficha'.
        # Si la necesitas, vuelve a añadirla.

        for col_name, col_type in columns_to_add.items():
            if col_name not in existing_columns:
                try:
                    cursor.execute(f"ALTER TABLE fichas ADD COLUMN {col_name} {col_type}")
                    print(f"Columna '{col_name}' añadida a la tabla 'fichas'.")
                except sqlite3.OperationalError as e:
                    print(f"Advertencia: No se pudo añadir la columna '{col_name}': {e}")
        conn.commit()

        # Tabla 'juicios_evaluacion'
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS juicios_evaluacion (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                numero_ficha TEXT,
                materia TEXT,
                estado_materia TEXT, -- Mantenido 'estado_materia' para consistencia con tu último mapeo
                fecha_extraccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (numero_ficha) REFERENCES fichas(numero_ficha)
            )
        ''')
        conn.commit()
        print("Tablas 'fichas' y 'juicios_evaluacion' verificadas/creadas.")
    except sqlite3.Error as e:
        print(f"Error al crear tablas: {e}")
        raise

def insert_ficha(numero_ficha, denominacion_programa, departamento, municipio, jornada, fecha_inicio, fecha_fin, estado,
                 filtro_codigo_ficha, filtro_departamento, filtro_municipio, filtro_fecha_inicial, filtro_fecha_final, filtro_jornada,
                 pagina_modal_encontrada=None, posicion_en_pagina=None, xpath_seleccion_ficha=None):
    """
    Inserta una ficha y sus detalles (incluyendo filtros y datos de navegación)
    en la tabla 'fichas' si no existe.
    """
    try:
        cursor.execute('''
            INSERT OR IGNORE INTO fichas (
                numero_ficha, denominacion_programa, departamento, municipio, jornada,
                fecha_inicio, fecha_fin, estado, filtro_codigo_ficha, filtro_departamento,
                filtro_municipio, filtro_fecha_inicial, filtro_fecha_final, filtro_jornada,
                pagina_modal_encontrada, posicion_en_pagina, xpath_seleccion_ficha
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (numero_ficha, denominacion_programa, departamento, municipio, jornada,
              fecha_inicio, fecha_fin, estado, filtro_codigo_ficha, filtro_departamento,
              filtro_municipio, filtro_fecha_inicial, filtro_fecha_final, filtro_jornada,
              pagina_modal_encontrada, posicion_en_pagina, xpath_seleccion_ficha))
        
        conn.commit()
        
        if cursor.rowcount > 0:
            print(f"Ficha '{numero_ficha}' insertada con filtros y datos de navegación en la base de datos.")
            return True
        else:
            print(f"Ficha '{numero_ficha}' ya existe en la base de datos. Saltando inserción.")
            return False
            
    except sqlite3.Error as e:
        print(f"Error al insertar ficha '{numero_ficha}': {e}")
        return False

#-- funciones para control de verciones

def calcular_hash_binario(data: bytes) -> str:
    return sha256(data).hexdigest()

def cargar_versiones():
    if not VERSIONS_FILE.exists():
        return {}
    with open(VERSIONS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def guardar_versiones(data):
    VERSIONS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(VERSIONS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def juicio_ha_cambiado(ficha_id: str, archivo_path: Path) -> bool:
    versiones = cargar_versiones()
    if not archivo_path.exists():
        return False
    with open(archivo_path, "rb") as f:
        contenido = f.read()
    nuevo_hash = calcular_hash_binario(contenido)
    hash_anterior = versiones.get(ficha_id, {}).get("hash")
    return nuevo_hash != hash_anterior

def actualizar_si_cambia(ficha_id: str, archivo_path: Path) -> bool:
    versiones = cargar_versiones()
    if not archivo_path.exists():
        return False
    with open(archivo_path, "rb") as f:
        contenido = f.read()
    nuevo_hash = calcular_hash_binario(contenido)
    if juicio_ha_cambiado(ficha_id, archivo_path):
        versiones[ficha_id] = {
            "hash": nuevo_hash,
            "ultima_actualizacion": datetime.now().isoformat()
        }
        guardar_versiones(versiones)
        return True
    return False
#------------------------Funcionamiento en hilos------------------------------

def postprocesamiento_ficha(ficha_data: dict, archivo_path: Path):
    try:
        print(f"🚀 [BG] Subiendo ficha {ficha_data['NumeroFicha']} a Google Drive...")
        subir_archivo_individual_a_drive(ficha_data, archivo_path)
        print(f"✅ [BG] Subida completada para ficha {ficha_data['NumeroFicha']}.")

        print(f"📤 [BG] Actualizando estado en Google Sheets...")
        url_estado = f"https://script.google.com/macros/s/AKfycbxA5vH9uibvvjOjY1rBumhJ5ecGIAD5iuzeShlaaDrUvfwo2NeudiRjfFLoRCaVTLjY/exec?action=update&ficha={ficha_data['NumeroFicha']}&estado=subido"
        resp = requests.get(url_estado)
        if resp.ok:
            print(f"✅ [BG] Estado actualizado en Sheets.")
        else:
            print(f"⚠️ [BG] Error al actualizar estado: {resp.status_code}")
    except Exception as e:
        print(f"❌ [BG] Error postprocesando ficha {ficha_data['NumeroFicha']}: {e}")

#-----------------------------------------------------------------------

def insert_juicio_evaluacion(numero_ficha, materia, estado_aprobacion):
    """Inserta un juicio de evaluación en la tabla 'juicios_evaluacion'."""
    try:
        cursor.execute("INSERT INTO juicios_evaluacion (numero_ficha, materia, estado_aprobacion) VALUES (?, ?, ?)",
                       (numero_ficha, materia, estado_aprobacion))
        conn.commit()
        print(f"Juicio de evaluación para ficha '{numero_ficha}', materia '{materia}' insertado.")
    except sqlite3.Error as e:
        print(f"Error al insertar juicio de evaluación para ficha '{numero_ficha}', materia '{materia}': {e}")

def close_db():
    """Cierra la conexión a la base de datos."""
    global conn, cursor
    if conn:
        conn.close()
        print("Conexión a la base de datos cerrada.")
    conn = None
    cursor = None

# --- Funciones auxiliares de Selenium ---


def esperar_cualquier_overlay_desaparecer(timeout=10):
    """Función mejorada que usa la nueva lógica de overlays"""
    wait_for_overlay_to_disappear(driver, timeout)

def llamar_click_solo(locator, timeout=20, by_method=By.XPATH):
    """
    Espera a que un elemento sea visible y clicable y luego hace clic en él.
    Maneja overlays y reintenta con JavaScript / ActionChains si es necesario.
    """
    max_attempts = 3
    for attempt in range(1, max_attempts + 1):
        try:
            # — NUEVO —
            esperar_cualquier_overlay_desaparecer()

            method_name = (
                "XPATH" if by_method == By.XPATH else
                "ID" if by_method == By.ID else
                "CLASS_NAME" if by_method == By.CLASS_NAME else
                str(by_method)
            )
            print(f"Intento {attempt}/{max_attempts}: Clic normal en '{locator}' usando {method_name}...")

            elemento_clicable = WebDriverWait(driver, timeout).until(
                EC.element_to_be_clickable((by_method, locator))
            )
            elemento_clicable.click()
            print(f"Clic normal exitoso en: '{locator}'")
            return

        except ElementClickInterceptedException as e:
            print(f"Error (interceptado) al hacer clic normal en '{locator}': {e}")
            print("Posiblemente un overlay apareció de nuevo. Reintentando...")
            time.sleep(1)
            if attempt == max_attempts:
                print("Máximo de intentos alcanzado para clic normal interceptado. Intentando con JavaScript...")
                try:
                    elemento_para_js = WebDriverWait(driver, timeout).until(
                        EC.presence_of_element_located((by_method, locator))
                    )
                    driver.execute_script("arguments[0].click();", elemento_para_js)
                    print(f"Clic exitoso con JavaScript en: '{locator}'")
                    return
                except Exception as js_e:
                    print(f"Error en el clic con JavaScript para '{locator}': {js_e}")
                    raise

        except Exception as e:
            print(f"Error (general) al hacer clic normal en '{locator}' ({by_method}): {e}")
            print("Intentando clic con JavaScript como alternativa...")
            try:
                elemento_para_js = WebDriverWait(driver, timeout).until(
                    EC.presence_of_element_located((by_method, locator))
                )
                driver.execute_script("arguments[0].click();", elemento_para_js)
                print(f"Clic exitoso con JavaScript en: '{locator}'")
                return
            except Exception as js_e:
                print(f"Error en el clic con JavaScript para '{locator}' ({by_method}): {js_e}")
                print("Intentando clic con ActionsChain...")
                try:
                    elemento_para_actions = WebDriverWait(driver, timeout).until(
                        EC.presence_of_element_located((by_method, locator))
                    )
                    ActionChains(driver).move_to_element(elemento_para_actions).click().perform()
                    print(f"Clic exitoso con ActionsChain en: '{locator}'")
                    return
                except Exception as actions_e:
                    print(f"Error en el clic con ActionsChain para '{locator}' ({by_method}): {actions_e}")
                    raise
    raise Exception(f"No se pudo hacer clic en el elemento: {locator}")


def leer_elemento(xpath, timeout=20):
    """Espera a que un elemento esté presente por su XPath y devuelve su texto."""
    elemento = WebDriverWait(driver, timeout).until(EC.presence_of_element_located((By.XPATH, xpath)))
    return elemento.text

def ingresar_texto_y_enviar(locator, texto, timeout=20, by_method=By.ID):
    """Espera que un campo de texto sea visible y envía texto."""
    campo_texto = WebDriverWait(driver, timeout).until(EC.visibility_of_element_located((by_method, locator)))
    campo_texto.clear()
    campo_texto.send_keys(texto)
    print(f"Texto '{texto}' ingresado en el campo '{locator}'.")
    time.sleep(0.5)

def iniciar_sesion():
    """Función para realizar el inicio de sesión en el sistema."""
    try:
        driver.get(url)
        time.sleep(3) # Pausa inicial para cargar la página
        driver.switch_to.default_content()
        print("Cambiando a iframe 'registradoBox1' para inicio de sesión...")
        WebDriverWait(driver, 15).until(EC.frame_to_be_available_and_switch_to_it("registradoBox1"))

        print("Ingresando credenciales...")
        ingresar_texto_y_enviar(XPATH_INPUT_USUARIO_LOGIN, usuario_login, by_method=By.XPATH)
        ingresar_texto_y_enviar(XPATH_INPUT_CONTRASENA_LOGIN, contrasena_login, by_method=By.XPATH)

        boton_login = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, XPATH_BOTON_LOGIN_FORM)))
        boton_login.click()
        time.sleep(5)
        print("Inicio de sesión exitoso.")

    except Exception as e:
        print(f"Error al iniciar sesión: {e}")
        raise



def registrar_ficha_en_hoja(ficha_dict):
    """Envía la ficha al Google Sheet si aún no existe."""
    data = {
        "id": ficha_dict["NumeroFicha"],
        "ficha": ficha_dict["NumeroFicha"],
        "programa": ficha_dict.get("NombrePrograma", ""),
        "departamento": ficha_dict.get("Departamento", ""),
        "ciudad": ficha_dict.get("Ciudad", ""),
        "jornada": ficha_dict.get("Jornada", ""),
        "centro": ficha_dict.get("NombreCentro", ""),
        "xpath": ficha_dict.get("XPathSeleccion", "")
    }

    try:
        response = requests.post(GAS_URL, json=data)
        print(f"📝 Ficha {data['ficha']} registrada: {response.text}")
    except Exception as e:
        print(f"❌ Error al registrar ficha {data['ficha']}: {e}")

def actualizar_estado_ficha(ficha_numero, nuevo_estado="descargado"):
    """Actualiza el estado de la ficha en la hoja de cálculo."""
    try:
        url_estado = f"{GAS_URL}?action=update&ficha={ficha_numero}&estado={nuevo_estado}"
        resp_estado = requests.get(url_estado)
        print(f"📌 Estado actualizado para ficha {ficha_numero}: {resp_estado.text}")
    except Exception as e:
        print(f"❌ Error al actualizar estado de ficha {ficha_numero}: {e}")


def aplicar_filtros_modal(codigo_ficha=None, departamento=None, municipio=None, fecha_inicial=None, fecha_final=None, jornada=None):
    """
    Aplica filtros en el modal de búsqueda de fichas.
    Esta función asume que el driver ya está dentro del iframe del modal.
    """
    print("\n--- Aplicando filtros en el modal de búsqueda de fichas ---")

    esperar_cualquier_overlay_desaparecer(timeout=10)

    try:
        if codigo_ficha:
            print(f"Ingresando código de ficha: {codigo_ficha}")
            ingresar_texto_y_enviar(XPATH_INPUT_CODIGO_FICHA_MODAL, codigo_ficha, by_method=By.ID)

        if departamento:
            print(f"Seleccionando departamento: {departamento}")
            select_departamento = WebDriverWait(driver, 15).until(
                EC.element_to_be_clickable((By.ID, XPATH_SELECT_DEPARTAMENTO_MODAL))
            )
            select_dept = Select(select_departamento)
            select_dept.select_by_visible_text(departamento)
            print(f"Departamento '{departamento}' seleccionado.")
            time.sleep(2)

        if municipio and departamento: # El municipio puede depender del departamento
            print(f"Seleccionando municipio: {municipio}")
            select_municipio_element = WebDriverWait(driver, 15).until(
                EC.element_to_be_clickable((By.XPATH, XPATH_SELECT_MUNICIPIO_MODAL))
            )
            select_mun = Select(select_municipio_element)
            select_mun.select_by_visible_text(municipio)
            print(f"Municipio '{municipio}' seleccionado.")
            time.sleep(1)

        if fecha_inicial:
            print(f"Ingresando fecha inicial: {fecha_inicial}")
            fecha_inicial_input = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, XPATH_INPUT_FECHA_INICIAL_MODAL)))
            fecha_inicial_input.click()
            fecha_inicial_input.clear()
            fecha_inicial_input.send_keys(fecha_inicial)
            print(f"Texto '{fecha_inicial}' ingresado en el campo '{XPATH_INPUT_FECHA_INICIAL_MODAL}'.")
            time.sleep(0.5)

        if fecha_final:
            print(f"Ingresando fecha final: {fecha_final}")
            fecha_final_input = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, XPATH_INPUT_FECHA_FINAL_MODAL)))
            fecha_final_input.click()
            fecha_final_input.clear()
            fecha_final_input.send_keys(fecha_final)
            print(f"Texto '{fecha_final}' ingresado en el campo '{XPATH_INPUT_FECHA_FINAL_MODAL}'.")
            time.sleep(0.5)

        if jornada:
            print(f"Seleccionando jornada: {jornada}")
            select_jornada_element = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.ID, XPATH_SELECT_JORNADA_MODAL))
            )
            select_jorn = Select(select_jornada_element)
            select_jorn.select_by_visible_text(jornada)
            print(f"Jornada '{jornada}' seleccionada con Select.")
            time.sleep(1)

        print("Haciendo clic en el botón 'Buscar' del modal...")
        llamar_click_optimizado(XPATH_BOTON_CONSULTAR_MODAL, timeout=20, by_method=By.ID)

        print("Esperando a que aparezcan los resultados en la tabla...")
        WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.XPATH, f"{XPATH_TABLA_FICHAS_MODAL_ROOT}//tbody/tr"))
        )
        print("Resultados de búsqueda cargados.")

    except Exception as e:
        print(f"Error al aplicar filtros en el modal: {e}")
        raise

def mapear_fichas_en_modal(
        fichas_vistas: set,
        current_filters: dict,
        current_page_index: int = 1,      # página que se está procesando
) -> tuple[pd.DataFrame, set]:
    """
    Extrae las fichas mostradas en la página actual del modal, evitando duplicados,
    y guarda cada ficha en la base de datos con metadatos de navegación.

    :param fichas_vistas:  Conjunto con los números de ficha ya procesados
    :param current_filters: Diccionario con los filtros aplicados en el modal
    :param current_page_index: Número de página actual (1 ≡ primera)
    :return: DataFrame con las fichas nuevas encontradas y el set actualizado
    """
    fichas_pagina_actual_data: list[dict] = []

    try:
        # Localizar la tabla de resultados dentro del modal
        tabla_resultados = WebDriverWait(driver, 15).until(
            EC.presence_of_element_located(
                (By.XPATH, XPATH_TABLA_FICHAS_MODAL_ROOT)
            )
        )

        filas = tabla_resultados.find_elements(By.XPATH, ".//tbody/tr")
        print(
            f"Se encontraron {len(filas)} fichas en el modal "
            f"(página {current_page_index})."
        )

        for i, fila in enumerate(filas):
            posicion_en_pagina = i + 1  # la primera fila es 1
            numero_ficha = nombre_programa = fecha_inicio = ""

            # --- extracción de celdas ------------------------------------------------
            try:
                numero_ficha = fila.find_element(By.XPATH, ".//td[2]").text.strip()
            except NoSuchElementException:
                print(
                    f"[Fila {posicion_en_pagina}] No se encontró el Número de Ficha."
                )

            try:
                nombre_programa = fila.find_element(By.XPATH, ".//td[3]").text.strip()
            except NoSuchElementException:
                print(
                    f"[Fila {posicion_en_pagina}] No se encontró el Nombre del Programa."
                )

            try:
                fecha_inicio = fila.find_element(By.XPATH, ".//td[4]").text.strip()
            except NoSuchElementException:
                print(
                    f"[Fila {posicion_en_pagina}] No se encontró la Fecha de Inicio."
                )

            # --- XPath para seleccionar la ficha ------------------------------------
            xpath_seleccion = (
                f'//*[@id="form:dtFichas"]//tbody/tr/td[2][.="{numero_ficha}"]'
                '/preceding-sibling::td[1]//a'
            )

            # --- registro -----------------------------------------------------------
            if numero_ficha and nombre_programa:
                if numero_ficha not in fichas_vistas:
                    # Añadir al DataFrame
                    fichas_pagina_actual_data.append(
                        {
                            "NumeroFicha": numero_ficha,
                            "NombrePrograma": nombre_programa,
                            "FechaInicio": fecha_inicio,
                            "XPathSeleccion": xpath_seleccion,
                            "PaginaModalEncontrada": current_page_index,
                            "PosicionEnPagina": posicion_en_pagina,
                             # ------- NUEVO: filtros que utilizaste -------
                "filtro_codigo_ficha": current_filters.get("codigo_ficha"),   # 🔧
                "filtro_departamento": current_filters.get("departamento"),   # 🔧
                "filtro_municipio":    current_filters.get("municipio"),      # 🔧
                "filtro_fecha_inicial":current_filters.get("fecha_inicial"),  # 🔧
                "filtro_fecha_final":  current_filters.get("fecha_final"),    # 🔧
                "filtro_jornada":      current_filters.get("jornada"),        # 🔧
                        }
                    )
                    fichas_vistas.add(numero_ficha)

                    # Insertar en la BD
                    insert_ficha(
                        numero_ficha=numero_ficha,
                        denominacion_programa=nombre_programa,
                        departamento=current_filters.get("departamento"),
                        municipio=current_filters.get("municipio"),
                        jornada=current_filters.get("jornada"),
                        fecha_inicio=fecha_inicio,
                        fecha_fin=None,               # si no lo tienes aún
                        estado=None,
                        filtro_codigo_ficha=current_filters.get("codigo_ficha"),
                        filtro_departamento=current_filters.get("departamento"),
                        filtro_municipio=current_filters.get("municipio"),
                        filtro_fecha_inicial=current_filters.get("fecha_inicial"),
                        filtro_fecha_final=current_filters.get("fecha_final"),
                        filtro_jornada=current_filters.get("jornada"),
                        pagina_modal_encontrada=current_page_index,
                        posicion_en_pagina=posicion_en_pagina,
                        xpath_seleccion_ficha=xpath_seleccion,
                    )

                    print(
                        f"[Nueva] Ficha {numero_ficha} - "
                        f"{nombre_programa} (fila {posicion_en_pagina}, pág. {current_page_index})"
                    )
                else:
                    print(
                        f"[Duplicada] Ficha {numero_ficha} ya estaba procesada."
                    )
            else:
                print(
                    f"[Ignorada] Fila {posicion_en_pagina} con datos incompletos."
                )

    except Exception as e:
        print(f"Error al mapear fichas en el modal: {e}")

    # Devolver DataFrame y conjunto actualizado
    return pd.DataFrame(fichas_pagina_actual_data), fichas_vistas


def manejar_paginacion_modal(current_filters: dict) -> pd.DataFrame:
    """
    Recorre todo el paginador del modal de fichas, extrae y guarda las filas
    evitando duplicados y finalmente inserta la información en la BD.
    """
    todas_las_fichas   = pd.DataFrame()
    fichas_vistas      = set()
    pagina_actual      = 1
    paginas_sin_nuevas = 0
    max_sin_nuevas     = 3           # corta el bucle si no aparecen novedades

    while True:
        print(f"\n--- Extrayendo fichas de la página {pagina_actual} del modal ---")

        antes = len(fichas_vistas)

        df_pagina, fichas_vistas = mapear_fichas_en_modal(
            fichas_vistas,
            current_filters,
            current_page_index=pagina_actual
        )

        nuevas = len(fichas_vistas) - antes
        if nuevas == 0:
            paginas_sin_nuevas += 1
            print(f"No se encontraron fichas nuevas en la página {pagina_actual}. "
                  f"Contador: {paginas_sin_nuevas}")
            if paginas_sin_nuevas >= max_sin_nuevas:
                print("Se alcanzó el límite de páginas consecutivas sin datos nuevos. "
                      "Finalizando paginación.")
                break
        else:
            paginas_sin_nuevas = 0
            print(f"Se agregaron {nuevas} fichas nuevas en la página {pagina_actual}")

        if not df_pagina.empty:
            todas_las_fichas = pd.concat(
                [todas_las_fichas, df_pagina], ignore_index=True
            )
        elif pagina_actual == 1:
            print("No se encontraron fichas en la primera página del modal.")
            break

        # --- pasar a la siguiente página -----------------------------------
        try:
            next_btn = WebDriverWait(driver, 5).until(
                EC.element_to_be_clickable(
                    (By.XPATH, XPATH_BOTON_PAGINACION_NEXT_MODAL_SIMPLE)
                )
            )

            if 'ui-state-disabled' in next_btn.get_attribute('class'):
                print("No hay más páginas. Botón 'Siguiente' deshabilitado.")
                break

            print(f"Haciendo clic en el botón 'Siguiente' "
                  f"para ir a la página {pagina_actual + 1}…")

            driver.execute_script("arguments[0].scrollIntoView(true);", next_btn)
            time.sleep(0.6)
            driver.execute_script("arguments[0].click();", next_btn)

            esperar_cualquier_overlay_desaparecer(timeout=10)   # <- 🔧

            WebDriverWait(driver, 15).until(
                EC.presence_of_element_located(
                    (By.XPATH, f"{XPATH_TABLA_FICHAS_MODAL_ROOT}//tbody/tr")
                )
            )
            time.sleep(1.5)
            pagina_actual += 1

        except TimeoutException:
            print("No se encontró el botón 'Siguiente' o no hay más páginas.")
            break
        except Exception as e:
            print(f"Error al intentar paginar: {e}")
            break

    print(f"Paginación completada. Total de fichas extraídas: {len(todas_las_fichas)}")

    # ----------------------- inserción en BD -------------------------------
    print(f"\n--- Insertando {len(todas_las_fichas)} fichas en la base de datos ---")
    for _, row in todas_las_fichas.iterrows():
        try:
            insert_ficha(
                numero_ficha          = row['NumeroFicha'],
                denominacion_programa = row['DenominacionPrograma'],
                departamento          = row.get('Departamento'),
                municipio             = row.get('Municipio'),
                jornada               = row.get('Jornada'),
                fecha_inicio          = row.get('FechaInicio'),
                fecha_fin             = row.get('FechaFin'),
                estado                = row.get('Estado'),
                filtro_codigo_ficha   = row.get('filtro_codigo_ficha'),
                filtro_departamento   = row.get('filtro_departamento'),
                filtro_municipio      = row.get('filtro_municipio'),
                filtro_fecha_inicial  = row.get('filtro_fecha_inicial'),
                filtro_fecha_final    = row.get('filtro_fecha_final'),
                filtro_jornada        = row.get('filtro_jornada'),
                pagina_modal_encontrada = row['PaginaModalEncontrada'],
                posicion_en_pagina      = row['PosicionEnPagina'],
                xpath_seleccion_ficha   = row['XPathSeleccion']
            )
        except Exception as e:
            print(f"Error al insertar ficha {row['NumeroFicha']} en BD: {e}")

    print("Proceso de inserción de fichas completado.")
    return todas_las_fichas


# --- XPaths para la descarga del juicio evaluativo ---
# XPATH_BOTON_DESCARGAR_JUICIO: Este es CRÍTICO. Debes obtenerlo inspeccionando la página
# después de seleccionar una ficha y llegar a la vista de "Contenido" (donde está la tabla de juicios).
# Debería ser el XPath del botón que activa la descarga del Excel.
# EJEMPLO: '//*[@id="frmConsulta:j_id_jsp_XXXXXXXXX_btnDescargar"]' o un XPath más genérico.
XPATH_BOTON_DESCARGAR_JUICIO = '/html/body[1]/div[2]/form/fieldset/div/div/input' # ¡DEBES REEMPLAZAR ESTO!

import requests  # asegúrate de tener esta importación al inicio

import traceback

def descargar_juicio_evaluacion_por_ficha_optimizado(ficha_data: dict, max_reintentos: int = 3) -> bool:
    """
    VERSIÓN OPTIMIZADA de descargar_juicio_evaluacion_por_ficha
    Reemplaza a la función original
    """
    num_ficha = str(ficha_data["NumeroFicha"]).strip()
    slug_prog = slugify(ficha_data.get("NombrePrograma", "programa"))
    url_base_estado = "https://script.google.com/macros/s/AKfycbxA5vH9uibvvjOjY1rBumhJ5ecGIAD5iuzeShlaaDrUvfwo2NeudiRjfFLoRCaVTLjY/exec"

    def _esperar_dialog_underlay(timeout=10):
        try:
            wait_for_overlay_to_disappear(driver, timeout)
        except Exception as e:
            print(f"⚠️ Error esperando overlay: {e}")

    for intento in range(1, max_reintentos + 1):
        print(f"\n==> [{intento}/{max_reintentos}] Descargando juicio para ficha {num_ficha}")
        try:
            print("🔁 Reiniciando contexto de driver...")
            driver.switch_to.default_content()

            print("⏳ Esperando iframe 'contenido'...")
            WebDriverWait(driver, 10).until(
                EC.frame_to_be_available_and_switch_to_it(IFRAME_CONTENIDO_ID)
            )
            print("✅ Iframe 'contenido' activado.")

            print("🖱️ Click para abrir modal...")
            click_with_javascript(driver, XPATH_BOTON_ABRIR_BUSCADOR_FICHAS, by_method=By.ID, timeout=10)

            print("⏳ Esperando iframe 'modal'...")
            WebDriverWait(driver, 10).until(
                EC.frame_to_be_available_and_switch_to_it(IFRAME_MODAL_ID)
            )
            print("✅ Iframe 'modal' activado.")

            print(f"⌨️ Ingresando número de ficha '{num_ficha}'...")
            ingresar_texto_y_enviar("form:codigoFichaITX", num_ficha, by_method=By.ID)

            print("🖱️ Click en botón de búsqueda...")
            if not click_with_javascript(driver, "form:buscarCBT", by_method=By.ID, timeout=20):
                print("❌ Fallback JavaScript también falló para 'form:buscarCBT'")
            _esperar_dialog_underlay()

            print("🔍 Esperando botón para ver ficha...")
            xpath_boton_ver = '//*[@id="form:dtFichas:0:cmdlnkShow"]'
            WebDriverWait(driver, 15).until(
                EC.element_to_be_clickable((By.XPATH, xpath_boton_ver))
            )
            print("🖱️ Click en ver ficha...")
            click_with_javascript(driver, xpath_boton_ver, by_method=By.XPATH, timeout=15)

            print("🔁 Volviendo a contexto principal...")
            driver.switch_to.default_content()
            _esperar_dialog_underlay()

#------------------------------------------------------------------------------------------
            # print("⚡ Forzando clic en el botón 'Consultar' inmediatamente...")
            # try:
            #     boton = driver.find_element(By.XPATH, '//*[@id="frmForma1:btnConsultar"]')
            #     driver.execute_script("arguments[0].click();", boton)
            #     print("✅ Clic realizado con éxito.")
            # except Exception as e:
            #     print(f"❌ Error al intentar hacer clic: {e}")
#------------------------------------------------------------------------------------------
            print("⏳ Cambiando nuevamente a iframe 'contenido'...")
            WebDriverWait(driver, 10).until(
                EC.frame_to_be_available_and_switch_to_it(IFRAME_CONTENIDO_ID)
            )
            #_esperar_dialog_underlay()

            print("📂 Obteniendo lista de archivos previos en carpeta de descargas...")
            prev_files = set(os.listdir(DOWNLOAD_DIR))

            print("🖱️ Click en botón 'Consultar' para generar descarga...")
            llamar_click_optimizado('//*[@id="frmForma1:btnConsultar"]', timeout=20, by_method=By.XPATH)
            #_esperar_dialog_underlay()

            print("⏳ Esperando archivo descargado...")
            nuevo_arch = esperar_nuevo_archivo(DOWNLOAD_DIR, prev_files, timeout=120)
            print(f"✅ Archivo detectado: {nuevo_arch}")

            print("🔒 Esperando desbloqueo del archivo...")
            tiempo_limite = time.time() + 10
            while True:
                try:
                    with open(nuevo_arch, "rb"):
                        break
                except PermissionError:
                    if time.time() > tiempo_limite:
                        raise
                    time.sleep(0.5)

            print("📦 Renombrando archivo...")
            _, ext = os.path.splitext(nuevo_arch)
            ext = ext.lower() if ext.lower() in {".xls", ".xlsx", ".csv", ".pdf"} else ".xls"
            destino = os.path.join(DOWNLOAD_DIR, f"{num_ficha}_{slug_prog}{ext}")
            if os.path.exists(destino):
                base, ext0 = os.path.splitext(destino)
                idx = 1
                while os.path.exists(f"{base}_{idx}{ext0}"):
                    idx += 1
                destino = f"{base}_{idx}{ext0}"
            shutil.move(nuevo_arch, destino)
            print(f"✅ ({intento}) Archivo renombrado a: {os.path.basename(destino)}")

            from pathlib import Path
            archivo_path = Path(destino)
            print("📋 Verificando si el archivo contiene contenido nuevo o modificado...")
            if actualizar_si_cambia(num_ficha, archivo_path):
                print(f"✅ Contenido nuevo o modificado, archivo conservado.")
            else:
                print(f"⚠️ Archivo sin cambios. Eliminado.")
                archivo_path.unlink()

            print("📤 Actualizando estado en Google Sheets...")
            url_estado = f"{url_base_estado}?action=update&ficha={num_ficha}&estado=descargado"
            try:
                resp_estado = requests.get(url_estado)
                if resp_estado.ok:
                    print(f"✅ Estado actualizado en Google Sheets para ficha {num_ficha}.")
                else:
                    print(f"⚠️ Error al actualizar estado: {resp_estado.status_code}")
            except Exception as ex:
                print(f"⚠️ Error enviando estado: {ex}")

            return True

        except Exception as e:
            print(f"⚠️  ({intento}) Falló intento para ficha {num_ficha}: {type(e).__name__}: {e}")
            traceback.print_exc()
            try:
                driver.switch_to.default_content()
            except:
                print("⚠️ No se pudo volver al contexto principal del driver.")
            _esperar_dialog_underlay()
            if intento == max_reintentos:
                print(f"❌ No se pudo descargar el juicio de {num_ficha} tras {max_reintentos} intentos.")
                url_estado = f"{url_base_estado}?action=update&ficha={num_ficha}&estado=fallido"
                try:
                    resp_estado = requests.get(url_estado)
                    if resp_estado.ok:
                        print(f"⛔ Estado actualizado a 'fallido' en Google Sheets para ficha {num_ficha}.")
                    else:
                        print(f"⚠️ Error al actualizar estado 'fallido': {resp_estado.status_code}")
                except Exception as ex:
                    print(f"⚠️ Error enviando estado 'fallido': {ex}")
                return False
            print("⏳ Esperando 2 segundos antes de reintentar...")
            time.sleep(2)

    return False




        
def mapear_datos_de_tabla_general(xpath_tabla_root: str, datos_vistos: set, data_key_columns: list, current_page_index: int = 1):
    """
    Extrae datos de una tabla HTML genérica y evita duplicados,
    añadiendo información de navegación (página y posición) para el modal.
    
    :param xpath_tabla_root: XPath de la raíz de la tabla (debe apuntar al tbody o la tabla principal)
    :param datos_vistos: Set de tuplas con datos ya vistos para deduplicación
    :param data_key_columns: Lista de índices de columna que forman la clave única
    :param current_page_index: El número de página actual que se está mapeando (para el modal)
    :return: DataFrame con datos de la página actual (incluyendo metadatos de navegación)
             y set actualizado de datos vistos.
    """
    datos_pagina_actual = []
    try:
        tabla_element = WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.XPATH, xpath_tabla_root))
        )
        # Aseguramos que 'filas' se encuentre dentro del tbody si xpath_tabla_root es la tabla
        filas = tabla_element.find_elements(By.XPATH, ".//tbody/tr") 
        print(f"Se encontraron {len(filas)} filas en la tabla en la página actual.")

        for i, fila in enumerate(filas):
            try:
                celdas = fila.find_elements(By.XPATH, "./td")
                if not celdas:
                    print(f"Advertencia: Fila {i+1} no tiene celdas o estructura inesperada.")
                    continue

                row_data = [celda.text.strip() for celda in celdas]
                
                # Verificar que tenemos suficientes columnas para crear la clave
                # Ajuste para evitar error si data_key_columns contiene un índice mayor al tamaño de row_data
                if data_key_columns and max(data_key_columns) >= len(row_data):
                    # Filtrar los índices que son válidos para la fila actual
                    valid_key_columns = [idx for idx in data_key_columns if idx < len(row_data)]
                    if not valid_key_columns:
                        print(f"Advertencia: Fila {i+1} no tiene columnas válidas para la clave única.")
                        continue
                    row_key_elements = tuple(row_data[idx] for idx in valid_key_columns)
                else:
                    row_key_elements = tuple(row_data[idx] for idx in data_key_columns)
                
                if row_key_elements not in datos_vistos:
                    # Si es una fila nueva, añade la información de navegación y el XPath específico
                    posicion_en_pagina = i + 1 # Posición 1-basada en la página actual
                    
                    # Genera el XPath específico para hacer clic en el enlace de la primera columna.
                    # AJUSTA ESTE XPath si el enlace de selección de ficha no está en td[1]/a
                    # o tiene otra lógica (ej. td[0]/span/a o un botón dentro de una celda).
                    # Asegúrate de que xpath_tabla_root ya apunta a la tabla (no al tbody directamente)
                    # para que el Path '/tbody/tr' funcione correctamente desde ahí.
                    specific_xpath_click = f"{xpath_tabla_root}//tbody/tr[{posicion_en_pagina}]/td[1]/a" 

                    datos_pagina_actual.append(row_data + [current_page_index, posicion_en_pagina, specific_xpath_click])
                    datos_vistos.add(row_key_elements)
                    print(f"Fila {i+1} (Extraída y Agregada - Página {current_page_index}, Posición {posicion_en_pagina}): {row_data}")
                else:
                    print(f"Fila {i+1} (Ignorada - Duplicada): {row_data}")
                    
            except Exception as e:
                print(f"Error al procesar fila {i+1}: {e}")
                continue

    except Exception as e:
        print(f"Error al mapear datos de la tabla: {e}")
        return pd.DataFrame(), datos_vistos

    # Definir nombres de columnas según el tipo de tabla
    if xpath_tabla_root == XPATH_TABLA_RESULTADOS:
        column_names = ["Materia", "Estado de Aprobación"] 
    elif xpath_tabla_root == XPATH_TABLA_RESULTADOS:
        # ¡IMPORTANTE! Asegúrate que estos nombres coincidan con el orden de las columnas en la tabla HTML
        # y las nuevas columnas que estamos añadiendo (PaginaModalEncontrada, PosicionEnPagina, XPathSeleccion)
        column_names = ["NumeroFicha", "DenominacionPrograma", "Departamento", "Municipio", 
                        "Jornada", "FechaInicio", "FechaFin", "Estado", 
                        "PaginaModalEncontrada", "PosicionEnPagina", "XPathSeleccion"]
    else:
        # Generar nombres de columnas genéricos si no es una tabla específica
        max_cols = max(len(row) for row in datos_pagina_actual) if datos_pagina_actual else 0
        column_names = [f"Columna_{i+1}" for i in range(max_cols)]

    if datos_pagina_actual:
        # Asegurar que todas las filas tengan el mismo número de columnas antes de crear el DataFrame
        # y que se ajusten a la cantidad de nombres de columna definidos.
        target_cols_count = len(column_names) if xpath_tabla_root in [XPATH_TABLA_RESULTADOS, XPATH_TABLA_RESULTADOS] else max(len(row) for row in datos_pagina_actual)
        
        datos_normalizados = []
        for row in datos_pagina_actual:
            row_normalizada = row + [''] * (target_cols_count - len(row)) # Rellenar
            datos_normalizados.append(row_normalizada)
            
        df = pd.DataFrame(datos_normalizados, columns=column_names[:target_cols_count])
        
        # Elimina esta sección ya que el XPathSeleccion ahora se agrega directamente a row_data
        # if xpath_tabla_root == XPATH_TABLA_RESULTADOS_MODAL:
        #     df['XPathSeleccion'] = [f"{xpath_tabla_root}//tbody/tr[{idx + 1}]/td[1]/a" 
        #                              for idx in range(len(datos_normalizados))]
    else:
        df = pd.DataFrame(columns=column_names)

    return df, datos_vistos

def manejar_paginacion_tabla_general(xpath_tabla_root: str, xpath_next_button: str, data_key_columns: list):
    """
    Maneja la paginación para una tabla HTML genérica.
    Extrae todos los datos, página por página, y evita duplicados.

    :param xpath_tabla_root: XPath de la raíz de la tabla
    :param xpath_next_button: XPath del botón "Siguiente" para la paginación
    :param data_key_columns: Lista de índices de columna que forman la clave única
    :return: DataFrame consolidado con todos los datos extraídos
    """
    todas_las_filas_extraidas = pd.DataFrame()
    datos_vistos = set()
    pagina_actual = 1
    
    # Contadores para detectar bucles infinitos
    paginas_sin_datos_nuevos = 0
    max_paginas_sin_datos = 3
    
    while True:
        print(f"\n--- Extrayendo datos de la página {pagina_actual} de la tabla general ---")
        
        # Obtener el conteo de datos antes de mapear
        datos_antes = len(datos_vistos)
        
        df_datos_pagina_actual, datos_vistos = mapear_datos_de_tabla_general(
            xpath_tabla_root, datos_vistos, data_key_columns
        )
        
        # Verificar si se agregaron nuevos datos
        datos_nuevos = len(datos_vistos) - datos_antes
        
        if datos_nuevos == 0:
            paginas_sin_datos_nuevos += 1
            print(f"No se encontraron datos nuevos en la página {pagina_actual}. Contador: {paginas_sin_datos_nuevos}")
            
            if paginas_sin_datos_nuevos >= max_paginas_sin_datos:
                print("Se alcanzó el límite de páginas consecutivas sin datos nuevos. Finalizando paginación.")
                break
        else:
            paginas_sin_datos_nuevos = 0  # Reset del contador
            print(f"Se agregaron {datos_nuevos} filas nuevas en la página {pagina_actual}")

        # Concatenar los datos de la página actual
        if not df_datos_pagina_actual.empty:
            todas_las_filas_extraidas = pd.concat([todas_las_filas_extraidas, df_datos_pagina_actual], ignore_index=True)

        # Verificar si hay botón siguiente y está habilitado
        try:
            next_button_element = WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.XPATH, xpath_next_button))
            )
            
            # Verificar si el botón está deshabilitado
            if 'ui-state-disabled' in next_button_element.get_attribute('class'):
                print("No hay más páginas. Botón 'Siguiente' deshabilitado.")
                break
            
            # Verificar si el botón es clickeable
            if not next_button_element.is_enabled():
                print("El botón 'Siguiente' no está habilitado.")
                break

            print(f"Haciendo clic en el botón 'Siguiente' para ir a la página {pagina_actual + 1}...")
            
            # Scroll hacia el botón si es necesario
            driver.execute_script("arguments[0].scrollIntoView(true);", next_button_element)
            time.sleep(1)
            
            # Hacer clic usando JavaScript como alternativa más confiable
            driver.execute_script("arguments[0].click();", next_button_element)
            
            # Esperar a que desaparezca el overlay
            esperar_cualquier_overlay_desaparecer(timeout=10)

            # Esperar que la tabla se actualice
            WebDriverWait(driver, 15).until(
                EC.presence_of_element_located((By.XPATH, f"{xpath_tabla_root}//tbody/tr"))
            )
            
            # Pausa adicional para asegurar estabilidad
            time.sleep(2)
            
            pagina_actual += 1

        except TimeoutException:
            print("No se encontró el botón 'Siguiente' en el tiempo esperado o no hay más páginas.")
            break
        except NoSuchElementException:
            print("No se encontró el botón 'Siguiente' o no hay más páginas visibles.")
            break
        except Exception as e:
            print(f"Error al intentar paginar: {e}")
            break
    
    print(f"Paginación completada. Total de filas extraídas: {len(todas_las_filas_extraidas)}")
    return todas_las_filas_extraidas

def slugify(texto: str) -> str:
    """Convierte un texto a slug seguro para nombre de archivo."""
    slug = re.sub(r"[^\w\s-]", "", texto, flags=re.UNICODE).strip().lower()
    return re.sub(r"[\s_-]+", "_", slug)

def esperar_nuevo_archivo(dir_path: str, existentes: set, timeout=60):
    """
    Espera a que aparezca un archivo nuevo en `dir_path` (no .crdownload)
    y lo devuelve. Lanza TimeoutException si no llega a tiempo.
    """
    fin = time.time() + timeout
    while time.time() < fin:
        actuales = set(os.listdir(dir_path))
        nuevos   = [f for f in actuales - existentes if not f.endswith(".crdownload")]
        if nuevos:
            # Devuelve el primero encontrado (debería ser solo uno)
            return os.path.join(dir_path, nuevos[0])
        time.sleep(0.5)
    raise TimeoutError("No llegó ningún archivo nuevo a la carpeta de descargas")

# --- Inicio de la automatización ---


def ejecutar_scraper():
    """
    Función principal que ejecuta todo el proceso de scraping
    El WebDriver se inicializa SOLO cuando se llama esta función
    """
    global driver
    
    try:
        # 🚀 AQUÍ SE INICIALIZA EL NAVEGADOR por primera vez
        print("=" * 60)
        print("🎯 INICIANDO PROCESO DE SCRAPING")
        print("=" * 60)
        
        # Inicializar el driver
        inicializar_driver()
        
        # Conectar a la base de datos
        connect_db()
        create_tables()
        
        # 1. Iniciar sesión y seleccionar rol
        print("\n🔐 Iniciando sesión...")
        iniciar_sesion()

        driver.switch_to.default_content()
        print(f"👤 Seleccionando el rol de '{XPATH_MENU_GESTION_DESARROLLO_CURRICULAR}'...")

        select_element = WebDriverWait(driver, 20).until(
            EC.visibility_of_element_located((By.XPATH, XPATH_SELECT_ROL_DROPDOWN))
        )
        select_rol = Select(select_element)
        time.sleep(2)
        select_rol.select_by_visible_text(XPATH_MENU_GESTION_DESARROLLO_CURRICULAR)
        print(f"✅ Rol '{XPATH_MENU_GESTION_DESARROLLO_CURRICULAR}' seleccionado exitosamente.")

        # 2. Navegación por el menú
        print("\n🧭 Navegando por el menú...")
        print("📂 Navegando a 'Ejecución a la formación'...")
        try:
            elemento = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.XPATH, XPATH_MENU_EJECUCION_FORMACION_GDC))
            )
            driver.execute_script("arguments[0].click();", elemento)
            print(f"✅ Clic exitoso con JavaScript en: '{XPATH_MENU_EJECUCION_FORMACION_GDC}'")
        except Exception as e:
            print(f"❌ Error en clic JavaScript para '{XPATH_MENU_EJECUCION_FORMACION_GDC}': {e}")
        time.sleep(1)



        print("📂 Navegando a 'Administrar Ruta de Aprendizaje'...")
        llamar_click_optimizado(XPATH_MENU_ADMINISTRAR_RUTA_APRENDIZAJE_GDC)
        time.sleep(1)

        print("📊 Navegando a 'Reportes'...")
        llamar_click_optimizado(XPATH_MENU_REPORTES_GDC)
        time.sleep(1)

        print("⚖️ Navegando a 'Reportes de Juicios de Evaluación'...")
        elemento = driver.find_element(By.XPATH, XPATH_MENU_REPORTES_JUICIOS_EVALUACION_GDC)
        driver.execute_script("arguments[0].click();", elemento)
        time.sleep(3)



        # 3. Cambiar a iframe 'contenido'
        driver.switch_to.default_content()
        try:
            print("\n🖼️ Intentando cambiar a iframe 'contenido'...")
            WebDriverWait(driver, 15).until(
                EC.frame_to_be_available_and_switch_to_it(IFRAME_CONTENIDO_ID)
            )
            print("✅ Cambiado a iframe 'contenido' exitosamente.")
        except Exception as iframe_e:
            print(f"❌ ERROR: No se pudo cambiar al iframe 'contenido': {iframe_e}")
            raise

        # esperar_cualquier_overlay_desaparecer(timeout=20)

       

        # ...
        print("🔍 Esperando a que el botón de buscador de fichas esté presente en el DOM...")
        start = time.time()
        try:
            elemento = WebDriverWait(driver, 30).until(
                EC.presence_of_element_located((By.ID, XPATH_BOTON_ABRIR_BUSCADOR_FICHAS))
            )
            end = time.time()
            print(f"🖱️ Ejecutando clic con JavaScript... (espera: {end - start:.2f} segundos)")
            driver.execute_script("arguments[0].click();", elemento)
        except Exception as e:
            print(f"❌ Error al hacer clic con JavaScript: {e}")


        # 4. Cambiar al iframe anidado del modal
        print("\n🖼️ Buscando iframe anidado del modal...")
        modal_iframe_found = False
        for intento in range(1, 4):
            print(f"🔄 Intento {intento}/3 para cambiar al iframe '{IFRAME_MODAL_ID}'")
            try:
                WebDriverWait(driver, 15).until(
                    EC.frame_to_be_available_and_switch_to_it(IFRAME_MODAL_ID)
                )
                print(f"✅ ¡Éxito! Cambiado al iframe del modal: '{IFRAME_MODAL_ID}'.")
                modal_iframe_found = True
                break
            except TimeoutException:
                print(f"⏰ Timeout: no se encontró el iframe '{IFRAME_MODAL_ID}'. Reintentando...")
                driver.switch_to.parent_frame()
                time.sleep(3)
            except Exception as e:
                print(f"❌ Error inesperado al cambiar al iframe del modal: {e}")
                driver.switch_to.parent_frame()
                time.sleep(3)

        if not modal_iframe_found:
            raise Exception(f"💥 Fallo crítico: No se pudo cambiar al iframe del modal '{IFRAME_MODAL_ID}'.")

        # 5. Aplicar filtros
        print("\n🔧 Aplicando filtros de búsqueda...")
        current_date = datetime.now()
        fecha_inicio_busqueda = "09/08/2025"

        dep_busqueda = "BOLÍVAR"
        mun_busqueda = None
        jornada_busqueda = None
        codigo_ficha_busqueda = None
        fecha_final_busqueda = None

        filtros_actuales = {
            'codigo_ficha': codigo_ficha_busqueda,
            'departamento': dep_busqueda,
            'municipio': mun_busqueda,
            'fecha_inicial': fecha_inicio_busqueda,
            'fecha_final': fecha_final_busqueda,
            'jornada': jornada_busqueda
        }

        aplicar_filtros_modal(
            codigo_ficha=codigo_ficha_busqueda,
            departamento=dep_busqueda,
            municipio=mun_busqueda,
            fecha_inicial=fecha_inicio_busqueda,
            fecha_final=fecha_final_busqueda,
            jornada=jornada_busqueda
        )

        # 6. Mapear fichas
        print("\n🗺️ Mapeando todas las fichas...")
        global df_fichas_mapeadas
        df_fichas_mapeadas = manejar_paginacion_modal(filtros_actuales)

        if not df_fichas_mapeadas.empty:
            print("\n📋 --- Todas las Fichas Mapeadas ---")
            print(df_fichas_mapeadas.to_string(index=False))
        else:
            print("⚠️ No se encontraron fichas con los filtros aplicados.")

        # 7. Descargar juicios por ficha
        print("\n⬇️ Descargando juicios de evaluación...")
        descargar_juicios_evaluacion()
        
        print("\n🎉 ¡PROCESO COMPLETADO EXITOSAMENTE!")

    except Exception as e:
        print(f"\n💥 ❌ Error general durante la ejecución: {e}")
        try:
            if driver is not None:
                driver.save_screenshot("error_scraper.png")
                print("🖼️ Captura guardada como 'error_scraper.png'")
        except:
            print("📷 No se pudo guardar la captura del error.")
    
    finally:
        print("\n🧹 Limpieza final...")
        # Cerrar navegador
        cerrar_driver()
        # Cerrar conexión a base de datos
        close_db()
        print("✅ Proceso finalizado")




def descargar_juicios_evaluacion():
    try:
        # --- NUEVA LÓGICA: Iterar sobre cada ficha para descargar su juicio ---
        print("\n--- Iniciando el proceso de descarga de juicios para cada ficha ---")
        if df_fichas_mapeadas.empty:
            print("No se encontraron fichas con los filtros aplicados y después de la paginación. No hay juicios para descargar.")
            return

        for index, ficha_row in df_fichas_mapeadas.iterrows():
            ficha_dict = ficha_row.to_dict()  # Convertir la fila del DataFrame a un diccionario
            registrar_ficha_en_hoja(ficha_dict)  # 👉 Añadir a Google Sheets
            print(f"\nProcesando ficha para descarga: {ficha_dict['NumeroFicha']}")

            success = descargar_juicio_evaluacion_por_ficha_optimizado(ficha_dict)
            if success:
                print(f"✅ Descarga de juicio completada para ficha {ficha_dict['NumeroFicha']}.")
                actualizar_estado_ficha(ficha_dict["NumeroFicha"])  # 👉 Cambia estado a 'descargado'
                #---------------------------hilo---------------------------
                #lanzar prcesamiento en segundo plano
                archivo_path = Path("reportes_juicios") / f"{ficha_dict['NumeroFicha']}_{ficha_dict['NombrePrograma']}.xls"
                executor_postprocesamiento.submit(
                    postprocesamiento_ficha,
                    ficha_dict,
                    archivo_path
                )
                #----------------------------------------------------------
                # Aquí podrías añadir lógica adicional, como registrar la descarga exitosa en la DB
            else:
                print(f"❌ Fallo en la descarga del juicio para ficha {ficha_dict['NumeroFicha']}. Continuando con la siguiente.")

    except Exception as e:
        print(f"Ocurrió un error crítico: {e}")
        try:
            driver.save_screenshot("error_screenshot.png")
            print("Captura de pantalla guardada como 'error_screenshot.png'.")
        except Exception as screenshot_e:
            print(f"No se pudo guardar la captura de pantalla: {screenshot_e}")
    finally:
        # print("\n🔁 Subiendo archivos descargados a Google Drive...")
        # subir_todos_los_archivos_a_drive()
        # print("✅ Archivos subidos a Google Drive.")
        print("\n⏳ Esperando que finalicen tareas de postprocesamiento en segundo plano...")
        executor_postprocesamiento.shutdown(wait=True)
        print("✅ Todas las tareas en segundo plano han terminado.")

        print("\nProceso de automatización completado. Cerrando navegador...")
        driver.quit()
        close_db()  # Cerrar la conexión a la base de datos al finalizar


if __name__ == "__main__":
    print("=== Ejecutando script de scraping directamente (modo standalone) ===")
    descargar_juicios_evaluacion()