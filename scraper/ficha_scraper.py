# scraper/ficha_scraper.py
import pandas as pd
from backend.juicio_logic import manejar_paginacion_modal


def extraer_fichas(current_filters: dict) -> pd.DataFrame:
    print("\n[SCRAPER] Iniciando extracción de fichas...")
    df_fichas = manejar_paginacion_modal(current_filters)
    print("[SCRAPER] Extracción finalizada. Total fichas:", len(df_fichas))
    return df_fichas

# scraper/run_scraper.py
from datetime import datetime
from backend.database import connect_db, close_db, create_tables
from backend.juicio_logic import descargar_juicio_evaluacion_por_ficha
from scraper.ficha_scraper import extraer_fichas

# Filtros personalizados
filtros = {
    "departamento": "BOLÍVAR",
    "municipio": "CARTAGENA",
    "jornada": "DIURNA",
    "codigo_ficha": None,
    "fecha_inicial": "03/07/2025",
    "fecha_final": None
}

def run():
    connect_db()
    create_tables()
    
    fichas = extraer_fichas(filtros)
    if fichas.empty:
        print("No se encontraron fichas para descargar juicios.")
    else:
        for _, ficha in fichas.iterrows():
            ficha_dict = ficha.to_dict()
            print(f"\nProcesando ficha {ficha_dict['NumeroFicha']}...")
            ok = descargar_juicio_evaluacion_por_ficha(ficha_dict)
            print("Resultado:", "✅ OK" if ok else "❌ Falló")

    close_db()

if __name__ == "__main__":
    run()
