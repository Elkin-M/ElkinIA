// src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomeForm from "./components/HomeForm";
import SearchBar from "./components/SearchBar";
import ResultsTable from "./components/ResultsTable";
import ConfiguracionPage from "./components/ConfiguracionPage"; 
import { styles } from './components/styles.js';
import Footer from "./components/footer.jsx";
import HeroBanner from "./components/HeroBanner.jsx";
import JuiciosPage from "./components/JuiciosPage.jsx"; // Importa el nuevo componente
import Navbar from "./components/navbar.jsx";
const API_URL = import.meta.env.VITE_API_URL;

function AppContent() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [progress, setProgress] = useState(null);


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

  // Simular carga de datos
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setResults(mockData);
      setLoading(false);
    }, 1000);
  }, []);





// --------------Logica de peticion api ---------------------------
const handleSubmit = async (action, filters) => {
  setLoading(true);
  setProgress({ current: 0, total: 100, stage: "Iniciando..." });
  
  try {
    let res;
    let json;
    
    if (action === "mapear") {
      setStatusMessage("🗺️ Iniciando mapeo de fichas...");
      setProgress({ current: 10, total: 100, stage: "Conectando a SENA Sofia Plus..." });
      
      res = await fetch(`${API_URL}/mapear-fichas`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify(filters)
      });
      
      json = await res.json();
      
      if (res.ok) {
        setProgress({ current: 100, total: 100, stage: "Mapeo completado" });
        setStatusMessage(`✅ Mapeo terminado: ${json.fichas_encontradas || 0} fichas encontradas`);
        console.log("Mapeo terminado:", json);
      } else {
        throw new Error(json.error || "Error en el mapeo");
      }
      
    } else if (action === "descargar") {
      setStatusMessage("⬇️ Iniciando descarga de juicios...");
      setProgress({ current: 20, total: 100, stage: "Procesando descargas pendientes..." });
      
      res = await fetch(`${API_URL}/descargar-juicios`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify(filters)
      });
      
      json = await res.json();
      
      if (res.ok) {
        setProgress({ current: 100, total: 100, stage: "Descargas completadas" });
        setStatusMessage(`✅ Descarga terminada: ${json.descargas_exitosas || 0} exitosas, ${json.descargas_fallidas || 0} fallidas`);
        console.log("Descarga terminada:", json);
      } else {
        throw new Error(json.error || "Error en la descarga");
      }
      
    } else if (action === "completo") {
      setStatusMessage("🎯 Ejecutando proceso completo...");
      setProgress({ current: 5, total: 100, stage: "Iniciando proceso completo..." });
      
      res = await fetch(`${API_URL}/proceso-completo`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify(filters)
      });
      
      json = await res.json();
      
      if (res.ok) {
        setProgress({ current: 100, total: 100, stage: "Proceso completo finalizado" });
        setStatusMessage(`🎉 Proceso completo terminado: ${json.fichas_mapeadas || 0} fichas mapeadas, ${json.descargas_exitosas || 0} descargas exitosas`);
        console.log("Proceso completo terminado:", json);
      } else {
        throw new Error(json.error || "Error en el proceso completo");
      }
    }
    
    // Refresca la vista de fichas después de cualquier acción
    await fetchFichas();
    
  } catch (err) {
    console.error("Error al ejecutar acción:", err);
    setStatusMessage(`❌ Error: ${err.message}`);
    setProgress(null);
  } finally {
    setLoading(false);
    // Limpiar progreso después de 5 segundos
    setTimeout(() => {
      setProgress(null);
    }, 5000);
  }
};


//------------------------------------------------------------------------



  const handleDownloadSingle = async (numeroFicha) => {
    setLoading(true);
    setStatusMessage(`⬇️ Descargando ficha ${numeroFicha}...`);
    
    // Simular descarga
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setResults(prev => prev.map(ficha => 
      ficha.numero_ficha === numeroFicha 
        ? { ...ficha, estado_descarga: 'descargado' }
        : ficha
    ));
    
    setStatusMessage(`✅ Ficha ${numeroFicha} descargada`);
    setLoading(false);
    
    setTimeout(() => setStatusMessage(""), 2000);
  };

  const handleBulkDownload = async (fichasSeleccionadas) => {
    setLoading(true);
    setStatusMessage(`⬇️ Descargando ${fichasSeleccionadas.length} fichas...`);
    
    // Simular descarga bulk
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setResults(prev => prev.map(ficha => 
      fichasSeleccionadas.includes(ficha.numero_ficha)
        ? { ...ficha, estado_descarga: 'descargado' }
        : ficha
    ));
    
    setStatusMessage(`✅ ${fichasSeleccionadas.length} fichas descargadas`);
    setLoading(false);
    
    setTimeout(() => setStatusMessage(""), 2000);
  };

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
    <div style={styles.app}>
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
          onDownloadSingle={handleDownloadSingle}
          onBulkDownload={handleBulkDownload}
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