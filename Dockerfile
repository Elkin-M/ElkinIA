# Usa una imagen base de Docker que ya tiene Chrome preinstalado.
FROM browserless/chrome:latest

# Establece el directorio de trabajo dentro del contenedor Docker.
WORKDIR /app

# Copia el archivo requirements.txt y el resto de tu código
COPY backend/requirements.txt ./backend/requirements.txt
COPY backend/ ./backend/
COPY scraper/ ./scraper/

# Instala las dependencias de Python.
WORKDIR /app/backend
RUN pip install -r requirements.txt

# Regresa al directorio raíz de la aplicación.
WORKDIR /app

# Expone los puertos. El 8000 para tu FastAPI, y el 3000 para Browserless Chrome.
EXPOSE 8000
EXPOSE 3000

# Este comando define el punto de entrada para el contenedor.
# Aquí, Uvicorn iniciará tu FastAPI.
# El servidor Browserless Chrome se inicia automáticamente por la imagen base.
ENTRYPOINT ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]