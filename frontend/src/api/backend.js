// ==============================
// src/api/backend.js
// ==============================
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000", // ajusta si tu backend está en otro puerto
});

export const mapearFichas = (payload) => api.post("/mapear-fichas", payload);
export const descargarJuicios = (payload) => api.post("/descargar-juicios", payload);
export const listarFichas = () => api.get("/fichas");

export default api;