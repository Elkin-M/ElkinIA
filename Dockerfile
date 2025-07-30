# Usa una imagen base de Docker que ya tiene Chrome preinstalado y optimizada para scraping.
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
# Asegúrate de que las rutas dentro del contenedor sean correctas.
WORKDIR /app/backend

# Instala las dependencias de Python listadas en requirements.txt.
# Esto instala las dependencias DENTRO del contenedor Docker.
RUN pip install -r requirements.txt

# Regresa al directorio raíz de la aplicación para el comando de inicio final.
WORKDIR /app

# Expone el puerto que Uvicorn usará. Render mapeará $PORT a este puerto.
EXPOSE 8000

# Este comando define el punto de entrada para el contenedor.
# Cuando el contenedor se inicie, ejecutará uvicorn.
# Render, sin embargo, seguirá usando su propio "Start Command" en paralelo o en su lugar,
# por lo que las instalaciones de Python en el "Build Command" de Render son necesarias.
ENTRYPOINT ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]