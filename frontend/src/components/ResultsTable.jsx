import React, { useState } from "react";
import { Search } from "lucide-react";
import { styles } from './styles.js';
import { useNavigate } from "react-router-dom";
import { Download, Eye, FileText } from "lucide-react";

// ==============================
// Componente ResultsTable
// ==============================
function ResultsTable({ data, onDownloadSingle, onBulkDownload, loading }) {
  const [sortField, setSortField] = useState("numero_ficha");
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedFichas, setSelectedFichas] = useState([]);
  const navigate = useNavigate();

  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortField] || "";
    const bValue = b[sortField] || "";
    return sortDirection === "asc"
      ? aValue.toString().localeCompare(bValue.toString())
      : bValue.toString().localeCompare(aValue.toString());
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSelectFicha = (numeroFicha) => {
    setSelectedFichas(prev => 
      prev.includes(numeroFicha)
        ? prev.filter(f => f !== numeroFicha)
        : [...prev, numeroFicha]
    );
  };

  const handleSelectAll = () => {
    setSelectedFichas(
      selectedFichas.length === data.length 
        ? [] 
        : data.map(f => f.numero_ficha)
    );
  };

  const handleViewJuicios = (numeroFicha) => {
    navigate(`/juicios/${numeroFicha}`);
  };

  if (!data.length) {
    return (
      <div style={styles.card}>
        <div style={{ 
          padding: '60px 24px 153px',
          textAlign: 'center',
        }}>
          <Search size={48} color="#9CA3AF" style={{ marginBottom: '16px' }} />
          <p style={{ fontSize: '18px', color: '#6B7280', margin: '0 0 8px' }}>
            No se encontraron resultados
          </p>
          <p style={{ fontSize: '14px', color: '#9CA3AF', margin: 0 }}>
            Intenta ajustar los filtros de búsqueda
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      {/* Header con acciones bulk */}
      <div style={{
        padding: '24px 24px 0',
        borderBottom: '1px solid #E2E8F0',
        marginBottom: '0',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#1E293B',
            margin: 0,
          }}>
            Resultados de Fichas
          </h3>
          {selectedFichas.length > 0 && (
            <button
              onClick={() => onBulkDownload(selectedFichas)}
              disabled={loading}
              style={{
                ...styles.primaryButton,
                padding: '12px 20px',
                fontSize: '0.9rem',
              }}
            >
              <Download size={16} />
              Descargar {selectedFichas.length} seleccionadas
            </button>
          )}
        </div>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead style={styles.tableHeader}>
            <tr>
              <th style={styles.tableHeaderCell}>
                <input
                  type="checkbox"
                  checked={selectedFichas.length === data.length}
                  onChange={handleSelectAll}
                  style={{ cursor: 'pointer' }}
                />
              </th>
              {[
                { key: "numero_ficha", label: "# Ficha" },
                { key: "denominacion_programa", label: "Programa" },
                { key: "centro", label: "Centro" },
                { key: "municipio", label: "Ciudad" },
                { key: "estado_reporte", label: "Estado" },
                { key: "acciones", label: "Acciones" },
              ].map((column) => (
                <th
                  key={column.key}
                  onClick={() => column.key !== "acciones" ? handleSort(column.key) : null}
                  style={{
                    ...styles.tableHeaderCell,
                    cursor: column.key !== "acciones" ? 'pointer' : 'default',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {column.label}
                    {column.key !== "acciones" && sortField === column.key && (
                      <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((ficha, index) => (
              <tr
                key={ficha.numero_ficha}
                style={{
                  ...styles.tableRow,
                  backgroundColor: selectedFichas.includes(ficha.numero_ficha) 
                    ? '#EFF6FF' : (index % 2 === 0 ? 'white' : '#F8FAFC'),
                }}
              >
                <td style={styles.tableCell}>
                  <input
                    type="checkbox"
                    checked={selectedFichas.includes(ficha.numero_ficha)}
                    onChange={() => handleSelectFicha(ficha.numero_ficha)}
                    style={{ cursor: 'pointer' }}
                  />
                </td>
                <td style={{
                  ...styles.tableCell,
                  fontFamily: 'monospace',
                  fontWeight: '600',
                  color: '#3B82F6',
                }}>
                  {ficha.numero_ficha}
                </td>
                <td style={{
                  ...styles.tableCell,
                  fontWeight: '500',
                  maxWidth: '250px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  title: ficha.denominacion_programa,
                }}>
                  {ficha.denominacion_programa || "Sin nombre"}
                </td>
                <td style={{ ...styles.tableCell, color: '#64748B' }}>
                  {ficha.centro || "N/A"}
                </td>
                <td style={{ ...styles.tableCell, color: '#64748B' }}>
                  {ficha.municipio || "N/A"}
                </td>
                <td style={styles.tableCell}>
                  <span style={{
                    ...styles.badge,
                    ...(ficha.estado_reporte === 1 ? styles.badgeSuccess : 
                        ficha.estado_descarga === 'descargado' ? styles.badgeSuccess :
                        ficha.estado_descarga === 'fallido' ? styles.badgeWarning :
                        styles.badgePending),
                  }}>
                    {ficha.estado_reporte === 1 ? "✅ Completado" : 
                     ficha.estado_descarga === 'descargado' ? "📁 Descargado" :
                     ficha.estado_descarga === 'fallido' ? "❌ Fallido" :
                     "⏳ Pendiente"}
                  </span>
                </td>
                <td style={styles.tableCell}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => onDownloadSingle(ficha.numero_ficha)}
                      disabled={loading}
                      style={{
                        ...styles.actionButton,
                        backgroundColor: '#3B82F6',
                        fontSize: '0.8rem',
                        padding: '6px 12px',
                      }}
                    >
                      <Download size={14} />
                      Descargar
                    </button>
                    <button
                      onClick={() => handleViewJuicios(ficha.numero_ficha)}
                      style={{
                        ...styles.actionButton,
                        backgroundColor: '#10B981',
                        fontSize: '0.8rem',
                        padding: '6px 12px',
                      }}
                    >
                      <Eye size={14} />
                      Ver Juicios
                    </button>
                    {ficha.url && (
                      <a
                        href={ficha.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          ...styles.actionButton,
                          backgroundColor: '#8B5CF6',
                          textDecoration: 'none',
                          fontSize: '0.8rem',
                          padding: '6px 12px',
                        }}
                      >
                        <FileText size={14} />
                        Excel
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid #E2E8F0',
        backgroundColor: '#F8FAFC',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '14px',
        color: '#64748B',
      }}>
        <span>
          Mostrando <strong>{data.length}</strong> resultado{data.length !== 1 ? 's' : ''}
        </span>
        {selectedFichas.length > 0 && (
          <span>
            <strong>{selectedFichas.length}</strong> seleccionada{selectedFichas.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
}

export default ResultsTable;