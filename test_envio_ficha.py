import requests

url = "https://script.google.com/macros/s/AKfycby17IUaE5GI71cIUjewXA9_2nuHJgQiAVgy7d2_oi53nH9efjzBqWilSTzEAKPbkR0z/exec"

fichas = [
    {
        "id": "1",
        "ficha": "123456A",
        "programa": "Análisis de Datos",
        "departamento": "Atlántico",
        "ciudad": "Barranquilla",
        "jornada": "Mañana",
        "centro": "CEET",
        "xpath": "//*[@id='form:dtFichas:0:cmdlnkShow']"
    },
    {
        "id": "2",
        "ficha": "789012B",
        "programa": "Desarrollo Web",
        "departamento": "Bolívar",
        "ciudad": "Cartagena",
        "jornada": "Tarde",
        "centro": "CIT",
        "xpath": "//*[@id='form:dtFichas:1:cmdlnkShow']"
    },
    {
        "id": "3",
        "ficha": "345678C",
        "programa": "Ciberseguridad",
        "departamento": "Córdoba",
        "ciudad": "Montería",
        "jornada": "Noche",
        "centro": "CEAI",
        "xpath": "//*[@id='form:dtFichas:2:cmdlnkShow']"
    }
]

for ficha in fichas:
    try:
        response = requests.post(url, json=ficha)
        if response.status_code == 200:
            print(f"✔️ Ficha {ficha['ficha']} enviada correctamente.")
            print("Respuesta:", response.text)
        else:
            print(f"❌ Error al enviar ficha {ficha['ficha']}: {response.status_code}")
            print("Contenido:", response.text)
    except Exception as e:
        print(f"⚠️ Excepción al enviar ficha {ficha['ficha']}: {str(e)}")
