import React, { useState, useEffect } from "react";
import { Search, Filter, Download, MapPin, Calendar, Building, Users, Play } from "lucide-react"; // Importa el nuevo ícono 'Play'
import { styles, injectStyles } from './styles.js';

// Al inicio del componente
injectStyles();

// ==============================
// Componente HomeForm mejorado
// ==============================
const defaultFilters = {
  regional: "BOLÍVAR",
  centro: "CARTAGENA",
  jornada: "DIURNA",
  fecha: new Date().toISOString().slice(0, 10),
};

function HomeForm({ onSubmit }) {
  const [action, setAction] = useState("mapear");
  const [filters, setFilters] = useState(defaultFilters);
  const [focusedInput, setFocusedInput] = useState(null);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSubmit(action, filters);
  };

  const ActionCard = ({ value, icon: Icon, title, description, isSelected }) => (
    <div
      style={{
        ...styles.actionCard,
        ...(isSelected ? styles.actionCardSelected : {}),
      }}
      onClick={() => setAction(value)}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.target.style.borderColor = '#D1D5DB';
          e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.target.style.borderColor = '#E5E7EB';
          e.target.style.boxShadow = 'none';
        }
      }}
    >
      <div style={styles.actionCardContent}>
        <div style={{
          ...styles.actionIcon,
          ...(isSelected ? styles.actionIconSelected : {}),
        }}>
          <Icon size={24} color={isSelected ? '#3B82F6' : '#6B7280'} />
        </div>
        <div>
          <h3 style={styles.actionTitle}>{title}</h3>
          <p style={styles.actionDescription}>{description}</p>
        </div>
      </div>
      <input
        type="radio"
        name="action"
        value={value}
        checked={isSelected}
        onChange={() => setAction(value)}
        style={styles.radioInput}
      />
    </div>
  );

  const getButtonText = () => {
    if (action === "mapear") return "Mapear Fichas";
    if (action === "descargar") return "Descargar Juicios";
    if (action === "completo") return "Iniciar Proceso Completo";
  };

  const getButtonIcon = () => {
    if (action === "mapear") return <MapPin size={20} />;
    if (action === "descargar") return <Download size={20} />;
    if (action === "completo") return <Play size={20} />;
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>
          <Filter size={32} />
          Sistema de Gestión de Fichas
        </h1>
        <p style={styles.headerSubtitle}>Selecciona una acción y configura los filtros</p>
      </div>

      <div style={styles.formContent}>
        <div>
          <h2 style={styles.sectionTitle}>
            <Users size={20} color="#3B82F6" />
            Acción a Realizar
          </h2>
          
          <div style={styles.actionGrid}>
            <ActionCard
              value="mapear"
              icon={MapPin}
              title="Mapear Fichas"
              description="Visualizar y organizar fichas en el sistema"
              isSelected={action === "mapear"}
            />
            <ActionCard
              value="descargar"
              icon={Download}
              title="Descargar Juicios"
              description="Exportar juicios evaluativos en formato Excel"
              isSelected={action === "descargar"}
            />
            <ActionCard
              value="completo"
              icon={Play}
              title="Proceso Completo"
              description="Mapear y descargar juicios automáticamente"
              isSelected={action === "completo"}
            />
          </div>
        </div>

        <div>
          <h2 style={styles.sectionTitle}>
            <Filter size={20} color="#3B82F6" />
            Filtros de Búsqueda
          </h2>

          <div style={styles.filtersGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <Building size={16} />
                Regional
              </label>
              <input
                type="text"
                name="regional"
                placeholder="Ej: BOLÍVAR"
                value={filters.regional}
                onChange={handleChange}
                onFocus={() => setFocusedInput('regional')}
                onBlur={() => setFocusedInput(null)}
                style={{
                  ...styles.input,
                  ...(focusedInput === 'regional' ? styles.inputFocus : {}),
                }}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <MapPin size={16} />
                Centro
              </label>
              <input
                type="text"
                name="centro"
                placeholder="Ej: CARTAGENA"
                value={filters.centro}
                onChange={handleChange}
                onFocus={() => setFocusedInput('centro')}
                onBlur={() => setFocusedInput(null)}
                style={{
                  ...styles.input,
                  ...(focusedInput === 'centro' ? styles.inputFocus : {}),
                }}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <Users size={16} />
                Jornada
              </label>
              <select
                name="jornada"
                value={filters.jornada}
                onChange={handleChange}
                onFocus={() => setFocusedInput('jornada')}
                onBlur={() => setFocusedInput(null)}
                style={{
                  ...styles.input,
                  ...(focusedInput === 'jornada' ? styles.inputFocus : {}),
                }}
              >
                <option value="DIURNA">Diurna</option>
                <option value="NOCTURNA">Nocturna</option>
                <option value="MIXTA">Mixta</option>
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <Calendar size={16} />
                Fecha
              </label>
              <input
                type="date"
                name="fecha"
                value={filters.fecha}
                onChange={handleChange}
                onFocus={() => setFocusedInput('fecha')}
                onBlur={() => setFocusedInput(null)}
                style={{
                  ...styles.input,
                  ...(focusedInput === 'fecha' ? styles.inputFocus : {}),
                }}
              />
            </div>
          </div>
        </div>

        <div style={styles.buttonCenter}>
          <button
            onClick={handleSubmit}
            style={styles.button}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
          >
            {getButtonIcon()}
            {getButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomeForm;