#!/usr/bin/env bash

echo "--- Iniciando script de construcción personalizado ---"

# Limpiar y actualizar listas de paquetes
echo "Limpiando cache de apt y actualizando listas de paquetes..."
apt-get clean && apt-get update -y

# Instalar dependencias necesarias para añadir el repositorio de Chrome y para Chrome mismo
echo "Instalando dependencias necesarias (ca-certificates, curl, gnupg y dependencias de Chrome)..."
apt-get install -yq ca-certificates curl gnupg \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libcups2 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libxss1 \
    libxtst6 \
    xdg-utils

# Añadir la clave GPG de Google Chrome
echo "Añadiendo clave GPG de Google Chrome..."
mkdir -p /etc/apt/keyrings
curl -fsSL https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /etc/apt/keyrings/google-chrome.gpg

# Añadir el repositorio de Google Chrome
echo "Añadiendo repositorio oficial de Google Chrome..."
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/google-chrome.gpg] https://dl.google.com/linux/chrome/deb/ stable main" | tee /etc/apt/sources.list.d/google-chrome.list > /dev/null

# Actualizar listas de paquetes después de añadir el repositorio de Chrome
echo "Actualizando listas de paquetes después de añadir el repositorio de Chrome..."
apt-get update -y

# Instalar Google Chrome Stable
echo "Instalando google-chrome-stable..."
apt-get install -y google-chrome-stable --no-install-recommends

# Verificar si Chrome se instaló correctamente
if ! command -v google-chrome &> /dev/null
then
    echo "ERROR: Google Chrome no se encontró después de la instalación. Revisar logs de apt-get."
    exit 1 # Falla el build si Chrome no se instala
else
    echo "Google Chrome instalado correctamente en $(command -v google-chrome)"
fi

# Instalar las dependencias de Python
echo "Instalando dependencias de Python desde backend/requirements.txt..."
pip install -r backend/requirements.txt

echo "--- Script de construcción personalizado finalizado exitosamente ---"