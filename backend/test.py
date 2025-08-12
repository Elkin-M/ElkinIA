from uploader_drive import obtener_servicio_drive, subir_archivo_a_drive
from pathlib import Path

if __name__ == "__main__":
    print("🔐 Obteniendo servicio de Google Drive...")
    servicio = obtener_servicio_drive()
    print("✅ Servicio listo.")

    # Ruta al archivo real para subir (usa pathlib)
    ruta_archivo = Path.cwd() / "prueba_real.xls"

    if not ruta_archivo.exists():
        with open(ruta_archivo, "w") as f:
            f.write("Contenido de prueba para archivo real")

    print(f"📤 Subiendo archivo real: {ruta_archivo}")
    subir_archivo_a_drive(servicio, ruta_archivo)
