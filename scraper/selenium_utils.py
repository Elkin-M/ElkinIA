from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import (
    TimeoutException, NoSuchElementException, WebDriverException, 
    ElementClickInterceptedException, StaleElementReferenceException, 
    NoSuchFrameException, UnexpectedAlertPresentException
)
import time
import os
import logging
from typing import Dict, Set, Tuple, List, Optional
from contextlib import contextmanager

# Configurar logging
logger = logging.getLogger(__name__)

class WebDriverManager:
    """Maneja el WebDriver de forma segura con recuperación ante errores"""
    
    def __init__(self):
        self.driver = None
        self.download_dir = os.path.join(os.getcwd(), "reportes_juicios")
        # Configurar ruta del driver (ajustar según tu sistema)
        self.ruta_driver = self._detectar_ruta_driver()
        self.max_reintentos = 3
        
    def _detectar_ruta_driver(self):
        """Detecta la ruta del chromedriver según el sistema"""
        rutas_posibles = [
            r"/home/sennova/Documentos/sennova/chrome-win/chromedriver" # Ruta original
            r"C:\chromedriver\chromedriver.exe",  # Ruta común Windows
            "/usr/local/bin/chromedriver",  # Ruta común Linux/Mac
            "chromedriver.exe",  # En PATH
            "chromedriver"  # En PATH (Linux/Mac)
        ]
        
        for ruta in rutas_posibles:
            if os.path.exists(ruta):
                logger.info(f"ChromeDriver encontrado en: {ruta}")
                return ruta
        
        # Si no se encuentra, intentar usar el que está en PATH
        logger.warning("ChromeDriver no encontrado en rutas predefinidas, usando PATH")
        return "chromedriver"
        
    def get_driver(self) -> webdriver.Chrome:
        """Retorna el driver, inicializándolo si es necesario"""
        if self.driver is None or not self._is_driver_alive():
            logger.info("Inicializando WebDriver...")
            self._initialize_driver()
        return self.driver
    
    def _is_driver_alive(self) -> bool:
        """Verifica si el driver está activo y funcional"""
        try:
            if self.driver is None:
                return False
            # Prueba simple para verificar que el driver responde
            self.driver.current_url
            return True
        except Exception:
            logger.warning("Driver no está activo, necesita reinicialización")
            return False
    
    def _initialize_driver(self):
        """Inicializa el WebDriver con todas las configuraciones"""
        try:
            # Crear carpeta de descargas si no existe
            if not os.path.exists(self.download_dir):
                os.makedirs(self.download_dir)
                logger.info(f"Carpeta de descargas creada: {self.download_dir}")
            
            # Configurar opciones de Chrome
            chrome_options = Options()
            chrome_options.add_argument("--start-maximized")
            chrome_options.add_argument("--disable-notifications")
            chrome_options.add_argument("--disable-popup-blocking")
            chrome_options.add_argument("--disable-extensions")
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            chrome_options.add_argument("--disable-gpu")  # Ayuda con estabilidad
            chrome_options.add_argument("--disable-web-security")
            
            # Configuraciones para descarga automática
            prefs = {
                "download.default_directory": self.download_dir,
                "download.prompt_for_download": False,
                "download.directory_upgrade": True,
                "safeBrowsing.enabled": True,
                "profile.default_content_setting_values.notifications": 2
            }
            chrome_options.add_experimental_option("prefs", prefs)
            
            # Crear el driver
            service = Service(self.ruta_driver)
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
            
            # Configurar timeouts
            self.driver.implicitly_wait(5)
            self.driver.set_page_load_timeout(30)
            
            logger.info("WebDriver inicializado correctamente")
            
        except Exception as e:
            logger.error(f"Error al inicializar WebDriver: {e}")
            raise
    
    def restart_driver(self):
        """Reinicia el driver completamente"""
        logger.info("Reiniciando WebDriver...")
        self.close_driver()
        self._initialize_driver()
    
    def close_driver(self):
        """Cierra el driver de forma segura"""
        if self.driver is not None:
            try:
                self.driver.quit()
                logger.info("WebDriver cerrado correctamente")
            except Exception as e:
                logger.warning(f"Error al cerrar WebDriver: {e}")
            finally:
                self.driver = None
    
    @contextmanager
    def safe_operation(self):
        """Context manager para operaciones seguras con recuperación"""
        for intento in range(self.max_reintentos):
            try:
                driver = self.get_driver()
                yield driver
                break
            except Exception as e:
                logger.error(f"Error en operación (intento {intento + 1}): {e}")
                if intento < self.max_reintentos - 1:
                    logger.info("Reiniciando driver para recuperación...")
                    self.restart_driver()
                    time.sleep(2)
                else:
                    raise


class SeleniumUtils:
    """Utilidades para operaciones comunes de Selenium"""
    
    def __init__(self, driver_manager: WebDriverManager):
        self.driver_manager = driver_manager
    
    def safe_switch_to_default(self):
        """Cambia al contexto principal de forma segura"""
        try:
            driver = self.driver_manager.get_driver()
            driver.switch_to.default_content()
            time.sleep(0.5)
            return True
        except Exception as e:
            logger.error(f"Error al cambiar a default content: {e}")
            return False
    
    def safe_switch_to_frame(self, frame_id: str, timeout: int = 10) -> bool:
        """Cambia a un iframe de forma segura"""
        try:
            driver = self.driver_manager.get_driver()
            self.safe_switch_to_default()
            WebDriverWait(driver, timeout).until(
                EC.frame_to_be_available_and_switch_to_it(frame_id)
            )
            logger.info(f"Cambiado exitosamente al iframe: {frame_id}")
            return True
        except Exception as e:
            logger.error(f"Error al cambiar al iframe {frame_id}: {e}")
            return False
    
    def wait_for_overlay_disappear(self, timeout: int = 10):
        """Espera a que desaparezcan los overlays"""
        try:
            driver = self.driver_manager.get_driver()
            WebDriverWait(driver, timeout).until_not(
                EC.presence_of_element_located((By.CLASS_NAME, "ui-blockui"))
            )
        except TimeoutException:
            pass  # Es normal que no haya overlay
        except Exception as e:
            logger.warning(f"Error esperando overlay: {e}")
    
    def safe_click(self, locator: str, by_method=By.XPATH, timeout: int = 20, max_attempts: int = 3) -> bool:
        """Hace clic de forma segura con múltiples estrategias"""
        driver = self.driver_manager.get_driver()
        
        for attempt in range(max_attempts):
            try:
                # Esperar y quitar overlays
                self.wait_for_overlay_disappear()
                
                method_name = self._get_method_name(by_method)
                logger.info(f"Intento {attempt + 1}/{max_attempts}: Clic en '{locator}' usando {method_name}")
                
                # Esperar que el elemento sea clickeable
                element = WebDriverWait(driver, timeout).until(
                    EC.element_to_be_clickable((by_method, locator))
                )
                
                # Scroll al elemento si es necesario
                driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", element)
                time.sleep(0.5)
                
                # Intentar clic normal
                element.click()
                logger.info(f"Clic exitoso en: '{locator}'")
                return True
                
            except ElementClickInterceptedException:
                logger.warning(f"Elemento interceptado en intento {attempt + 1}, reintentando...")
                self.wait_for_overlay_disappear()
                
                if attempt == max_attempts - 1:
                    # Último intento con JavaScript
                    try:
                        element = driver.find_element(by_method, locator)
                        driver.execute_script("arguments[0].click();", element)
                        logger.info(f"Clic exitoso con JavaScript en: '{locator}'")
                        return True
                    except Exception as js_e:
                        logger.error(f"Error en clic JavaScript: {js_e}")
                        
            except Exception as e:
                logger.error(f"Error en clic (intento {attempt + 1}): {e}")
                
                if attempt == max_attempts - 1:
                    # Último intento con ActionChains
                    try:
                        element = driver.find_element(by_method, locator)
                        ActionChains(driver).move_to_element(element).click().perform()
                        logger.info(f"Clic exitoso con ActionChains en: '{locator}'")
                        return True
                    except Exception as ac_e:
                        logger.error(f"Error en ActionChains: {ac_e}")
                
            time.sleep(1)
        
        logger.error(f"No se pudo hacer clic en: {locator}")
        return False
    
    def safe_send_keys(self, locator: str, text: str, by_method=By.ID, timeout: int = 20) -> bool:
        """Envía texto de forma segura"""
        try:
            driver = self.driver_manager.get_driver()
            element = WebDriverWait(driver, timeout).until(
                EC.visibility_of_element_located((by_method, locator))
            )
            element.clear()
            element.send_keys(text)
            logger.info(f"Texto '{text}' enviado a: {locator}")
            return True
        except Exception as e:
            logger.error(f"Error enviando texto a {locator}: {e}")
            return False
    
    def safe_select_dropdown(self, locator: str, value: str, by_method=By.ID, timeout: int = 20) -> bool:
        """Selecciona un valor en dropdown de forma segura"""
        try:
            driver = self.driver_manager.get_driver()
            element = WebDriverWait(driver, timeout).until(
                EC.element_to_be_clickable((by_method, locator))
            )
            select = Select(element)
            select.select_by_visible_text(value)
            logger.info(f"Valor '{value}' seleccionado en: {locator}")
            return True
        except Exception as e:
            logger.error(f"Error seleccionando en dropdown {locator}: {e}")
            return False
    
    def safe_get_text(self, locator: str, by_method=By.XPATH, timeout: int = 10) -> str:
        """Obtiene texto de un elemento de forma segura"""
        try:
            driver = self.driver_manager.get_driver()
            element = WebDriverWait(driver, timeout).until(
                EC.presence_of_element_located((by_method, locator))
            )
            return element.text.strip()
        except Exception as e:
            logger.error(f"Error obteniendo texto de {locator}: {e}")
            return ""
    
    def safe_get_elements(self, locator: str, by_method=By.XPATH, timeout: int = 10) -> list:
        """Obtiene una lista de elementos de forma segura"""
        try:
            driver = self.driver_manager.get_driver()
            WebDriverWait(driver, timeout).until(
                EC.presence_of_element_located((by_method, locator))
            )
            return driver.find_elements(by_method, locator)
        except Exception as e:
            logger.error(f"Error obteniendo elementos {locator}: {e}")
            return []
    
    def wait_for_element(self, locator: str, by_method=By.XPATH, timeout: int = 20) -> bool:
        """Espera a que un elemento esté presente"""
        try:
            driver = self.driver_manager.get_driver()
            WebDriverWait(driver, timeout).until(
                EC.presence_of_element_located((by_method, locator))
            )
            return True
        except TimeoutException:
            logger.warning(f"Timeout esperando elemento: {locator}")
            return False
        except Exception as e:
            logger.error(f"Error esperando elemento {locator}: {e}")
            return False
    
    def scroll_to_element(self, locator: str, by_method=By.XPATH) -> bool:
        """Hace scroll hasta un elemento"""
        try:
            driver = self.driver_manager.get_driver()
            element = driver.find_element(by_method, locator)
            driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", element)
            time.sleep(0.5)
            return True
        except Exception as e:
            logger.error(f"Error haciendo scroll a {locator}: {e}")
            return False
    
    def _get_method_name(self, by_method) -> str:
        """Obtiene el nombre legible del método de localización"""
        method_map = {
            By.XPATH: "XPATH",
            By.ID: "ID", 
            By.CLASS_NAME: "CLASS_NAME",
            By.CSS_SELECTOR: "CSS_SELECTOR",
            By.TAG_NAME: "TAG_NAME",
            By.NAME: "NAME"
        }
        return method_map.get(by_method, str(by_method))

    def take_screenshot(self, filename: str = None) -> str:
        """Toma una captura de pantalla"""
        try:
            driver = self.driver_manager.get_driver()
            if not filename:
                filename = f"screenshot_{int(time.time())}.png"
            
            screenshot_path = os.path.join(self.driver_manager.download_dir, filename)
            driver.save_screenshot(screenshot_path)
            logger.info(f"Screenshot guardado: {screenshot_path}")
            return screenshot_path
        except Exception as e:
            logger.error(f"Error tomando screenshot: {e}")
            return ""