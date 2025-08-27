import React, { useState } from "react";
import axios from "axios";
import { Search, Filter, Download, MapPin, Calendar, Building, Users, Play } from "lucide-react";
import { styles, injectStyles } from './styles.js';

// Injecta los estilos CSS en el documento al cargar el componente
injectStyles();

// ==============================
// Componente HomeForm
// ==============================
function HomeForm() {
    const [action, setAction] = useState("mapear");
    const [filters, setFilters] = useState({
        regional: "BOLÍVAR",
        centro: "CARTAGENA",
        jornada: "DIURNA",
        fecha: new Date().toISOString().slice(0, 10),
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [focusedInput, setFocusedInput] = useState(null);

    const handleChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        setLoading(true);
        setResult(null);
        setError(null);

        const payload = {
            action: action,
            filters: filters,
        };
        
        // 📌 CORRECCIÓN: Usar el nuevo endpoint unificado
        const backendUrl = "http://localhost:8000/api/ejecutar_proceso";
        
        try {
            const response = await axios.post(backendUrl, payload, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            setResult(response.data);
            console.log("Respuesta del backend:", response.data);
        } catch (err) {
            setError(err.response ? err.response.data.detail : "Error de red o del servidor.");
            console.error("Error al enviar la solicitud:", err);
        } finally {
            setLoading(false);
        }
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

            <div style={styles.formContainer}>
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

                <div style={{ textAlign: 'center' }}>
                    <button
                        onClick={handleSubmit}
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
                {result && (
                    <div style={{ ...styles.statusMessage, color: 'green' }}>
                        ✅ {result.message}
                    </div>
                )}
                {error && (
                    <div style={{ ...styles.statusMessage, color: 'red' }}>
                        ❌ Error: {error}
                    </div>
                )}
            </div>
        </div>
    );
}

export default HomeForm;