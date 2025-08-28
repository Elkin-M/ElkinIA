// src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomeForm from "./components/HomeForm";
import SearchBar from "./components/SearchBar";
import ResultsTable from "./components/ResultsTable";
import ConfiguracionPage from "./components/ConfiguracionPage"; 
import { styles, colors } from './components/styles.js'; // CAMBIO: Se importa `colors`
import Footer from "./components/footer.jsx";
import HeroBanner from "./components/HeroBanner.jsx";
import JuiciosPage from "./components/JuiciosPage.jsx"; // Importa el nuevo componente
import Navbar from "./components/navbar.jsx";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function AppContent() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [progress, setProgress] = useState(null);

  const [loadingJuicios, setLoadingJuicios] = useState(false);
  const [juiciosData, setJuiciosData] = useState([]);

  // Datos simulados para el ejemplo
  const mockData = [
    {
      numero_ficha: "2484924",
      denominacion_programa: "TECNÓLOGO EN ANÁLISIS Y DESARROLLO DE SOFTWARE",
      centro: "CENTRO DE LA INDUSTRIA, LA EMPRESA Y LOS SERVICIOS",
      municipio: "CARTAGENA",
      estado_reporte: 1,
      estado_descarga: "descargado",
      url: "#"
    },
    {
      numero_ficha: "2484925",
      denominacion_programa: "TÉCNICO EN SISTEMAS",
      centro: "CENTRO DE LA INDUSTRIA, LA EMPRESA Y LOS SERVICIOS", 
      municipio: "CARTAGENA",
      estado_reporte: 0,
      estado_descarga: "pendiente",
      url: null
    },
    {
      numero_ficha: "2484926",
      denominacion_programa: "TECNÓLOGO EN GESTIÓN EMPRESARIAL",
      centro: "CENTRO DE LA INDUSTRIA, LA EMPRESA Y LOS SERVICIOS",
      municipio: "CARTAGENA", 
      estado_reporte: 0,
      estado_descarga: "fallido",
      url: null
    }
  ];

  // Simular carga de datos inicial
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setResults(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  // Función unificada para manejar todas las acciones del scraper
  const handleSubmit = async (action, filters) => {
    setLoading(true);
    setProgress({ current: 0, total: 100, stage: "Iniciando..." });

    try {
        let message = "Iniciando proceso...";
        if (action === "mapear") message = "🗺️ Iniciando mapeo de fichas...";
        else if (action === "descargar") message = "⬇️ Iniciando descarga de juicios...";
        else if (action === "completo") message = "🎯 Ejecutando proceso completo...";
        setStatusMessage(message);

        setProgress({ current: 10, total: 100, stage: "Enviando solicitud al backend..." });

        const payload = { action, filters };
        const res = await axios.post(`${API_URL}/api/ejecutar_proceso`, payload, {
          headers: {
            "ngrok-skip-browser-warning": "true"
          }
        });

        if (res.status === 200) {
            setProgress({ current: 100, total: 100, stage: "Proceso completado" });
            setStatusMessage(`✅ Proceso ${action} terminado: ${res.data.message}`);
            console.log("Proceso terminado:", res.data);
        } else {
            throw new Error(res.data.detail || "Error en el proceso.");
        }
    } catch (err) {
        setStatusMessage(`❌ Error: ${err.message || "Error desconocido"}`);
        console.error("Error al enviar la solicitud:", err);
        setProgress(null);
    } finally {
        setLoading(false);
        // Limpiar progreso después de 5 segundos
        setTimeout(() => {
            setProgress(null);
        }, 5000);
    }
  };

  // Lógica de filtrado
  const filtered = results.filter((f) => {
    const q = query.toLowerCase();
    return (
      f.numero_ficha.toLowerCase().includes(q) ||
      (f.denominacion_programa || "").toLowerCase().includes(q) ||
      (f.centro || "").toLowerCase().includes(q) ||
      (f.municipio || "").toLowerCase().includes(q)
    );
  });

  // Calcular estadísticas
  const stats = {
    total: results.length,
    descargadas: results.filter(f => f.estado_descarga === 'descargado').length,
    pendientes: results.filter(f => f.estado_descarga === 'pendiente').length,
    fallidas: results.filter(f => f.estado_descarga === 'fallido').length,
  };

  return (
    <div className="App" style={{ color: colors.white }}> // CAMBIO AQUÍ: Se aplica el color blanco
      <Navbar />
      <HeroBanner stats={stats} />
      
      <div style={styles.mainContent}>
        <HomeForm onSubmit={handleSubmit} loading={loading} />

        {/* Estado y progreso */}
        {(statusMessage || progress) && (
          <div style={{
            ...styles.card,
            backgroundColor: progress ? '#FEF3C7' : '#F0F9FF',
            borderLeft: `4px solid ${progress ? '#F59E0B' : '#3B82F6'}`,
          }}>
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {loading && (
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid #E5E7EB',
                    borderTop: '2px solid #3B82F6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}></div>
                )}
                <div style={{ flex: 1 }}>
                  {statusMessage && (
                    <p style={{
                      color: progress ? '#92400E' : '#1E40AF',
                      fontWeight: '600',
                      margin: '0 0 8px 0',
                    }}>
                      {statusMessage}
                    </p>
                  )}
                  {progress && (
                    <div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '8px',
                      }}>
                        <span style={{
                          fontSize: '0.9rem',
                          color: '#92400E',
                          fontWeight: '500',
                        }}>
                          {progress.stage}
                        </span>
                        <span style={{
                          fontSize: '0.9rem',
                          color: '#92400E',
                          fontWeight: '600',
                        }}>
                          {progress.current}%
                        </span>
                      </div>
                      <div style={{
                        width: '100%',
                        backgroundColor: '#FDE68A',
                        borderRadius: '6px',
                        height: '8px',
                      }}>
                        <div style={{
                          width: `${progress.current}%`,
                          backgroundColor: '#F59E0B',
                          height: '100%',
                          borderRadius: '6px',
                          transition: 'width 0.3s ease',
                        }}></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <SearchBar 
          query={query} 
          setQuery={setQuery} 
          resultCount={filtered.length}
          totalCount={results.length}
        />

        <ResultsTable 
          data={filtered} 
          // Estas funciones de descarga no existen en este App.jsx, se deben manejar en JuiciosPage
          // onDownloadSingle={handleDownloadSingle}
          // onBulkDownload={handleBulkDownload}
          loading={loading}
        />
      </div>

      <Footer />
      
     <style>{`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`}</style>

    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppContent />} />
        <Route path="/juicios" element={<JuiciosPage />} />
        <Route path="/juicios/:numeroFicha" element={<JuiciosPage />} />
        <Route path="/configuracion" element={<ConfiguracionPage />} />
      </Routes>
    </Router>
  );
}