import React, { useState } from "react";
import axios from "axios";
import { Search, Filter, Download, MapPin, Calendar, Building, Users, Play } from "lucide-react";
import { styles, injectStyles } from './styles.js';

// Injecta los estilos CSS en el documento al cargar el componente
injectStyles();

// ==============================
// Componente HomeForm
// ==============================
function HomeForm({ onSubmit, loading, statusMessage, progress }) {
    const [action, setAction] = useState("mapear");
    const [filters, setFilters] = useState({
        regional: "",
        centro: "",
        jornada: "",
        codigo_ficha: "",
        fecha_inicio: new Date().toISOString().slice(0, 10),
        fecha_fin: new Date().toISOString().slice(0, 10),
    });

    const handleChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        onSubmit(action, filters);
    };

    const ActionCard = ({ value, icon: Icon, title, description, isSelected }) => (
        <div
            style={{
                ...styles.actionCard,
                ...(isSelected ? styles.actionCardSelected : {}),
            }}
            onClick={() => setAction(value)}
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
            <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>
                    <Filter size={24} />
                    Sistema de Gestión de Fichas
                </h2>
                <p style={styles.cardSubtitle}>Selecciona una acción y configura los filtros</p>
            </div>

            <form onSubmit={handleFormSubmit} style={styles.formContainer}>
                <div>
                    <h3 style={styles.sectionTitle}>
                        <Users size={20} />
                        Acción a Realizar
                    </h3>
                    
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
                    <h3 style={styles.sectionTitle}>
                        <Filter size={20} />
                        Filtros de Búsqueda
                    </h3>
                    
                    <div style={styles.filtersGrid}>
                        {/* Campo de Código de Ficha */}
                        <div style={styles.filterGroup}>
                            <label htmlFor="codigo_ficha">Código de Ficha:</label>
                            <div style={styles.inputContainer}>
                                <Search size={20} color="#6B7280" />
                                <input
                                    type="text"
                                    id="codigo_ficha"
                                    name="codigo_ficha"
                                    value={filters.codigo_ficha}
                                    onChange={handleChange}
                                    style={styles.input}
                                    placeholder="Ej: 2484924"
                                />
                            </div>
                        </div>

                        {/* Campo de Regional (select) */}
                        <div style={styles.filterGroup}>
                            <label htmlFor="regional">Regional:</label>
                            <div style={styles.inputContainer}>
                                <Building size={20} color="#6B7280" />
                                <select
                                    id="regional"
                                    name="regional"
                                    value={filters.regional}
                                    onChange={handleChange}
                                    style={styles.input}
                                >
                                    <option value="">-- No seleccionar --</option>
                                    <option value="BOLÍVAR">BOLÍVAR</option>
                                    {/* Agrega más opciones de regional aquí */}
                                </select>
                            </div>
                        </div>

                        {/* Campo de Centro (select) */}
                        <div style={styles.filterGroup}>
                            <label htmlFor="centro">Centro:</label>
                            <div style={styles.inputContainer}>
                                <MapPin size={20} color="#6B7280" />
                                <select
                                    id="centro"
                                    name="centro"
                                    value={filters.centro}
                                    onChange={handleChange}
                                    style={styles.input}
                                >
                                    <option value="">-- No seleccionar --</option>
                                    <option value="CARTAGENA">CARTAGENA</option>
                                    <option value="CENTRO DE COMERCIO Y SERVICIOS">CENTRO DE COMERCIO Y SERVICIOS</option>
                                    {/* Agrega más opciones de centro aquí */}
                                </select>
                            </div>
                        </div>

                        {/* Campo de Jornada (select) */}
                        <div style={styles.filterGroup}>
                            <label htmlFor="jornada">Jornada:</label>
                            <div style={styles.inputContainer}>
                                <Play size={20} color="#6B7280" />
                                <select
                                    id="jornada"
                                    name="jornada"
                                    value={filters.jornada}
                                    onChange={handleChange}
                                    style={styles.input}
                                >
                                    <option value="">-- No seleccionar --</option>
                                    <option value="DIURNA">DIURNA</option>
                                    <option value="NOCTURNA">NOCTURNA</option>
                                    <option value="MIXTA">MIXTA</option>
                                    <option value="VIRTUAL">VIRTUAL</option>
                                </select>
                            </div>
                        </div>
                        
                        {/* Campo de Fecha Inicial */}
                        <div style={styles.filterGroup}>
                            <label htmlFor="fecha_inicio">Fecha inicial:</label>
                            <div style={styles.inputContainer}>
                                <Calendar size={20} color="#6B7280" />
                                <input
                                    type="date"
                                    id="fecha_inicio"
                                    name="fecha_inicio"
                                    value={filters.fecha_inicio}
                                    onChange={handleChange}
                                    style={styles.input}
                                />
                            </div>
                        </div>
                        
                        {/* Campo de Fecha Final */}
                        <div style={styles.filterGroup}>
                            <label htmlFor="fecha_fin">Fecha final:</label>
                            <div style={styles.inputContainer}>
                                <Calendar size={20} color="#6B7280" />
                                <input
                                    type="date"
                                    id="fecha_fin"
                                    name="fecha_fin"
                                    value={filters.fecha_fin}
                                    onChange={handleChange}
                                    style={styles.input}
                                />
                            </div>
                        </div>

                    </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...styles.primaryButton,
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {loading ? (
                            <div style={styles.spinner}></div>
                        ) : (
                            getButtonIcon()
                        )}
                        {getButtonText()}
                    </button>
                </div>
                
                {loading && (
                    <div style={styles.statusMessage}>
                        Iniciando el proceso...
                    </div>
                )}
                {statusMessage && (
                    <div style={{ ...styles.statusMessage, color: statusMessage.includes('✅') ? 'green' : 'red' }}>
                        {statusMessage}
                    </div>
                )}
                {progress && (
                    <div style={styles.statusMessage}>
                        Progreso: {progress.stage} ({progress.current}%)
                    </div>
                )}
            </form>
        </div>
    );
}

export default HomeForm;