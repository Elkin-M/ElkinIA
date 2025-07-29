### backend/juicio_logic.py
from .database import agregar_descarga_pendiente, obtener_descargas_pendientes, actualizar_estado_descarga
from scraper.run_scraper import descargar_juicio_evaluacion_por_ficha


def procesar_descargas_pendientes():
    tareas = obtener_descargas_pendientes()
    for tarea in tareas:
        id_descarga = tarea['id']
        print(f"\nDescargando juicio para ficha {tarea['NumeroFicha']}...")
        try:
            success = descargar_juicio_evaluacion_por_ficha(tarea)
            if success:
                actualizar_estado_descarga(id_descarga, 'descargado')
            else:
                actualizar_estado_descarga(id_descarga, 'fallido', 'Descarga fallida')
        except Exception as e:
            actualizar_estado_descarga(id_descarga, 'fallido', str(e))


def encolar_descarga(ficha_id):
    agregar_descarga_pendiente(ficha_id)
