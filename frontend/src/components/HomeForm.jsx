import React, { useState } from "react";
import axios from "axios";
import { Search, Filter, Download, MapPin, Calendar, Building, Users, Play } from "lucide-react";
import { styles, injectStyles } from './styles.js';

// Injecta los estilos CSS en el documento al cargar el componente
injectStyles();

// ==============================
// Componente HomeForm
// ==============================

// Datos reales de departamentos y centros SENA para los selects
const REGIONAL_CENTROS = {
    "": ["-- No seleccionar --"],
    "AMAZONAS": ["CENTRO PARA LA BIODIVERSIDAD Y EL TURISMO DEL AMAZONAS"],
    "ANTIOQUIA": [
        "CENTRO DE COMERCIO", "CENTRO DE SERVICIOS DE SALUD", "CENTRO PARA EL DESARROLLO DEL HÁBITAT Y LA CONSTRUCCIÓN",
        "CENTRO DE TECNOLOGÍA DE LA MANUFACTURA AVANZADA", "CENTRO DE LA INNOVACIÓN, LA AGROINDUSTRIA Y EL TURISMO",
        "CENTRO DE FORMACIÓN EN ACTIVIDAD FÍSICA Y CULTURA", "CENTRO DE SERVICIOS Y GESTIÓN EMPRESARIAL",
        "CENTRO DE DESARROLLO AGROECOLÓGICO Y AGROINDUSTRIAL", "CENTRO AGROECOLÓGICO Y EMPRESARIAL",
        "CENTRO DE LA TECNOLOGÍA DEL DISEÑO Y LA PRODUCTIVIDAD EMPRESARIAL"
    ],
    "ARAUCA": ["CENTRO DE GESTIÓN Y DESARROLLO AGROINDUSTRIAL DE ARUA"],
    "ATLÁNTICO": ["CENTRO NACIONAL COLOMBO ALEMÁN", "CENTRO INDUSTRIAL Y DE AVIACIÓN", "CENTRO DE COMERCIO Y SERVICIOS"],
    "BOLÍVAR": [
        "CENTRO AGROEMPRESARIAL Y MINERO", "CENTRO INTERNACIONAL DE NÁUTICA, FLUVIAL Y PORTUARIA",
        "CENTRO DE COMERCIO Y SERVICIOS", "CENTRO PARA EL DESARROLLO AGROECOLÓGICO Y AGROINDUSTRIAL",
        "CENTRO DE TECNOLOGÍA AGROINDUSTRIAL"
    ],
    "BOYACÁ": [
        "CENTRO AGROPECUARIO Y DE TECNOLOGÍA AGROINDUSTRIAL", "CENTRO DE GESTIÓN ADMINISTRATIVA Y FINANCIERA",
        "CENTRO MINERO", "CENTRO DE GESTIÓN Y DESARROLLO MINERO", "CENTRO DE DESARROLLO AGROPECUARIO Y AGROINDUSTRIAL"
    ],
    "CALDAS": ["CENTRO DE PROCESOS INDUSTRIALES Y CONSTRUCCIÓN", "CENTRO PÉRDIDA DE SUELO", "CENTRO PARA LA FORMACIÓN CAFETERA"],
    "CAQUETÁ": ["CENTRO AGROINDUSTRIAL DEL META", "CENTRO PARA EL DESARROLLO DE LA AMAZONÍA"],
    "CASANARE": ["CENTRO AGROINDUSTRIAL Y PECUARIO DEL META"],
    "CAUCA": ["CENTRO PARA EL DESARROLLO AGROINDUSTRIAL Y DE LA CONSTRUCCIÓN", "CENTRO DE TELEINFORMÁTICA Y PRODUCCIÓN INDUSTRIAL"],
    "CESAR": ["CENTRO AGROECOLÓGICO Y EMPRESARIAL"],
    "CHOCÓ": ["CENTRO PARA EL DESARROLLO DEL HÁBITAT Y LA CONSTRUCCIÓN"],
    "CUNDINAMARCA": ["CENTRO DE DESARROLLO AGROECOLÓGICO Y AGROINDUSTRIAL", "CENTRO DE FORMACIÓN EN ACTIVIDAD FÍSICA Y CULTURA"],
    "CÓRDOBA": ["CENTRO DE GESTIÓN Y DESARROLLO AGROINDUSTRIAL DE CÓRDOBA"],
    "GUAVIARE": ["CENTRO AGROECOLÓGICO Y EMPRESARIAL"],
    "HUILA": ["CENTRO AGROINDUSTRIAL DEL HUILA"],
    "LA GUAJIRA": ["CENTRO DE GESTIÓN Y DESARROLLO AGROINDUSTRIAL Y PESQUERO DE LA GUAJIRA"],
    "MAGDALENA": ["CENTRO DE FORMACIÓN Y DESARROLLO DEL TURISMO", "CENTRO ACUÍCOLA Y AGROINDUSTRIAL DE LA GUAJIRA"],
    "META": ["CENTRO AGROINDUSTRIAL DEL META"],
    "NARIÑO": ["CENTRO AGROECOLÓGICO Y AGROINDUSTRIAL DEL NARIÑO"],
    "NORTE DE SANTANDER": ["CENTRO DE LA TECNOLOGÍA DEL DISEÑO Y LA PRODUCTIVIDAD EMPRESARIAL"],
    "PUTUMAYO": ["CENTRO DE DESARROLLO TECNOLÓGICO Y AGROINDUSTRIAL DEL PUTUMAYO"],
    "QUINDÍO": ["CENTRO PARA LA FORMACIÓN TURÍSTICA Y AGROECOLÓGICA DEL QUINDÍO"],
    "RISARALDA": ["CENTRO PARA LA INNOVACIÓN DE LA AGROINDUSTRIA Y EL TURISMO"],
    "SAN ANDRÉS": ["CENTRO DE FORMACIÓN TURÍSTICA Y HOTELERA"],
    "SANTANDER": ["CENTRO DE LA TECNOLOGÍA DEL HÁBITAT"],
    "SUCRE": ["CENTRO DE LA INNOVACIÓN Y LA AGROINDUSTRIA"],
    "TOLIMA": ["CENTRO DE LA GESTIÓN AGROECOLÓGICA"],
    "VALLE DEL CAUCA": ["CENTRO DE BIOTECNOLOGÍA INDUSTRIAL", "CENTRO DE LA CONSTRUCCIÓN"],
    "VAUPÉS": ["CENTRO DE TECNOLOGÍA AGROINDUSTRIAL DEL VAUPÉS"],
    "VICHADA": ["CENTRO AGROINDUSTRIAL Y EMPRESARIAL DEL VICHADA"]
};

const JORNADA_OPCIONES = [
    "DIURNA", "NOCTURNA", "MIXTA", "VIRTUAL", "DESVIRTUALIZADO"
];

function HomeForm({ onSubmit, loading, statusMessage, progress }) {
    const [action, setAction] = useState("mapear");
    const [filters, setFilters] = useState({
        regional: "",
        centro: "",
        jornada: "",
        codigo_ficha: "",
        fecha_inicio: "",
        fecha_fin: "",
    });

    // Estado para gestionar los centros de formación
    const [centrosDisponibles, setCentrosDisponibles] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({ ...prevFilters, [name]: value }));

        // Lógica para actualizar los centros cuando cambia la regional
        if (name === "regional") {
            const nuevosCentros = REGIONAL_CENTROS[value] || [];
            setCentrosDisponibles(nuevosCentros);
            // Resetear el centro si la regional cambia
            setFilters(prevFilters => ({ ...prevFilters, centro: "" }));
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
                    
                    {/* 💡 Nuevo layout de 2 filas de 3 columnas */}
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
                                    {Object.keys(REGIONAL_CENTROS).sort().map(regional => (
                                        regional && <option key={regional} value={regional}>{regional}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

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
                                    disabled={!filters.regional}
                                >
                                    <option value="">-- No seleccionar --</option>
                                    {centrosDisponibles.map(centro => (
                                        <option key={centro} value={centro}>{centro}</option>
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