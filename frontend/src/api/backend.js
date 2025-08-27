// ==============================
// src/api/backend.js
// ==============================
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

export const ejecutarProceso = (payload) => api.post("/api/ejecutar_proceso", payload);
export const listarFichas = () => api.get("/api/fichas");

export default api;