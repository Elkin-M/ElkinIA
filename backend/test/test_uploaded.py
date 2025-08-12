import unittest
from unittest.mock import patch, MagicMock
from pathlib import Path
import backend.uploader_drive as uploader

class TestUploader(unittest.TestCase):

    @patch("backend.uploader_drive.build")
    @patch("backend.uploader_drive.Credentials")
    @patch("backend.uploader_drive.os.path.exists", return_value=True)
    def test_obtener_servicio_drive(self, mock_exists, mock_credentials, mock_build):
        # Simula que las credenciales son válidas
        mock_creds = MagicMock()
        mock_creds.valid = True
        mock_creds.to_json.return_value = '{"token": "fake"}'
        mock_credentials.from_authorized_user_file.return_value = mock_creds

        servicio = uploader.obtener_servicio_drive()

        self.assertTrue(mock_build.called)
        self.assertIsNotNone(servicio)

    @patch("backend.uploader_drive.obtener_servicio_drive")
    @patch("backend.uploader_drive.MediaFileUpload")
    def test_subir_archivo_a_drive_exitoso(self, mock_media_upload, mock_servicio):
        mock_servicio.return_value.files.return_value.create.return_value.execute.return_value = {'id': '12345'}
        mock_media_upload.return_value = MagicMock()

        archivo_dummy = Path("backend/test/dummy.xls")
        archivo_dummy.touch()  # Crear archivo temporal vacío

        resultado = uploader.subir_archivo_a_drive(archivo_dummy)
        self.assertTrue(resultado)

        archivo_dummy.unlink()  # Eliminar archivo de prueba

    def test_subir_archivo_a_drive_no_existe(self):
        ruta_invalida = Path("archivo_que_no_existe.xls")
        resultado = uploader.subir_archivo_a_drive(ruta_invalida)
        self.assertFalse(resultado)

    @patch("backend.uploader_drive.subir_archivo_a_drive", return_value=True)
    def test_subir_todos_los_archivos_a_drive(self, mock_subir):
        carpeta = Path("reportes_juicios")
        carpeta.mkdir(exist_ok=True)
        archivo = carpeta / "prueba.xls"
        archivo.touch()

        uploader.subir_todos_los_archivos_a_drive(str(carpeta))
        self.assertTrue(mock_subir.called)

        archivo.unlink()
        carpeta.rmdir()


if __name__ == "__main__":
    unittest.main()
