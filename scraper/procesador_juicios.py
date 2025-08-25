import json
from hashlib import sha256
from datetime import datetime
from pathlib import Path

VERSIONS_FILE = Path(__file__).resolve().parent / "datos" / "versiones_juicios.json"

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
        return True  # Hubo cambio
    return False  # No hubo cambio
