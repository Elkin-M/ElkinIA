import React, { useState, useEffect } from "react";
import HomeForm from "./components/HomeForm";
import SearchBar from "./components/SearchBar";
import ResultsTable from "./components/ResultsTable";
import { styles } from './components/styles.js';

// Usa los estilos como: style={styles.container}
// ==============================
// Componente App mejorado
// ==============================
export default function App() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState("");


  const fetchFichas = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/fichas");
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Error al obtener las fichas",err);
    }finally{
      setLoading(false);
    }
  };

const handleSubmit = async (action, filters) => {
  setLoading(true);
  try {
    if (action === "mapear") {
      const res = await fetch("http://localhost:8000/mapear-fichas");
      const json = await res.json();
      console.log("Mapeo terminado:", json);
    } else if (action === "descargar") {
      const res = await fetch("http://localhost:8000/descargar-juicios");
      const json = await res.json();
      console.log("Descarga terminada:", json);
    }
    fetchFichas();  // O refrescar vista
  } catch (err) {
    console.error("Error al ejecutar acción:", err);
    alert("Ocurrió un error.");
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchFichas();
  }, []);

  const filtered = results.filter((f) => {
    const q = query.toLowerCase();
    return (
      f.numero_ficha.toLowerCase().includes(q) ||
      (f.denominacion_programa || "").toLowerCase().includes(q) ||
      (f.centro || "").toLowerCase().includes(q) ||
      (f.municipio || "").toLowerCase().includes(q)
    );
  });

  return (
    <div style={styles.container}>
      <div style={styles.mainContainer}>
        <HomeForm onSubmit={handleSubmit} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <SearchBar query={query} setQuery={setQuery} resultCount={filtered.length} />
          
          {loading && (
            <div style={styles.card}>
              <div style={styles.loading}>
                <div style={styles.spinner}></div>
                <p style={{ color: '#3B82F6', fontWeight: '500', margin: 0 }}>
                  Procesando solicitud...
                </p>
              </div>
            </div>
          )}
          
          <ResultsTable data={filtered} />
        </div>
      </div>
    </div>
  );
}