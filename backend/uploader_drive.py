from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.auth.transport.requests import Request
from pathlib import Path
import os
import traceback

# 📌 SCOPES necesarios para crear y subir archivos a Drive
SCOPES = ['https://www.googleapis.com/auth/drive.file']

# 📁 Rutas base
BASE_DIR = Path(__file__).resolve().parent
CREDENTIALS_FILE = BASE_DIR / "credentials.json"
TOKEN_FILE = BASE_DIR / "token.json"

# 📌 ID de la carpeta destino en tu Google Drive
FOLDER_ID = '1u3ScbWFYet0tNTG-6vE1d4c24vLKB04Y'  # <-- Reemplaza con la carpeta real

def obtener_servicio_drive():
    print("🔐 Obteniendo servicio de Google Drive...")
    creds = None

    try:
        if TOKEN_FILE.exists():
            print(f"📄 Cargando token desde {TOKEN_FILE}")
            creds = Credentials.from_authorized_user_file(str(TOKEN_FILE), SCOPES)

        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                print("🔁 Refrescando token...")
                creds.refresh(Request())
            else:
                if not CREDENTIALS_FILE.exists():
                    print(f"❌ Archivo de credenciales no encontrado: {CREDENTIALS_FILE}")
                    return None
                print("🌐 Iniciando flujo de autenticación...")
                flow = InstalledAppFlow.from_client_secrets_file(str(CREDENTIALS_FILE), SCOPES)
                creds = flow.run_local_server(port=0)
            # Guardar nuevo token
            with open(TOKEN_FILE, 'w') as token:
                token.write(creds.to_json())
                print(f"✅ Token guardado en {TOKEN_FILE}")
    except Exception as e:
        print(f"❌ Error autenticando con Google Drive: {e}")
        traceback.print_exc()
        return None

    print("✅ Servicio de Drive inicializado correctamente.\n")
    return build('drive', 'v3', credentials=creds)


def subir_archivo_a_drive(servicio, ruta_archivo: Path):
    if not ruta_archivo.exists():
        print(f"❌ Archivo no encontrado: {ruta_archivo}")
        return False

    try:
        archivo_metadata = {
            "name": ruta_archivo.name,
            "parents": [FOLDER_ID],  # ✅ Aquí se asigna la carpeta destino
        }

        media = MediaFileUpload(str(ruta_archivo), resumable=True)
        archivo = servicio.files().create(
            body=archivo_metadata,
            media_body=media,
            fields="id"
        ).execute()

        archivo_id = archivo.get('id')
        print(f"✅ Archivo subido con ID: {archivo_id}\n")
        return True

    except Exception as e:
        print(f"❌ Error subiendo {ruta_archivo.name}: {e}")
        traceback.print_exc()
        return False
    

def subir_archivo_individual_a_drive(ficha_data: dict, archivo_path: Path):
    """
    Sube un solo archivo .xls a la carpeta específica en Google Drive.
    """
    print(f"📤 Iniciando subida individual para ficha {ficha_data['NumeroFicha']}...")

    servicio = obtener_servicio_drive()
    if not servicio:
        print("❌ No se pudo obtener el servicio de Drive.")
        return False

    return subir_archivo_a_drive(servicio, archivo_path)


def subir_todos_los_archivos_a_drive(directorio_local: str = "../reportes_juicios"):
    print(f"\n📂 Buscando archivos en: {directorio_local}")
    directorio = (BASE_DIR / directorio_local).resolve()

    if not directorio.exists() or not directorio.is_dir():
        print(f"❌ El directorio no existe o no es válido: {directorio}")
        return

    archivos_xls = list(directorio.glob("*.xls"))
    total = len(archivos_xls)

    if total == 0:
        print(f"⚠️ No se encontraron archivos .xls en: {directorio}")
        return

    print(f"📋 Total de archivos .xls encontrados: {total}\n")

    servicio = obtener_servicio_drive()
    if not servicio:
        print("❌ No se pudo inicializar el servicio de Drive.")
        return

    subidos = 0
    errores = 0

    for archivo in archivos_xls:
        print(f"🚀 Subiendo archivo: {archivo.name}")
        resultado = subir_archivo_a_drive(servicio, archivo)
        if resultado:
            subidos += 1
        else:
            errores += 1

    print("\n📊 Resumen del proceso:")
    print(f"✅ Archivos subidos: {subidos}")
    print(f"❌ Fallos al subir: {errores}")
    print("🟢 Proceso completado.\n")


if __name__ == "__main__":
    subir_todos_los_archivos_a_drive()
