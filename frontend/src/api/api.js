const API_URL = import.meta.env.VITE_API_URL;

/**
 * Función unificada para ejecutar cualquier acción del scraper.
 * @param {string} action - La acción a realizar ('mapear', 'descargar', 'completo').
 * @param {object} filters - Los filtros para la acción.
 * @returns {Promise<object>} La respuesta del backend.
 */
export async function ejecutarProceso(action, filters) {
  const res = await fetch(`${API_URL}/api/ejecutar_proceso`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action, filters }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Error al ejecutar la acción.");
  }
  return await res.json();
}

export async function obtenerFichas() {
  const res = await fetch(`${API_URL}/api/fichas`);
  if (!res.ok) throw new Error("Error al obtener fichas");
  return await res.json();
}