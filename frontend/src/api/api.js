const API_URL = import.meta.env.VITE_API_URL;

export async function obtenerFichas() {
  const res = await fetch(`${API_URL}/fichas`);
  if (!res.ok) throw new Error("Error al obtener fichas");
  return await res.json();
}

export async function ejecutarScraper() {
  const res = await fetch(`${API_URL}/mapear-fichas`);
  if (!res.ok) throw new Error("Error al ejecutar scraper");
  return await res.json();
}
