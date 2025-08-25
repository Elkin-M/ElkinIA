# scraper/util.py
import os
import time
import re
import shutil

def slugify(texto: str) -> str:
    slug = re.sub(r"[^\w\s-]", "", texto, flags=re.UNICODE).strip().lower()
    return re.sub(r"[\s_-]+", "_", slug)

def esperar_nuevo_archivo(dir_path: str, existentes: set, timeout=60):
    fin = time.time() + timeout
    while time.time() < fin:
        actuales = set(os.listdir(dir_path))
        nuevos = [f for f in actuales - existentes if not f.endswith(".crdownload")]
        if nuevos:
            return os.path.join(dir_path, nuevos[0])
        time.sleep(0.5)
    raise TimeoutError("No llegó ningún archivo nuevo a la carpeta de descargas")
