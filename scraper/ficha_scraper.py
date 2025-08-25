import pandas as pd
import logging
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from backend.juicio_logic import JuicioLogic, manejar_paginacion_modal
import time
from scraper.selenium_utils import WebDriverManager, SeleniumUtils

# Configurar logging
logger = logging.getLogger(__name__)

class FichaScraper:
    def __init__(self):
        driver_manager = WebDriverManager()
        self.juicio_logic = JuicioLogic(driver_manager)

        
        # Constantes del scraper original
        self.URL_BASE = "http://senasofiaplus.edu.co/sofia-public/"
        self.USUARIO_LOGIN = "1050962935"
        self.CONTRASENA_LOGIN = "PapaJose92805331050*"
        
        # XPaths y selectores para login y navegación
        self.XPATH_INPUT_USUARIO_LOGIN = "/html/body/form/div/div/div/div[2]/input"
        self.XPATH_INPUT_CONTRASENA_LOGIN = "/html/body/form/div/div/div/div[3]/input"
        self.XPATH_BOTON_LOGIN_FORM = "/html/body/form/div/div/div/div[7]/input"
        self.XPATH_SELECT_ROL_DROPDOWN = '//*[@id="seleccionRol:roles"]'
        self.MENU_GESTION_DESARROLLO_CURRICULAR = 'Gestión Desarrollo Curricular'
        
        # Menús de navegación
        self.XPATH_MENU_EJECUCION_FORMACION_GDC = '/html/body[1]/div[1]/div[1]/nav/div[2]/div/div/form[2]/ul/li[6]/a'
        self.XPATH_MENU_ADMINISTRAR_RUTA_APRENDIZAJE_GDC = '/html/body[1]/div[1]/div[1]/nav/div[2]/div/div/form[2]/ul/li[6]/ul/li[1]/a'
        self.XPATH_MENU_REPORTES_GDC = '/html/body[1]/div[1]/div[1]/nav/div[2]/div/div/form[2]/ul/li[6]/ul/li[1]/ul/li[3]/a'
        self.XPATH_MENU_REPORTES_JUICIOS_EVALUACION_GDC = '/html/body[1]/div[1]/div[1]/nav/div[2]/div/div/form[2]/ul/li[6]/ul/li[1]/ul/li[3]/ul/li[4]/a'
        
        # IFrames
        self.IFRAME_LOGIN = "registradoBox1"
        self.IFRAME_CONTENIDO = 'contenido'
        self.IFRAME_MODAL = "modalDialogContentviewDialog2"

def extraer_fichas(current_filters: dict) -> pd.DataFrame:
    """Función principal para extraer fichas con los filtros dados"""
    print("\n[SCRAPER] Iniciando extracción de fichas...")
    logger.info("🔍 Iniciando extracción de fichas...")
    
    scraper = FichaScraper()
    
    try:
        with scraper.juicio_logic.driver_manager.safe_operation() as driver:
            # 1. Realizar login
            _realizar_login(scraper)
            
            # 2. Navegar a reportes
            _navegar_a_reportes(scraper)
            
            # 3. Abrir modal de búsqueda y aplicar filtros
            _abrir_modal_busqueda(scraper, current_filters)
            
            # 4. Extraer todas las fichas con paginación
            df_fichas = manejar_paginacion_modal(current_filters, scraper.juicio_logic)
            
            print(f"[SCRAPER] Extracción finalizada. Total fichas: {len(df_fichas)}")
            logger.info(f"✅ Extracción completada: {len(df_fichas)} fichas encontradas")
            
            return df_fichas
            
    except Exception as e:
        logger.error(f"💥 Error durante la extracción de fichas: {e}")
        print(f"[SCRAPER] Error: {e}")
        return pd.DataFrame()
    
    finally:
        # Cleanup
        scraper.juicio_logic.driver_manager.close_driver()

def _realizar_login(scraper: FichaScraper):
    """Realiza el proceso de login"""
    logger.info("🔐 Iniciando sesión...")
    
    driver = scraper.juicio_logic.driver_manager.get_driver()
    driver.get(scraper.URL_BASE)
    time.sleep(3)
    
    # Cambiar a iframe de login
    if not scraper.juicio_logic.selenium_utils.safe_switch_to_frame(scraper.IFRAME_LOGIN):
        raise Exception("No se pudo acceder al iframe de login")
    
    # Ingresar credenciales
    if not scraper.juicio_logic.selenium_utils.safe_send_keys(scraper.XPATH_INPUT_USUARIO_LOGIN, scraper.USUARIO_LOGIN, By.XPATH):
        raise Exception("Error ingresando usuario")
        
    if not scraper.juicio_logic.selenium_utils.safe_send_keys(scraper.XPATH_INPUT_CONTRASENA_LOGIN, scraper.CONTRASENA_LOGIN, By.XPATH):
        raise Exception("Error ingresando contraseña")
    
    # Hacer click en login
    if not scraper.juicio_logic.selenium_utils.safe_click(scraper.XPATH_BOTON_LOGIN_FORM, By.XPATH):
        raise Exception("Error haciendo click en login")
    
    time.sleep(5)
    
    # Seleccionar rol
    scraper.juicio_logic.selenium_utils.safe_switch_to_default()
    if not scraper.juicio_logic.selenium_utils.safe_select_dropdown(
        scraper.XPATH_SELECT_ROL_DROPDOWN, 
        scraper.MENU_GESTION_DESARROLLO_CURRICULAR, 
        By.XPATH
    ):
        raise Exception("Error seleccionando rol")
    
    logger.info("✅ Login completado exitosamente")

def _navegar_a_reportes(scraper: FichaScraper):
    """Navega hasta la sección de reportes de juicios"""
    logger.info("🧭 Navegando a reportes de juicios...")
    
    navigation_steps = [
        ("Ejecución a la formación", scraper.XPATH_MENU_EJECUCION_FORMACION_GDC),
        ("Administrar Ruta de Aprendizaje", scraper.XPATH_MENU_ADMINISTRAR_RUTA_APRENDIZAJE_GDC),
        ("Reportes", scraper.XPATH_MENU_REPORTES_GDC),
        ("Reportes de Juicios", scraper.XPATH_MENU_REPORTES_JUICIOS_EVALUACION_GDC)
    ]
    
    for step_name, xpath in navigation_steps:
        logger.info(f"📂 Navegando a '{step_name}'...")
        if not scraper.juicio_logic.selenium_utils.safe_click(xpath, By.XPATH):
            raise Exception(f"Error navegando a {step_name}")
        time.sleep(2)
    
    # Cambiar al iframe de contenido
    if not scraper.juicio_logic.selenium_utils.safe_switch_to_frame(scraper.IFRAME_CONTENIDO):
        raise Exception("No se pudo acceder al iframe de contenido")
    
    logger.info("✅ Navegación completada")

def _abrir_modal_busqueda(scraper: FichaScraper, filtros: dict):
    """Abre el modal de búsqueda y aplica los filtros"""
    logger.info("🔧 Abriendo modal de búsqueda y aplicando filtros...")
    
    # Esperar y quitar overlays
    scraper.juicio_logic.selenium_utils.wait_for_overlay_disappear()
    
    # Abrir modal de búsqueda
    if not scraper.juicio_logic.selenium_utils.safe_click(scraper.juicio_logic.BOTON_ABRIR_BUSCADOR_FICHAS, By.ID):
        raise Exception("Error abriendo buscador de fichas")
    
    # Cambiar al iframe del modal
    if not scraper.juicio_logic.selenium_utils.safe_switch_to_frame(scraper.IFRAME_MODAL):
        raise Exception("No se pudo acceder al iframe del modal")
    
    # Aplicar filtros de búsqueda
    _aplicar_filtros_busqueda(scraper, filtros)

def _aplicar_filtros_busqueda(scraper: FichaScraper, filtros: dict):
    """Aplica los filtros en el modal de búsqueda"""
    logger.info("🔧 Aplicando filtros de búsqueda...")
    
    # Aplicar filtro de código de ficha si existe
    if filtros.get('codigo_ficha'):
        if not scraper.juicio_logic.selenium_utils.safe_send_keys(
            scraper.juicio_logic.INPUT_CODIGO_FICHA_MODAL, 
            filtros['codigo_ficha'], 
            By.ID
        ):
            logger.error(f"Error ingresando código de ficha: {filtros['codigo_ficha']}")
    
    # Aplicar filtro de departamento si existe
    if filtros.get('departamento'):
        if not scraper.juicio_logic.selenium_utils.safe_select_dropdown(
            scraper.juicio_logic.SELECT_DEPARTAMENTO_MODAL, 
            filtros['departamento'], 
            By.ID
        ):
            logger.error(f"Error seleccionando departamento: {filtros['departamento']}")
    
    time.sleep(2)  # Esperar a que se actualice el dropdown de municipios
    
    # Aplicar filtro de municipio si existe
    if filtros.get('municipio'):
        if not scraper.juicio_logic.selenium_utils.safe_select_dropdown(
            scraper.juicio_logic.SELECT_MUNICIPIO_MODAL, 
            filtros['municipio'], 
            By.XPATH
        ):
            logger.error(f"Error seleccionando municipio: {filtros['municipio']}")
    
    # Aplicar filtro de jornada si existe
    if filtros.get('jornada'):
        if not scraper.juicio_logic.selenium_utils.safe_select_dropdown(
            scraper.juicio_logic.SELECT_JORNADA_MODAL, 
            filtros['jornada'], 
            By.ID
        ):
            logger.error(f"Error seleccionando jornada: {filtros['jornada']}")
    
    # Aplicar fechas si existen (aquí necesitarías agregar los selectores para fechas)
    if filtros.get('fecha_inicial'):
        logger.info(f"Aplicando fecha inicial: {filtros['fecha_inicial']}")
        # Aquí necesitarías el selector específico para fecha inicial
    
    if filtros.get('fecha_final'):
        logger.info(f"Aplicando fecha final: {filtros['fecha_final']}")
        # Aquí necesitarías el selector específico para fecha final
    
    # Hacer clic en buscar
    if not scraper.juicio_logic.selenium_utils.safe_click(scraper.juicio_logic.BOTON_CONSULTAR_MODAL, By.ID):
        raise Exception("Error ejecutando búsqueda")
    
    # Esperar resultados
    driver = scraper.juicio_logic.driver_manager.get_driver()
    WebDriverWait(driver, 20).until(
        EC.presence_of_element_located((By.XPATH, f"{scraper.juicio_logic.XPATH_TABLA_FICHAS_MODAL}//tbody/tr"))
    )
    
    logger.info("✅ Filtros aplicados y resultados cargados")

# Función de conveniencia para usar desde otros módulos
def mapear_fichas_con_filtros(filtros: dict) -> pd.DataFrame:
    """Mapea fichas con filtros específicos"""
    return extraer_fichas(filtros)