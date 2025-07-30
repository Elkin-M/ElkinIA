# Usa una imagen base de Docker que ya tiene Chrome preinstalado.
# browserless/chrome es excelente porque está optimizada para scraping.
FROM browserless/chrome:latest

# Establece el directorio de trabajo dentro del contenedor Docker.
# Aquí es donde se copiará y ejecutará tu aplicación.
WORKDIR /app

# Copia el archivo requirements.txt (asumiendo que está en backend/requirements.txt)
# y luego copia todo el contenido de tus carpetas 'backend' y 'scraper'.
# Estas rutas son relativas a la raíz de tu repositorio (donde está el Dockerfile).
COPY backend/requirements.txt ./backend/requirements.txt
COPY backend/ ./backend/
COPY scraper/ ./scraper/

# Mueve el directorio de trabajo al lugar donde está requirements.txt para instalar las dependencias.
WORKDIR /app/backend

# Instala las dependencias de Python listadas en requirements.txt.
# Render usa Poetry por defecto, pero con un Dockerfile, podemos usar pip directamente.
RUN pip install -r requirements.txt

# Regresa al directorio raíz de la aplicación para el comando de inicio final.
WORKDIR /app

# Este comando le dice a Docker cómo iniciar tu aplicación.
# Render automáticamente mapeará el puerto 8000 a la variable de entorno $PORT.
ENTRYPOINT ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]