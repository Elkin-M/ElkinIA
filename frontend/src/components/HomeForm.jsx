import React, { useState } from "react";
import axios from "axios";
import { Search, Filter, Download, MapPin, Calendar, Building, Users, Play } from "lucide-react";
import { styles, injectStyles } from './styles.js';

// Injecta los estilos CSS en el documento al cargar el componente
injectStyles();

// ==============================
// Componente HomeForm
// ==============================

// Datos de departamentos y sus municipios para los selects
const DEPARTAMENTO_MUNICIPIOS = {
    "": ["-- No seleccionar --"],
    "AMAZONAS": ["LETICIA"],
    "ANTIOQUIA": ["MEDELLÍN", "BELLO", "ENVIGADO", "ITAGÜÍ", "SABANETA", "APARTADÓ"],
    "ARAUCA": ["ARAUCA"],
    "ATLÁNTICO": ["BARRANQUILLA", "SOLEDAD", "MALAMBO", "SABANALARGA"],
    "BOLÍVAR": ["CARTAGENA", "TURBACO", "MAGANGUÉ", "MOMPÓS"],
    "BOYACÁ": ["TUNJA", "DUITAMA", "SOGAMOSO", "CHIQUINQUIRÁ"],
    "CALDAS": ["MANIZALES", "CHINCHINÁ", "LA DORADA"],
    "CAQUETÁ": ["FLORENCIA"],
    "CASANARE": ["YOPAL"],
    "CAUCA": ["POPAYÁN", "SANTANDER DE QUILICHAO", "PUERTO TEJADA"],
    "CESAR": ["VALLEDUPAR", "AGUACHICA"],
    "CHOCÓ": ["QUIBDÓ"],
    "CUNDINAMARCA": ["BOGOTÁ D.C.", "SOACHA", "ZIPAQUIRÁ", "CHÍA", "FUSAGASUGÁ"],
    "CÓRDOBA": ["MONTERÍA", "SAHAGÚN"],
    "GUAVIARE": ["SAN JOSÉ DEL GUAVIARE"],
    "HUILA": ["NEIVA", "GARZÓN"],
    "LA GUAJIRA": ["RIOHACHA", "MAICAO"],
    "MAGDALENA": ["SANTA MARTA", "CIÉNAGA"],
    "META": ["VILLAVICENCIO", "PUERTO LÓPEZ"],
    "NARIÑO": ["PASTO", "IPIALES"],
    "NORTE DE SANTANDER": ["CÚCUTA", "OCAÑA"],
    "PUTUMAYO": ["MOCOA", "PUERTO ASÍS"],
    "QUINDÍO": ["ARMENIA", "CALARCÁ", "CIRCASIA"],
    "RISARALDA": ["PEREIRA", "DOSQUEBRADAS"],
    "SAN ANDRÉS": ["SAN ANDRÉS"],
    "SANTANDER": ["BUCARAMANGA", "FLORIDABLANCA", "GIRÓN", "PIEDECUESTA"],
    "SUCRE": ["SINCELEJO", "COROZAL"],
    "TOLIMA": ["IBAGUÉ", "ESPINAL", "CHAPARRAL"],
    "VALLE DEL CAUCA": ["CALI", "BUENAVENTURA", "PALMIRA", "TULUÁ"],
    "VAUPÉS": ["MITÚ"],
    "VICHADA": ["PUERTO CARREÑO"]
};

const JORNADA_OPCIONES = [
    "DIURNA", "NOCTURNA", "MIXTA", "VIRTUAL", "DESVIRTUALIZADO"
];

function HomeForm({ onSubmit, loading, statusMessage, progress }) {
    const [action, setAction] = useState("mapear");
    const [filters, setFilters] = useState({
        departamento: "",
        municipio: "",
        jornada: "",
        codigo_ficha: "",
        fecha_inicio: "", // Ahora inicia vacío
        fecha_fin: "",    // Ahora inicia vacío
    });

    const [municipiosDisponibles, setMunicipiosDisponibles] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({ ...prevFilters, [name]: value }));

        // Lógica para actualizar los municipios cuando cambia el departamento
        if (name === "departamento") {
            const nuevosMunicipios = DEPARTAMENTO_MUNICIPIOS[value] || [];
            setMunicipiosDisponibles(nuevosMunicipios);
            // Resetear el municipio si el departamento cambia
            setFilters(prevFilters => ({ ...prevFilters, municipio: "" }));
        }
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
                    
                    {/* Nuevo layout de 2 filas de 3 columnas */}
                    <div style={styles.filtersGrid}>
                        {/* Fila 1 */}
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

                        <div style={styles.filterGroup}>
                            <label htmlFor="departamento">Departamento:</label>
                            <div style={styles.inputContainer}>
                                <Building size={20} color="#6B7280" />
                                <select
                                    id="departamento"
                                    name="departamento"
                                    value={filters.departamento}
                                    onChange={handleChange}
                                    style={styles.input}
                                >
                                    <option value="">-- No seleccionar --</option>
                                    {Object.keys(DEPARTAMENTO_MUNICIPIOS).sort().map(depto => (
                                        depto && <option key={depto} value={depto}>{depto}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={styles.filterGroup}>
                            <label htmlFor="municipio">Municipio:</label>
                            <div style={styles.inputContainer}>
                                <MapPin size={20} color="#6B7280" />
                                <select
                                    id="municipio"
                                    name="municipio"
                                    value={filters.municipio}
                                    onChange={handleChange}
                                    style={styles.input}
                                    disabled={!filters.departamento}
                                >
                                    <option value="">-- No seleccionar --</option>
                                    {municipiosDisponibles.map(municipio => (
                                        <option key={municipio} value={municipio}>{municipio}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Fila 2 */}
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
                                    {JORNADA_OPCIONES.map(jornada => (
                                        <option key={jornada} value={jornada}>{jornada}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
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