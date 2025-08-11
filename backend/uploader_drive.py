from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.auth.transport.requests import Request
from pathlib import Path
import os

# 📌 SCOPES necesarios para crear y subir archivos a Drive
SCOPES = ['https://www.googleapis.com/auth/drive.file']

# 📁 Ruta al archivo de credenciales descargado desde Google Cloud
CREDENTIALS_FILE = 'credentials.json'
TOKEN_FILE = 'token.json'  # Se crea después del primer login autorizado

# 📌 Coloca aquí el ID de la carpeta destino en tu Google Drive
FOLDER_ID = '1u3ScbWFYet0tNTG-6vE1d4c24vLKB04Y'  # <-- Reemplaza esto con el ID real de la carpeta

def obtener_servicio_drive():
    creds = None

    # Cargar token si ya existe
    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)

    # Si no hay token válido, solicitar autorización
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)
            creds = flow.run_local_server(port=0)
        with open(TOKEN_FILE, 'w') as token:
            token.write(creds.to_json())

    return build('drive', 'v3', credentials=creds)


def subir_archivo_a_drive(ruta_archivo: Path, nombre_drive: str = None, mime_type: str = None):
    """Sube un archivo individual a una carpeta de Google Drive"""
    if not ruta_archivo.exists():
        print(f"❌ Archivo no encontrado: {ruta_archivo}")
        return None

    if nombre_drive is None:
        nombre_drive = ruta_archivo.name
    if mime_type is None:
        mime_type = "application/vnd.ms-excel"  # para .xls

    servicio = obtener_servicio_drive()

    archivo_metadata = {
        'name': nombre_drive,
        'parents': [FOLDER_ID]  # 🔁 Aquí se define la carpeta destino
    }

    media = MediaFileUpload(str(ruta_archivo), mimetype=mime_type)

    archivo = servicio.files().create(
        body=archivo_metadata,
        media_body=media,
        fields='id'
    ).execute()

    print(f"✅ Archivo '{nombre_drive}' subido con ID: {archivo.get('id')}")
    return archivo.get('id')


def subir_todos_los_archivos_a_drive(directorio_local: str = "reportes_juicios"):
    """Sube todos los archivos .xls de una carpeta local a Google Drive"""
    directorio = Path(directorio_local)
    if not directorio.exists():
        print(f"❌ El directorio no existe: {directorio}")
        return

    archivos_xls = list(directorio.glob("*.xls"))
    if not archivos_xls:
        print(f"⚠️ No se encontraron archivos .xls en: {directorio}")
        return

    for archivo in archivos_xls:
        subir_archivo_a_drive(archivo)

