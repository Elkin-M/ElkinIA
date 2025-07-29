### backend/database.py
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / "sena_datos.db"


def connect_db():
    return sqlite3.connect(DB_PATH)


def create_tables():
    with connect_db() as conn:
        c = conn.cursor()
        c.execute("""
            CREATE TABLE IF NOT EXISTS fichas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                NumeroFicha TEXT,
                DenominacionPrograma TEXT,
                Departamento TEXT,
                Municipio TEXT,
                Jornada TEXT,
                FechaInicio TEXT,
                FechaFin TEXT,
                Estado TEXT,
                PaginaModalEncontrada INTEGER,
                PosicionEnPagina INTEGER,
                XPathSeleccion TEXT,
                UNIQUE(NumeroFicha)
            )
        """)

        c.execute("""
            CREATE TABLE IF NOT EXISTS descargas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ficha_id INTEGER,
                estado TEXT DEFAULT 'pendiente',
                mensaje TEXT,
                FOREIGN KEY(ficha_id) REFERENCES fichas(id)
            )
        """)
        conn.commit()


def insertar_ficha(ficha):
    with connect_db() as conn:
        c = conn.cursor()
        columnas = ', '.join(ficha.keys())
        valores = tuple(ficha.values())
        placeholders = ', '.join(['?'] * len(ficha))
        c.execute(f"INSERT OR IGNORE INTO fichas ({columnas}) VALUES ({placeholders})", valores)
        conn.commit()


def obtener_fichas():
    with connect_db() as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM fichas")
        return [dict(zip([col[0] for col in c.description], row)) for row in c.fetchall()]


def agregar_descarga_pendiente(ficha_id):
    with connect_db() as conn:
        c = conn.cursor()
        c.execute("INSERT INTO descargas (ficha_id) VALUES (?)", (ficha_id,))
        conn.commit()


def obtener_descargas_pendientes():
    with connect_db() as conn:
        c = conn.cursor()
        c.execute("""
            SELECT d.id, f.*
            FROM descargas d
            JOIN fichas f ON d.ficha_id = f.id
            WHERE d.estado = 'pendiente'
        """)
        return [dict(zip([col[0] for col in c.description], row)) for row in c.fetchall()]


def actualizar_estado_descarga(id_descarga, estado, mensaje=''):
    with connect_db() as conn:
        c = conn.cursor()
        c.execute("UPDATE descargas SET estado = ?, mensaje = ? WHERE id = ?", (estado, mensaje, id_descarga))
        conn.commit()