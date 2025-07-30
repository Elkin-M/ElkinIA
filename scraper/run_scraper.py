from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import TimeoutException, NoSuchElementException, WebDriverException, ElementClickInterceptedException, StaleElementReferenceException, NoSuchFrameException
from webdriver_manager.chrome import ChromeDriverManager
import time
import pandas as pd
from datetime import datetime, timedelta
import sqlite3
import os, re, time, shutil   # ← asegúrate de tenerlos al inicio del script
import os

# --- Configuración Inicial ---
estado = ""
ficha = ""
DOWNLOAD_DIR = os.path.join(os.getcwd(), "reportes_juicios")
# Crear la carpeta si no existe
if not os.path.exists(DOWNLOAD_DIR):
    os.makedirs(DOWNLOAD_DIR)
    print(f"Carpeta de descargas creada: {DOWNLOAD_DIR}")
else:
    print(f"Carpeta de descargas existente: {DOWNLOAD_DIR}")

chrome_options = Options()
chrome_options.add_argument("--start-maximized")
chrome_options.add_argument("--disable-notifications")
# Configuraciones para descarga automática
prefs = {
    "download.default_directory": DOWNLOAD_DIR,
    "download.prompt_for_download": False, # No preguntar dónde guardar
    "download.directory_upgrade": True,
    "safeBrowse.enabled": True
}
chrome_options.add_experimental_option("prefs", prefs)

try:
    service = Service(ChromeDriverManager().install())
    print("Chromedriver instalado y configurado correctamente.")
except Exception as e:
    print(f"Error al instalar Chromedriver: {e}")
    raise

#Vercion anterior de chromedriver
# Asegúrate de que esta ruta sea correcta para tu chromedriver.exe
#ruta_driver = r"D:\Users\Lenovo\Documents\chrome-win\chromedriver.exe"
#service = Service(ruta_driver)
driver = webdriver.Chrome(service=service, options=chrome_options)
url = "http://senasofiaplus.edu.co/sofia-public/"

# Credenciales de inicio de sesión
usuario_login = "1050962935"
contrasena_login = "PapaJose92805331050*"

# --- Configuración de la Base de Datos SQLite ---
DB_NAME = 'sena_datos.db'
conn = None # Se inicializará la conexión más tarde
cursor = None # Se inicializará el cursor más tarde

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
DOWNLOAD_DIR = r"C:\Users\Lenovo\Jupyter\IDAutoSENA\reportes_juicios"   # ⚠️ Ajusta tu carpeta de descargas 

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
    try:
        WebDriverWait(driver, timeout).until_not(
            EC.presence_of_element_located((By.CLASS_NAME, "ui-blockui"))
        )
    except TimeoutException:
        print("⏳ Overlay no desapareció a tiempo o no estaba presente. Continuando…")


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
        llamar_click_solo(XPATH_BOTON_CONSULTAR_MODAL, timeout=20, by_method=By.ID)

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
XPATH_BOTON_DESCARGAR_JUICIO = 'tu_xpath_del_boton_de_descarga_del_juicio_evaluativo' # ¡DEBES REEMPLAZAR ESTO!

def descargar_juicio_evaluacion_por_ficha(ficha_data: dict, max_reintentos: int = 3) -> bool:
    """
    Busca la ficha sólo por su número dentro del modal y descarga el juicio evaluativo.
    Ahora:
    ▸ Espera a que desaparezca el overlay dialogUnderlay en cada paso.
    ▸ Sale siempre del iframe modal antes de volver al iframe contenido.
    ▸ Reintenta la descarga (hasta max_reintentos) si algo falla.
    ▸ Espera a que el archivo deje de estar bloqueado antes de renombrar.
    """
    num_ficha = str(ficha_data["NumeroFicha"]).strip()
    slug_prog = slugify(ficha_data.get("NombrePrograma", "programa"))

    for intento in range(1, max_reintentos + 1):
        print(f"\n==> [{intento}/{max_reintentos}] Descargando juicio para ficha {num_ficha}")
        try:
            # ────────────────────────────────────────────────────────────
            # helper interno: overlay dialogUnderlay
            def _esperar_dialog_underlay(timeout=10):
                try:
                    WebDriverWait(driver, timeout).until_not(
                        EC.presence_of_element_located((By.XPATH, "//div[contains(@class,'dialogUnderlay') and contains(@style,'display: block')]"))
                    )
                except TimeoutException:
                    pass
            # ────────────────────────────────────────────────────────────
            # 1️⃣  Volver a iframe contenido
            driver.switch_to.default_content()
            _esperar_dialog_underlay()
            WebDriverWait(driver, 10).until(
                EC.frame_to_be_available_and_switch_to_it(IFRAME_CONTENIDO_ID)
            )

            # 2️⃣  Abrir modal
            _esperar_dialog_underlay()
            llamar_click_solo(XPATH_BOTON_ABRIR_BUSCADOR_FICHAS, by_method=By.ID)
            _esperar_dialog_underlay()

            # 3️⃣  Cambiar al iframe modal
            WebDriverWait(driver, 10).until(
                EC.frame_to_be_available_and_switch_to_it(IFRAME_MODAL_ID)
            )
            _esperar_dialog_underlay()

            # 4️⃣  Escribir código y buscar
            ingresar_texto_y_enviar("form:codigoFichaITX", num_ficha, by_method=By.ID)
            llamar_click_solo("form:buscarCBT", by_method=By.ID)
            _esperar_dialog_underlay()

            # 5️⃣  Seleccionar la única fila
            llamar_click_solo('//*[@id="form:dtFichas:0:cmdlnkShow"]')
            # salir del iframe modal (se cierra solo, pero aseguramos)
            driver.switch_to.default_content()
            _esperar_dialog_underlay()

            # 6️⃣  Volver a iframe contenido para pulsar Consultar
            WebDriverWait(driver, 10).until(
                EC.frame_to_be_available_and_switch_to_it(IFRAME_CONTENIDO_ID)
            )
            _esperar_dialog_underlay()

            prev_files = set(os.listdir(DOWNLOAD_DIR))
            llamar_click_solo('//*[@id="frmForma1:btnConsultar"]')
            _esperar_dialog_underlay()

            # 7️⃣  Esperar y renombrar con manejo de archivo bloqueado
            nuevo_arch = esperar_nuevo_archivo(DOWNLOAD_DIR, prev_files, timeout=120)

            # Esperar 0.5 s extra para que Chrome libere el handle
            tiempo_limite = time.time() + 10  # máx 10 s
            while True:
                try:
                    with open(nuevo_arch, "rb"):
                        break  # archivo ya libre
                except PermissionError:
                    if time.time() > tiempo_limite:
                        raise
                    time.sleep(0.5)

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
            return True  # Éxito, salimos

        except Exception as e:
            print(f"⚠️  ({intento}) Falló intento para ficha {num_ficha}: {e}")
            # aseguramos salir de iframes antes del próximo intento
            driver.switch_to.default_content()
            _esperar_dialog_underlay()
            if intento == max_reintentos:
                print(f"❌ No se pudo descargar el juicio de {num_ficha} tras {max_reintentos} intentos.")
                return False
            time.sleep(2)  # pequeña pausa antes del siguiente intento



        
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
    connect_db()
    create_tables()
    
    try:
        # 1. Iniciar sesión y seleccionar rol
        iniciar_sesion()

        driver.switch_to.default_content()
        print(f"Seleccionando el rol de '{XPATH_MENU_GESTION_DESARROLLO_CURRICULAR}'...")

        select_element = WebDriverWait(driver, 20).until(
            EC.visibility_of_element_located((By.XPATH, XPATH_SELECT_ROL_DROPDOWN))
        )
        select_rol = Select(select_element)
        time.sleep(2)
        select_rol.select_by_visible_text(XPATH_MENU_GESTION_DESARROLLO_CURRICULAR)
        print(f"Rol '{XPATH_MENU_GESTION_DESARROLLO_CURRICULAR}' seleccionado exitosamente.")

        # 2. Navegación por el menú
        print("Navegando a 'Ejecución a la formación'...")
        llamar_click_solo(XPATH_MENU_EJECUCION_FORMACION_GDC)
        time.sleep(1)

        print("Navegando a 'Administrar Ruta de Aprendizaje'...")
        llamar_click_solo(XPATH_MENU_ADMINISTRAR_RUTA_APRENDIZAJE_GDC)
        time.sleep(1)

        print("Navegando a 'Reportes'...")
        llamar_click_solo(XPATH_MENU_REPORTES_GDC)
        time.sleep(1)

        print("Navegando a 'Reportes de Juicios de Evaluación'...")
        llamar_click_solo(XPATH_MENU_REPORTES_JUICIOS_EVALUACION_GDC)
        time.sleep(3)

        # 3. Cambiar a iframe 'contenido'
        driver.switch_to.default_content()
        try:
            print("Intentando cambiar a iframe 'contenido'...")
            WebDriverWait(driver, 15).until(
                EC.frame_to_be_available_and_switch_to_it(IFRAME_CONTENIDO_ID)
            )
            print("Cambiado a iframe 'contenido' exitosamente.")
        except Exception as iframe_e:
            print(f"ERROR: No se pudo cambiar al iframe 'contenido': {iframe_e}")
            raise

        esperar_cualquier_overlay_desaparecer(timeout=20)

        print("Haciendo clic en el botón para abrir el buscador de fichas...")
        llamar_click_solo(XPATH_BOTON_ABRIR_BUSCADOR_FICHAS, timeout=30, by_method=By.ID)

        # 4. Cambiar al iframe anidado del modal
        print("Buscando iframe anidado del modal...")
        modal_iframe_found = False
        for intento in range(1, 4):
            print(f"Intento {intento}/3 para cambiar al iframe '{IFRAME_MODAL_ID}'")
            try:
                WebDriverWait(driver, 15).until(
                    EC.frame_to_be_available_and_switch_to_it(IFRAME_MODAL_ID)
                )
                print(f"¡Éxito! Cambiado al iframe del modal: '{IFRAME_MODAL_ID}'.")
                modal_iframe_found = True
                break
            except TimeoutException:
                print(f"Timeout: no se encontró el iframe '{IFRAME_MODAL_ID}'. Reintentando...")
                driver.switch_to.parent_frame()
                time.sleep(3)
            except Exception as e:
                print(f"Error inesperado al cambiar al iframe del modal: {e}")
                driver.switch_to.parent_frame()
                time.sleep(3)

        if not modal_iframe_found:
            raise Exception(f"Fallo crítico: No se pudo cambiar al iframe del modal '{IFRAME_MODAL_ID}'.")

        # 5. Aplicar filtros
        print("Aplicando filtros de búsqueda...")
        current_date = datetime.now()
        fecha_inicio_busqueda = current_date.strftime("%d/%m/%Y")

        dep_busqueda = "BOLÍVAR"
        mun_busqueda = "CARTAGENA"
        jornada_busqueda = "DIURNA"
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
        print("Mapeando todas las fichas...")
        global df_fichas_mapeadas
        df_fichas_mapeadas = manejar_paginacion_modal(filtros_actuales)

        if not df_fichas_mapeadas.empty:
            print("\n--- Todas las Fichas Mapeadas ---")
            print(df_fichas_mapeadas.to_string(index=False))
        else:
            print("⚠️ No se encontraron fichas con los filtros aplicados.")

        # 7. Descargar juicios por ficha
        descargar_juicios_evaluacion()

    except Exception as e:
        print(f"\n❌ Error general durante la ejecución: {e}")
        try:
            driver.save_screenshot("error_scraper.png")
            print("🖼️ Captura guardada como 'error_scraper.png'")
        except:
            print("No se pudo guardar la captura del error.")
    finally:
        print("\n🧹 Cerrando navegador y conexión a base de datos...")
        driver.quit()
        close_db()




def descargar_juicios_evaluacion():
    try:
        # --- NUEVA LÓGICA: Iterar sobre cada ficha para descargar su juicio ---
        print("\n--- Iniciando el proceso de descarga de juicios para cada ficha ---")
        if df_fichas_mapeadas.empty:
            print("No se encontraron fichas con los filtros aplicados y después de la paginación. No hay juicios para descargar.")
            return

        for index, ficha_row in df_fichas_mapeadas.iterrows():
            ficha_dict = ficha_row.to_dict()  # Convertir la fila del DataFrame a un diccionario
            print(f"\nProcesando ficha para descarga: {ficha_dict['NumeroFicha']}")

            success = descargar_juicio_evaluacion_por_ficha(ficha_dict)
            if success:
                print(f"✅ Descarga de juicio completada para ficha {ficha_dict['NumeroFicha']}.")
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
        print("\nProceso de automatización completado. Cerrando navegador...")
        driver.quit()
        close_db()  # Cerrar la conexión a la base de datos al finalizar


if __name__ == "__main__":
    print("=== Ejecutando script de scraping directamente (modo standalone) ===")
    descargar_juicios_evaluacion()
