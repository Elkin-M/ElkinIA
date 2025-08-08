import React, { useState, useEffect } from "react";
import HomeForm from "./components/HomeForm";
import SearchBar from "./components/SearchBar";
import ResultsTable from "./components/ResultsTable";
import { styles } from './components/styles.js';

const API_URL = import.meta.env.VITE_API_URL;

export default function App() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [progress, setProgress] = useState(null);

  const fetchFichas = async () => {
    setLoading(true);
    setStatusMessage("Cargando fichas desde la base de datos...");
    
    try {
      const res = await fetch(`${API_URL}/fichas`, {
        headers: {
          "ngrok-skip-browser-warning": "true"
        }
      });
      const data = await res.json();
      setResults(data);
      setStatusMessage(`${data.length} fichas cargadas correctamente`);
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (err) {
      console.error("Error al obtener las fichas", err);
      setStatusMessage("Error al cargar las fichas");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (action, filters) => {
  setLoading(true);
  setProgress({ current: 0, total: 100, stage: "Iniciando..." });
  
  try {
    let res;
    let json; // Declarar json aquí para que esté disponible en todo el scope
    
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
    
    // Refresca la vista de fichas
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

  const handleDownloadSingle = async (numeroFicha) => {
    setLoading(true);
    setStatusMessage(`⬇️ Descargando juicio para ficha ${numeroFicha}...`);
    
    try {
      const res = await fetch(`${API_URL}/descargar-ficha/${numeroFicha}`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        }
      });
      
      const json = await res.json();
      
      if (res.ok) {
        setStatusMessage(`✅ Descarga exitosa para ficha ${numeroFicha}`);
        // Actualizar el estado de la ficha en la tabla
        setResults(prev => prev.map(ficha => 
          ficha.numero_ficha === numeroFicha 
            ? { ...ficha, estado_descarga: 'descargado' }
            : ficha
        ));
      } else {
        throw new Error(json.error || "Error en la descarga individual");
      }
      
    } catch (err) {
      console.error("Error al descargar ficha individual:", err);
      setStatusMessage(`❌ Error descargando ficha ${numeroFicha}: ${err.message}`);
      // Actualizar el estado como fallido
      setResults(prev => prev.map(ficha => 
        ficha.numero_ficha === numeroFicha 
          ? { ...ficha, estado_descarga: 'fallido' }
          : ficha
      ));
    } finally {
      setLoading(false);
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setStatusMessage(""), 3000);
    }
  };

  const handleBulkDownload = async (fichasSeleccionadas) => {
    if (fichasSeleccionadas.length === 0) {
      setStatusMessage("⚠️ No hay fichas seleccionadas para descargar");
      return;
    }

    setLoading(true);
    setStatusMessage(`⬇️ Descargando ${fichasSeleccionadas.length} fichas seleccionadas...`);
    setProgress({ current: 0, total: fichasSeleccionadas.length, stage: "Preparando descargas..." });
    
    try {
      const res = await fetch(`${API_URL}/descargar-bulk`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify({ fichas: fichasSeleccionadas })
      });
      
      const json = await res.json();
      
      if (res.ok) {
        setProgress({ 
          current: json.resultados?.length || 0, 
          total: fichasSeleccionadas.length, 
          stage: "Descargas completadas" 
        });
        
        const exitosas = json.resultados?.filter(r => r.exito)?.length || 0;
        const fallidas = json.resultados?.length - exitosas || 0;
        
        setStatusMessage(`✅ Descarga bulk completada: ${exitosas} exitosas, ${fallidas} fallidas`);
        
        // Actualizar estados de las fichas
        if (json.resultados) {
          setResults(prev => prev.map(ficha => {
            const resultado = json.resultados.find(r => r.ficha === ficha.numero_ficha);
            if (resultado) {
              return { ...ficha, estado_descarga: resultado.exito ? 'descargado' : 'fallido' };
            }
            return ficha;
          }));
        }
      } else {
        throw new Error(json.error || "Error en la descarga bulk");
      }
      
    } catch (err) {
      console.error("Error en descarga bulk:", err);
      setStatusMessage(`❌ Error en descarga bulk: ${err.message}`);
    } finally {
      setLoading(false);
      // Limpiar progreso después de 5 segundos
      setTimeout(() => {
        setProgress(null);
      }, 5000);
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
        {/* Header con título */}
        <div style={{
          marginBottom: '32px',
          textAlign: 'center',
          borderBottom: '2px solid #E5E7EB',
          paddingBottom: '24px'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#1F2937',
            margin: '0 0 8px 0'
          }}>
            🎯 SENA Sofia Plus Scraper
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: '#6B7280',
            margin: 0
          }}>
            Sistema automatizado para mapeo y descarga de juicios de evaluación
          </p>
        </div>

        <HomeForm onSubmit={handleSubmit} loading={loading} />

        {/* Mensaje de estado y progreso */}
        {(statusMessage || progress) && (
          <div style={{
            ...styles.card,
            backgroundColor: progress ? '#FEF3C7' : '#F0F9FF',
            borderLeft: `4px solid ${progress ? '#F59E0B' : '#3B82F6'}`,
            marginBottom: '24px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              {loading && (
                <div style={styles.spinner}></div>
              )}
              <div style={{ flex: 1 }}>
                {statusMessage && (
                  <p style={{
                    color: progress ? '#92400E' : '#1E40AF',
                    fontWeight: '500',
                    margin: '0 0 8px 0',
                    fontSize: '0.95rem'
                  }}>
                    {statusMessage}
                  </p>
                )}
                {progress && (
                  <div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <span style={{
                        fontSize: '0.875rem',
                        color: '#92400E',
                        fontWeight: '500'
                      }}>
                        {progress.stage}
                      </span>
                      <span style={{
                        fontSize: '0.875rem',
                        color: '#92400E',
                        fontWeight: '600'
                      }}>
                        {progress.current}/{progress.total}
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      backgroundColor: '#FDE68A',
                      borderRadius: '6px',
                      height: '8px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${(progress.current / progress.total) * 100}%`,
                        backgroundColor: '#F59E0B',
                        height: '100%',
                        borderRadius: '6px',
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <SearchBar 
            query={query} 
            setQuery={setQuery} 
            resultCount={filtered.length}
            totalCount={results.length}
          />

          {loading && !statusMessage && (
            <div style={styles.card}>
              <div style={styles.loading}>
                <div style={styles.spinner}></div>
                <p style={{ color: '#3B82F6', fontWeight: '500', margin: 0 }}>
                  Procesando solicitud...
                </p>
              </div>
            </div>
          )}

          <ResultsTable 
            data={filtered} 
            onDownloadSingle={handleDownloadSingle}
            onBulkDownload={handleBulkDownload}
            loading={loading}
          />
          
          {/* Footer con estadísticas */}
          {results.length > 0 && (
            <div style={{
              ...styles.card,
              backgroundColor: '#F9FAFB',
              border: '1px solid #E5E7EB'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                textAlign: 'center'
              }}>
                <div>
                  <div style={{
                    fontSize: '1.875rem',
                    fontWeight: '700',
                    color: '#3B82F6'
                  }}>
                    {results.length}
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#6B7280',
                    fontWeight: '500'
                  }}>
                    Total Fichas
                  </div>
                </div>
                <div>
                  <div style={{
                    fontSize: '1.875rem',
                    fontWeight: '700',
                    color: '#10B981'
                  }}>
                    {results.filter(f => f.estado_descarga === 'descargado').length}
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#6B7280',
                    fontWeight: '500'
                  }}>
                    Descargadas
                  </div>
                </div>
                <div>
                  <div style={{
                    fontSize: '1.875rem',
                    fontWeight: '700',
                    color: '#F59E0B'
                  }}>
                    {results.filter(f => f.estado_descarga === 'pendiente').length}
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#6B7280',
                    fontWeight: '500'
                  }}>
                    Pendientes
                  </div>
                </div>
                <div>
                  <div style={{
                    fontSize: '1.875rem',
                    fontWeight: '700',
                    color: '#EF4444'
                  }}>
                    {results.filter(f => f.estado_descarga === 'fallido').length}
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#6B7280',
                    fontWeight: '500'
                  }}>
                    Fallidas
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

json = await res.json();
json();
        
        if (res.ok) {
          setProgress({ current: 100, total: 100, stage: "Mapeo completado" });
          setStatusMessage(`✅ Mapeo terminado: ${json.fichas_encontradas || 0} fichas encontradas`);
          console.log("Mapeo terminado:", json);
        } else {
          throw new Error(json.error || "Error en el mapeo");
        }
        
        if (action === "descargar") {
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
      }
        const json = await res.json();