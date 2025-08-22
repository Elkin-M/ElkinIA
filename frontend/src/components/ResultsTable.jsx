import React, { useState } from "react";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { styles } from './styles.js';

function ResultsTable({ data, onDownloadSingle, onBulkDownload, loading }) {
  const [sortField, setSortField] = useState("numero_ficha");
  const [sortDirection, setSortDirection] = useState("asc");
  const [hoveredRow, setHoveredRow] = useState(null);

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

  if (!data.length) {
    return (
      <div style={styles.card}>
        <div style={styles.emptyState}>
          <div style={styles.emptyStateIcon}>
            <Search size={32} color="#9CA3AF" />
          </div>
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
      <div style={{ overflowX: 'auto' }}>
        <table style={styles.table}>
          <thead style={styles.tableHeader}>
            <tr>
              {[
                { key: "numero_ficha", label: "# Ficha" },
                { key: "denominacion_programa", label: "Nombre del Programa" },
                { key: "centro", label: "Centro" },
                { key: "municipio", label: "Ciudad" },
                { key: "estado_reporte", label: "Estado" },
                { key: "descarga", label: "Descargar Excel" },
                { key: "acciones", label: "Acciones" },
              ].map((column) => (
                <th
                  key={column.key}
                  onClick={() => ["descarga", "acciones"].includes(column.key) ? null : handleSort(column.key)}
                  style={{
                    ...styles.tableHeaderCell,
                    cursor: ["descarga", "acciones"].includes(column.key) ? 'default' : 'pointer',
                    ...(sortField === column.key && { color: '#1F2937' }),
                  }}
                  onMouseEnter={(e) => {
                    if (!["descarga", "acciones"].includes(column.key)) {
                      e.target.style.backgroundColor = '#E5E7EB';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!["descarga", "acciones"].includes(column.key)) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {column.label}
                    {["descarga", "acciones"].includes(column.key) ? null : (
                      <span style={{ fontSize: '12px', color: '#6B7280' }}>
                        {sortField === column.key
                          ? sortDirection === "asc" ? "↑" : "↓"
                          : ""}
                      </span>
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
                  backgroundColor: index % 2 === 0 ? 'white' : '#F9FAFB',
                  ...(hoveredRow === index ? styles.tableRowHover : {}),
                }}
                onMouseEnter={() => setHoveredRow(index)}
                onMouseLeave={() => setHoveredRow(null)}
              >
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
                }}>
                  {ficha.denominacion_programa || "Sin nombre"}
                </td>
                <td style={{ ...styles.tableCell, color: '#6B7280' }}>
                  {ficha.centro || "N/A"}
                </td>
                <td style={{ ...styles.tableCell, color: '#6B7280' }}>
                  {ficha.municipio || "N/A"}
                </td>
                <td style={styles.tableCell}>
                  <span style={{
                    ...styles.badge,
                    ...(ficha.estado_reporte === 1 ? styles.badgeSuccess : styles.badgeWarning),
                  }}>
                    {ficha.estado_reporte === 1 ? "✅ Completado" : "⏳ Pendiente"}
                  </span>
                </td>
                <td style={styles.tableCell}>
                  {ficha.url ? (
                    <a
                      href={ficha.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#3B82F6', textDecoration: 'underline', fontSize: '14px' }}
                    >
                      Descargar
                    </a>
                  ) : (
                    <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Sin archivo</span>
                  )}
                </td>
                <td style={styles.tableCell}>
                  <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                    <button
                      onClick={() => onDownloadSingle(ficha.numero_ficha)}
                      disabled={loading}
                      style={{ ...styles.actionButton, backgroundColor: '#3B82F6' }}
                    >
                      ⬇️ Descargar Juicio
                    </button>
                    <Link
                      to={`/juicios/${ficha.numero_ficha}`}
                      style={{
                        ...styles.actionButton,
                        backgroundColor: '#10B981',
                        textDecoration: 'none',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      👁️ Ver Juicios
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{
        backgroundColor: '#F9FAFB',
        padding: '16px 24px',
        borderTop: '1px solid #E5E7EB',
        fontSize: '14px',
        color: '#374151',
      }}>
        Mostrando <strong>{data.length}</strong> resultado{data.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}

export default ResultsTable;