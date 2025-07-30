#!/usr/bin/env bash

# Instalar Google Chrome y sus dependencias
# Estas líneas son para sistemas basados en Debian/Ubuntu (común en entornos de Render)
echo "Actualizando listas de paquetes..."
apt-get update -y
echo "Instalando dependencias de Chrome..."
apt-get install -yq ca-certificates curl gnupg

echo "Añadiendo clave GPG de Google Chrome..."
mkdir -p /etc/apt/keyrings
curl -fsSL https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /etc/apt/keyrings/google-chrome.gpg

echo "Añadiendo repositorio de Google Chrome..."
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/google-chrome.gpg] https://dl.google.com/linux/chrome/deb/ stable main" | tee /etc/apt/sources.list.d/google-chrome.list > /dev/null

echo "Actualizando listas de paquetes de nuevo después de añadir el repositorio de Chrome..."
apt-get update -y
echo "Instalando google-chrome-stable..."
apt-get install -y google-chrome-stable

# Instalar las dependencias de Python (tu requirements.txt)
echo "Instalando dependencias de Python..."
pip install -r requirements.txt

echo "Script de construcción finalizado."