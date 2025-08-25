import React, { useState, useEffect } from 'react';
import {
  Search,
  Home,
  User,
  ChevronDown,
  UserCircle,
  Settings,
  LogOut,
  Menu,
  Gauge,
  FileText,
  BarChart,
  UsersRound,
  Cog,
  ClipboardList,
  CheckCircle,
  XCircle,
  Users,
  Filter,
  IdCard,
  Gavel,
  Clock,
  Building,
  Laptop,
  Calendar,
  Download,
  Eye,
  History,
  Percent,
  TrendingUp,
  Award,
  AlertTriangle,
  BarChart3,
  RefreshCw,
  Plus,
  Upload,
  Save,
  Undo,
  Wifi,
  Trash2,
  Shield,
  Palette,
  Languages,
  List,
  Info,
  Presentation,
  BadgeCheck,
  RotateCcw
} from 'lucide-react';

const styles = {
  // Layout principal
  app: {
    minHeight: '100vh',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    backgroundColor: '#F8FAFC',
  },
  
  // Navbar fijo
  navbar: {
    position: 'fixed',
    top: 0,
    width: '100%',
    zIndex: 1000,
    background: 'linear-gradient(90deg, #F97316, #EA580C)',
    color: 'white',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  
  navContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '64px',
  },
  
  navBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  
  navLogo: {
    width: '40px',
    height: '40px',
    backgroundColor: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  navTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
  },
  
  navMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  
  navButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  
  // Sidebar
  sidebar: {
    position: 'fixed',
    left: 0,
    top: '64px',
    height: 'calc(100vh - 64px)',
    width: '256px',
    backgroundColor: 'white',
    boxShadow: '4px 0 6px -1px rgba(0, 0, 0, 0.1)',
    zIndex: 40,
    transition: 'transform 0.3s ease',
    overflow: 'auto',
  },
  
  sidebarCollapsed: {
    transform: 'translateX(-100%)',
  },
  
  sidebarContent: {
    padding: '16px',
  },
  
  sidebarList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  
  sidebarItem: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#374151',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '14px',
    fontWeight: '500',
  },
  
  sidebarItemActive: {
    background: 'linear-gradient(90deg, #F97316, #EA580C)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
  },
  
  // Main content
  mainContent: {
    marginLeft: '256px',
    paddingTop: '64px',
    minHeight: '100vh',
    transition: 'all 0.3s ease',
  },
  
  mainContentCollapsed: {
    marginLeft: 0,
  },
  
  contentArea: {
    padding: '24px',
  },
  
  // Breadcrumb
  breadcrumb: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    padding: '16px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#6B7280',
  },
  
  // Page headers
  pageHeader: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
  },
  
  pageTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  
  pageSubtitle: {
    fontSize: '16px',
    opacity: 0.9,
  },
  
  // Cards
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    marginBottom: '24px',
    overflow: 'hidden',
  },
  
  cardHeader: {
    background: 'linear-gradient(90deg, #3B82F6, #1D4ED8)',
    color: 'white',
    padding: '16px 24px',
  },
  
  cardHeaderTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: 0,
  },
  
  cardContent: {
    padding: '24px',
  },
  
  // Stats grid
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px',
    marginBottom: '24px',
  },
  
  statCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    padding: '24px',
    textAlign: 'center',
    borderTop: '4px solid #3B82F6',
  },
  
  statIcon: {
    margin: '0 auto 16px',
    color: '#3B82F6',
  },
  
  statNumber: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: '8px',
  },
  
  statLabel: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  
  // Forms
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  
  inputLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: '8px',
  },
  
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'all 0.2s ease',
  },
  
  select: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: 'white',
    transition: 'all 0.2s ease',
  },
  
  // Buttons
  buttonGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
  },
  
  buttonPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#F97316',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  
  buttonSecondary: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#6B7280',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  
  // Tables
  tableContainer: {
    overflowX: 'auto',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  
  tableHeader: {
    background: 'linear-gradient(90deg, #1E3A8A, #1E40AF)',
    color: 'white',
  },
  
  tableHeaderCell: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: '600',
  },
  
  tableRow: {
    borderBottom: '1px solid #E5E7EB',
    transition: 'background-color 0.2s ease',
  },
  
  tableCell: {
    padding: '12px 16px',
    fontSize: '14px',
    color: '#374151',
  },
  
  // Badges
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
  },
  
  badgeSuccess: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
    border: '1px solid #A7F3D0',
  },
  
  badgeError: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
    border: '1px solid #FECACA',
  },
  
  // Alerts
  alert: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '24px',
    gap: '12px',
  },
  
  alertError: {
    backgroundColor: '#FEF2F2',
    border: '1px solid #FECACA',
    color: '#991B1B',
  },
  
  // Loading
  loading: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  
  loadingContent: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '32px',
    textAlign: 'center',
  },
  
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #E5E7EB',
    borderTop: '4px solid #3B82F6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 16px',
  },
  
  // Empty state
  emptyState: {
    textAlign: 'center',
    padding: '48px 24px',
  },
  
  emptyIcon: {
    margin: '0 auto 16px',
    color: '#9CA3AF',
  },
  
  emptyTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: '8px',
  },
  
  emptyText: {
    color: '#6B7280',
    marginBottom: '8px',
  },
  
  // Mobile overlay
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 30,
  },
  
  // Responsive
  '@media (max-width: 768px)': {
    navMenu: {
      display: 'none',
    },
    
    mainContent: {
      marginLeft: 0,
    },
    
    sidebar: {
      transform: 'translateX(-100%)',
    },
    
    sidebarOpen: {
      transform: 'translateX(0)',
    },
  },
};

const JuiciosPage = () => {
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Dashboard stats
  const [stats, setStats] = useState({
    totalJuicios: '-',
    aprobados: '-',
    reprobados: '-',
    fichasActivas: '-'
  });
  
  // Filters state
  const [filters, setFilters] = useState({
    fichas: '',
    aprendiz: '',
    competencia: '',
    juicio: ''
  });
  
  // Results state
  const [consultaResults, setConsultaResults] = useState(null);
  
  const API_BASE = 'https://6b9613693b05.ngrok-free.app/juicios';
  
  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Gauge },
    { id: 'consulta', label: 'Consulta de Juicios', icon: Search },
    { id: 'reportes', label: 'Reportes', icon: FileText },
    { id: 'analisis', label: 'Análisis', icon: BarChart },
    { id: 'gestion', label: 'Gestión', icon: UsersRound },
    { id: 'configuracion', label: 'Configuración', icon: Cog }
  ];

  // Section titles
  const sectionTitles = {
    dashboard: 'Dashboard',
    consulta: 'Consulta de Juicios',
    reportes: 'Reportes',
    analisis: 'Análisis',
    gestion: 'Gestión',
    configuracion: 'Configuración'
  };

  // Show loading
  const showLoading = (show) => setLoading(show);
  
  // Show error
  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  };
  
  // Hide error
  const hideError = () => setError('');

  // Load dashboard stats
  const loadDashboardStats = async () => {
    showLoading(true);
    hideError();

    try {
      const response = await fetch(`${API_BASE}/estadisticas/resumen`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('La respuesta no es JSON. Posiblemente es una redirección o error HTML.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error al obtener estadísticas');
      }

      setStats({
        totalJuicios: data.estadisticas.total_juicios.toLocaleString(),
        aprobados: data.estadisticas.aprobados.toLocaleString(),
        reprobados: data.estadisticas.reprobados.toLocaleString(),
        fichasActivas: data.estadisticas.total_fichas.toLocaleString()
      });

    } catch (error) {
      console.error('Error en loadDashboardStats:', error);
      showError(`Error de conexión: ${error.message}. Verifique que el servidor esté ejecutándose.`);
      
      // Show example data if connection error
      setStats({
        totalJuicios: '1,234',
        aprobados: '987',
        reprobados: '247',
        fichasActivas: '45'
      });
    } finally {
      showLoading(false);
    }
  };

  // Search juicios
  const buscarJuicios = async () => {
    const { fichas, aprendiz, competencia, juicio } = filters;
    const params = new URLSearchParams();

    if (fichas) {
      fichas.split(',').forEach(f => {
        if (f.trim()) params.append('fichas', f.trim());
      });
    }
    if (aprendiz) params.append('aprendiz', aprendiz);
    if (competencia) params.append('competencia', competencia);
    if (juicio) params.append('juicio', juicio);

    const url = `${API_BASE}/?${params.toString()}`;

    showLoading(true);
    hideError();

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('La respuesta no es JSON. Posiblemente es una redirección o error HTML.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error al consultar juicios');
      }

      setConsultaResults(data);

    } catch (error) {
      console.error('Error en buscarJuicios:', error);
      showError(`Error de conexión: ${error.message}. Verifique que el servidor esté ejecutándose.`);
      
      // Show example results
      setConsultaResults({
        resultados: [{
          ficha: '123456',
          total_juicios: 3,
          info_programa: {
            denominacion: 'Técnico en Análisis y Desarrollo de Software',
            centro_formacion: 'Centro de Comercio y Servicios',
            estado: 'Formación',
            modalidad: 'Presencial',
            fecha_inicio: '2024-01-15',
            fecha_fin: '2025-12-15'
          },
          juicios: [
            {
              nombre_completo: 'Juan Pérez Gómez',
              numero_documento: '1234567890',
              competencia: 'Analizar los requerimientos del cliente para el desarrollo del sistema',
              resultado_aprendizaje: 'Identificar y documentar los requerimientos del sistema',
              juicio_evaluacion: 'APROBADO',
              aprobado: true,
              fecha_hora_juicio: '2024-10-15 14:30',
              funcionario_registro: 'María García'
            },
            {
              nombre_completo: 'María Rodríguez Silva',
              numero_documento: '0987654321',
              competencia: 'Desarrollar el sistema de información según los requerimientos',
              resultado_aprendizaje: 'Implementar funcionalidades del sistema',
              juicio_evaluacion: 'APROBADO',
              aprobado: true,
              fecha_hora_juicio: '2024-10-16 09:15',
              funcionario_registro: 'Carlos López'
            },
            {
              nombre_completo: 'Carlos López Torres',
              numero_documento: '1122334455',
              competencia: 'Implementar la seguridad informática en el sistema',
              resultado_aprendizaje: 'Aplicar medidas de seguridad informática',
              juicio_evaluacion: 'REPROBADO',
              aprobado: false,
              fecha_hora_juicio: '2024-10-17 11:45',
              funcionario_registro: 'Ana Martínez'
            }
          ]
        }]
      });

    } finally {
      showLoading(false);
    }
  };

  // Clear filters
  const limpiarFiltros = () => {
    setFilters({
      fichas: '',
      aprendiz: '',
      competencia: '',
      juicio: ''
    });
    setConsultaResults(null);
  };

  // Truncate text
  const truncateText = (text, maxLength) => {
    if (!text || text.length <= maxLength) return text || '';
    return text.substring(0, maxLength) + '...';
  };

  // Handle filter change
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Change section
  const changeSection = (sectionName) => {
    setCurrentSection(sectionName);
    if (window.innerWidth <= 768) {
      setSidebarCollapsed(true);
    }
  };

  // Load initial data
  useEffect(() => {
    loadDashboardStats();
  }, []);

  return (
    <div style={styles.app}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navContainer}>
          <div style={styles.navBrand}>
            <div style={styles.navLogo}>
              <span style={{ color: '#F97316', fontWeight: 'bold', fontSize: '18px' }}>S</span>
            </div>
            <span style={styles.navTitle}>SENA Bolívar</span>
          </div>

          <div style={styles.navMenu}>
            <button 
              onClick={() => changeSection('dashboard')}
              style={styles.navButton}
              onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <Home size={18} />
              <span>Inicio</span>
            </button>
            
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={styles.navButton}
                onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <User size={18} />
                <span>Admin User</span>
                <ChevronDown 
                  size={16} 
                  style={{ 
                    transition: 'transform 0.2s',
                    transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                  }} 
                />
              </button>
              
              {dropdownOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: '8px',
                  width: '192px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  padding: '8px 0',
                  color: '#374151'
                }}>
                  <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#374151',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#F3F4F6'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <UserCircle size={16} style={{ marginRight: '12px' }} />
                    Mi Perfil
                  </button>
                  <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#374151',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#F3F4F6'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <Settings size={16} style={{ marginRight: '12px' }} />
                    Configuración
                  </button>
                  <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#374151',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#F3F4F6'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <LogOut size={16} style={{ marginRight: '12px' }} />
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={toggleSidebar}
            style={{
              ...styles.navButton,
              display: window.innerWidth <= 768 ? 'flex' : 'none'
            }}
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* Sidebar */}
      <aside style={{
        ...styles.sidebar,
        ...(sidebarCollapsed ? styles.sidebarCollapsed : {})
      }}>
        <div style={styles.sidebarContent}>
          <ul style={styles.sidebarList}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => changeSection(item.id)}
                    style={{
                      ...styles.sidebarItem,
                      ...(isActive ? styles.sidebarItemActive : {})
                    }}
                    onMouseOver={(e) => {
                      if (!isActive) {
                        e.target.style.backgroundColor = '#F3F4F6';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isActive) {
                        e.target.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{
        ...styles.mainContent,
        ...(sidebarCollapsed ? styles.mainContentCollapsed : {})
      }}>
        <div style={styles.contentArea}>
          {/* Breadcrumb */}
          <div style={styles.breadcrumb}>
            <Home size={16} />
            <span>Inicio</span>
            <span>/</span>
            <span style={{ color: '#1F2937', fontWeight: '500' }}>{sectionTitles[currentSection]}</span>
          </div>

          {/* Error Display */}
          {error && (
            <div style={{ ...styles.alert, ...styles.alertError }}>
              <AlertTriangle size={20} />
              <div>
                <strong>Error:</strong> {error}
              </div>
            </div>
          )}

          {/* Loading Overlay */}
          {loading && (
            <div style={styles.loading}>
              <div style={styles.loadingContent}>
                <div style={styles.spinner}></div>
                <p style={{ color: '#6B7280' }}>Cargando datos...</p>
              </div>
            </div>
          )}

          {/* Dashboard Section */}
          {currentSection === 'dashboard' && (
            <div>
              <div style={{ ...styles.pageHeader, background: 'linear-gradient(90deg, #F97316, #EA580C)' }}>
                <h1 style={styles.pageTitle}>
                  <Gauge />
                  Dashboard Principal
                </h1>
                <p style={styles.pageSubtitle}>Sistema de Gestión de Juicios Evaluativos - Centro de Comercio y Servicios</p>
              </div>

              {/* Stats Grid */}
              <div style={styles.statsGrid}>
                <div style={{ ...styles.statCard, borderTopColor: '#3B82F6' }}>
                  <ClipboardList size={48} style={styles.statIcon} />
                  <div style={styles.statNumber}>{stats.totalJuicios}</div>
                  <div style={styles.statLabel}>Total Juicios</div>
                </div>
                
                <div style={{ ...styles.statCard, borderTopColor: '#10B981' }}>
                  <CheckCircle size={48} style={{ ...styles.statIcon, color: '#10B981' }} />
                  <div style={{ ...styles.statNumber, color: '#10B981' }}>{stats.aprobados}</div>
                  <div style={styles.statLabel}>Aprobados</div>
                </div>
                
                <div style={{ ...styles.statCard, borderTopColor: '#EF4444' }}>
                  <XCircle size={48} style={{ ...styles.statIcon, color: '#EF4444' }} />
                  <div style={{ ...styles.statNumber, color: '#EF4444' }}>{stats.reprobados}</div>
                  <div style={styles.statLabel}>Reprobados</div>
                </div>
                
                <div style={{ ...styles.statCard, borderTopColor: '#8B5CF6' }}>
                  <Users size={48} style={{ ...styles.statIcon, color: '#8B5CF6' }} />
                  <div style={styles.statNumber}>{stats.fichasActivas}</div>
                  <div style={styles.statLabel}>Fichas Activas</div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div style={styles.card}>
                <div style={{ ...styles.cardHeader, background: 'linear-gradient(90deg, #10B981, #059669)' }}>
                  <h3 style={styles.cardHeaderTitle}>
                    <BarChart3 />
                    Resumen Ejecutivo
                  </h3>
                </div>
                
                <div style={styles.cardContent}>
                  <div style={styles.buttonGroup}>
                    <button 
                      onClick={loadDashboardStats}
                      style={{ ...styles.buttonPrimary, backgroundColor: '#3B82F6' }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#2563EB'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#3B82F6'}
                    >
                      <RefreshCw size={16} />
                      <span>Actualizar</span>
                    </button>
                    
                    <button 
                      onClick={() => changeSection('reportes')}
                      style={{ ...styles.buttonPrimary, backgroundColor: '#10B981' }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#10B981'}
                    >
                      <Download size={16} />
                      <span>Exportar</span>
                    </button>
                  </div>
                  
                  <div style={styles.emptyState}>
                    <BarChart3 size={64} style={styles.emptyIcon} />
                    <h3 style={styles.emptyTitle}>Bienvenido al Sistema</h3>
                    <p style={styles.emptyText}>Haga clic en "Actualizar" para cargar las estadísticas más recientes.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Consulta Section */}
          {currentSection === 'consulta' && (
            <div>
              <div style={{ ...styles.pageHeader, background: 'linear-gradient(90deg, #3B82F6, #1D4ED8)' }}>
                <h1 style={styles.pageTitle}>
                  <Search />
                  Consulta de Juicios Evaluativos
                </h1>
                <p style={styles.pageSubtitle}>Búsqueda avanzada de juicios por diferentes criterios</p>
              </div>

              {/* Filters */}
              <div style={styles.card}>
                <div style={{ ...styles.cardHeader, background: 'linear-gradient(90deg, #1E40AF, #1E3A8A)' }}>
                  <h3 style={styles.cardHeaderTitle}>
                    <Filter />
                    Filtros de Búsqueda
                  </h3>
                </div>
                
                <div style={styles.cardContent}>
                  <div style={styles.formGrid}>
                    <div style={styles.inputGroup}>
                      <label style={styles.inputLabel}>
                        <IdCard size={16} />
                        Fichas Específicas
                      </label>
                      <input
                        type="text"
                        value={filters.fichas}
                        onChange={(e) => handleFilterChange('fichas', e.target.value)}
                        placeholder="Ej: 23492,25958 (separadas por coma)"
                        style={styles.input}
                        onKeyPress={(e) => e.key === 'Enter' && buscarJuicios()}
                        onFocus={(e) => e.target.style.borderColor = '#F97316'}
                        onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                      />
                    </div>
                    
                    <div style={styles.inputGroup}>
                      <label style={styles.inputLabel}>
                        <User size={16} />
                        Nombre del Aprendiz
                      </label>
                      <input
                        type="text"
                        value={filters.aprendiz}
                        onChange={(e) => handleFilterChange('aprendiz', e.target.value)}
                        placeholder="Buscar por nombre"
                        style={styles.input}
                        onKeyPress={(e) => e.key === 'Enter' && buscarJuicios()}
                        onFocus={(e) => e.target.style.borderColor = '#F97316'}
                        onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                      />
                    </div>
                    
                    <div style={styles.inputGroup}>
                      <label style={styles.inputLabel}>
                        <BadgeCheck size={16} />
                        Competencia
                      </label>
                      <input
                        type="text"
                        value={filters.competencia}
                        onChange={(e) => handleFilterChange('competencia', e.target.value)}
                        placeholder="Buscar por competencia"
                        style={styles.input}
                        onKeyPress={(e) => e.key === 'Enter' && buscarJuicios()}
                        onFocus={(e) => e.target.style.borderColor = '#F97316'}
                        onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                      />
                    </div>
                    
                    <div style={styles.inputGroup}>
                      <label style={styles.inputLabel}>
                        <Gavel size={16} />
                        Resultado
                      </label>
                      <select
                        value={filters.juicio}
                        onChange={(e) => handleFilterChange('juicio', e.target.value)}
                        style={styles.select}
                        onFocus={(e) => e.target.style.borderColor = '#F97316'}
                        onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                      >
                        <option value="">Todos</option>
                        <option value="APROBADO">Aprobado</option>
                        <option value="REPROBADO">Reprobado</option>
                      </select>
                    </div>
                  </div>

                  <div style={styles.buttonGroup}>
                    <button 
                      onClick={buscarJuicios}
                      style={styles.buttonPrimary}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#EA580C'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#F97316'}
                    >
                      <Search size={16} />
                      <span>Buscar</span>
                    </button>
                    
                    <button 
                      onClick={limpiarFiltros}
                      style={styles.buttonSecondary}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#4B5563'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#6B7280'}
                    >
                      <Trash2 size={16} />
                      <span>Limpiar</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div>
                {!consultaResults ? (
                  <div style={styles.card}>
                    <div style={styles.emptyState}>
                      <Search size={64} style={styles.emptyIcon} />
                      <h3 style={styles.emptyTitle}>Realizar Búsqueda</h3>
                      <p style={styles.emptyText}>Utilice los filtros de arriba para consultar los juicios evaluativos.</p>
                      <p style={styles.emptyText}>Puede buscar por fichas específicas, nombre de aprendiz, competencia o resultado.</p>
                    </div>
                  </div>
                ) : consultaResults.resultados && consultaResults.resultados.length > 0 ? (
                  consultaResults.resultados.map((ficha) => (
                    <div key={ficha.ficha} style={styles.card}>
                      <div style={{ ...styles.cardHeader, background: 'linear-gradient(90deg, #10B981, #059669)' }}>
                        <h3 style={styles.cardHeaderTitle}>
                          <IdCard />
                          Ficha {ficha.ficha}
                        </h3>
                      </div>
                      
                      <div style={styles.cardContent}>
                        {/* Program Info */}
                        <div style={{
                          backgroundColor: '#F9FAFB',
                          borderRadius: '8px',
                          padding: '16px',
                          marginBottom: '24px',
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                          gap: '16px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Building size={16} style={{ color: '#3B82F6', marginRight: '8px' }} />
                            <strong>Centro:</strong> {ficha.info_programa?.centro_formacion || 'N/A'}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Info size={16} style={{ color: '#10B981', marginRight: '8px' }} />
                            <strong>Estado:</strong> {ficha.info_programa?.estado || 'N/A'}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Laptop size={16} style={{ color: '#F97316', marginRight: '8px' }} />
                            <strong>Modalidad:</strong> {ficha.info_programa?.modalidad || 'N/A'}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Calendar size={16} style={{ color: '#8B5CF6', marginRight: '8px' }} />
                            <strong>Período:</strong> {ficha.info_programa?.fecha_inicio || 'N/A'} - {ficha.info_programa?.fecha_fin || 'N/A'}
                          </div>
                        </div>
                        
                        <h4 style={{
                          fontSize: '18px',
                          fontWeight: 'bold',
                          marginBottom: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <ClipboardList />
                          Juicios Evaluativos ({ficha.total_juicios} registros)
                        </h4>
                        
                        {ficha.juicios && ficha.juicios.length > 0 ? (
                          <div style={styles.tableContainer}>
                            <table style={styles.table}>
                              <thead style={styles.tableHeader}>
                                <tr>
                                  <th style={styles.tableHeaderCell}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <User size={16} />
                                      Aprendiz
                                    </div>
                                  </th>
                                  <th style={styles.tableHeaderCell}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <IdCard size={16} />
                                      Documento
                                    </div>
                                  </th>
                                  <th style={styles.tableHeaderCell}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <BadgeCheck size={16} />
                                      Competencia
                                    </div>
                                  </th>
                                  <th style={styles.tableHeaderCell}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <Gavel size={16} />
                                      Juicio
                                    </div>
                                  </th>
                                  <th style={styles.tableHeaderCell}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <Clock size={16} />
                                      Fecha
                                    </div>
                                  </th>
                                  <th style={styles.tableHeaderCell}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <Presentation size={16} />
                                      Instructor
                                    </div>
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {ficha.juicios.map((juicio, index) => (
                                  <tr key={index} style={styles.tableRow}
                                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FFF7ED'}
                                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                  >
                                    <td style={styles.tableCell}>
                                      <strong>{juicio.nombre_completo}</strong>
                                    </td>
                                    <td style={styles.tableCell}>{juicio.numero_documento}</td>
                                    <td style={styles.tableCell}>{truncateText(juicio.competencia, 40)}</td>
                                    <td style={styles.tableCell}>
                                      <span style={{
                                        ...styles.badge,
                                        ...(juicio.aprobado ? styles.badgeSuccess : styles.badgeError)
                                      }}>
                                        {juicio.juicio_evaluacion}
                                      </span>
                                    </td>
                                    <td style={styles.tableCell}>{juicio.fecha_hora_juicio}</td>
                                    <td style={styles.tableCell}>{juicio.funcionario_registro}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div style={styles.emptyState}>
                            <ClipboardList size={48} style={styles.emptyIcon} />
                            <p style={styles.emptyText}>No hay juicios para mostrar con los filtros aplicados.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={styles.card}>
                    <div style={styles.emptyState}>
                      <Search size={64} style={styles.emptyIcon} />
                      <h3 style={styles.emptyTitle}>No se encontraron resultados</h3>
                      <p style={styles.emptyText}>No se encontraron juicios que coincidan con los filtros aplicados.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reportes Section */}
          {currentSection === 'reportes' && (
            <div>
              <div style={{ ...styles.pageHeader, background: 'linear-gradient(90deg, #8B5CF6, #7C3AED)' }}>
                <h1 style={styles.pageTitle}>
                  <FileText />
                  Generación de Reportes
                </h1>
                <p style={styles.pageSubtitle}>Exportar y generar reportes personalizados</p>
              </div>

              {/* Export Data Card */}
              <div style={styles.card}>
                <div style={{ ...styles.cardHeader, background: 'linear-gradient(90deg, #10B981, #059669)' }}>
                  <h3 style={styles.cardHeaderTitle}>
                    <Download />
                    Exportar Datos
                  </h3>
                </div>
                
                <div style={styles.cardContent}>
                  <div style={styles.formGrid}>
                    <div style={styles.inputGroup}>
                      <label style={styles.inputLabel}>
                        <Calendar size={16} />
                        Fecha Inicio
                      </label>
                      <input
                        type="date"
                        style={styles.input}
                        onFocus={(e) => e.target.style.borderColor = '#F97316'}
                        onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                      />
                    </div>
                    
                    <div style={styles.inputGroup}>
                      <label style={styles.inputLabel}>
                        <Calendar size={16} />
                        Fecha Fin
                      </label>
                      <input
                        type="date"
                        style={styles.input}
                        onFocus={(e) => e.target.style.borderColor = '#F97316'}
                        onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                      />
                    </div>
                    
                    <div style={styles.inputGroup}>
                      <label style={styles.inputLabel}>
                        <FileText size={16} />
                        Formato
                      </label>
                      <select style={styles.select}
                              onFocus={(e) => e.target.style.borderColor = '#F97316'}
                              onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}>
                        <option value="excel">Excel (.xlsx)</option>
                        <option value="pdf">PDF</option>
                        <option value="csv">CSV</option>
                      </select>
                    </div>
                    
                    <div style={styles.inputGroup}>
                      <label style={styles.inputLabel}>
                        <List size={16} />
                        Tipo de Reporte
                      </label>
                      <select style={styles.select}
                              onFocus={(e) => e.target.style.borderColor = '#F97316'}
                              onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}>
                        <option value="completo">Reporte Completo</option>
                        <option value="resumen">Resumen Ejecutivo</option>
                        <option value="por_programa">Por Programa</option>
                        <option value="por_instructor">Por Instructor</option>
                      </select>
                    </div>
                  </div>

                  <div style={styles.buttonGroup}>
                    <button style={{ ...styles.buttonPrimary, backgroundColor: '#10B981' }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#10B981'}>
                      <Download size={16} />
                      <span>Generar Reporte</span>
                    </button>
                    
                    <button style={{ ...styles.buttonPrimary, backgroundColor: '#3B82F6' }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#2563EB'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#3B82F6'}>
                      <Eye size={16} />
                      <span>Vista Previa</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Report History */}
              <div style={styles.card}>
                <div style={{ ...styles.cardHeader, background: 'linear-gradient(90deg, #6B7280, #4B5563)' }}>
                  <h3 style={styles.cardHeaderTitle}>
                    <History />
                    Historial de Reportes
                  </h3>
                </div>
                
                <div style={styles.cardContent}>
                  <div style={styles.emptyState}>
                    <History size={48} style={styles.emptyIcon} />
                    <p style={styles.emptyText}>No hay reportes generados</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Análisis Section */}
          {currentSection === 'analisis' && (
            <div>
              <div style={{ ...styles.pageHeader, background: 'linear-gradient(90deg, #6366F1, #4F46E5)' }}>
                <h1 style={styles.pageTitle}>
                  <BarChart />
                  Análisis y Estadísticas
                </h1>
                <p style={styles.pageSubtitle}>Visualización avanzada de datos y métricas de desempeño</p>
              </div>

              {/* Analysis Stats */}
              <div style={styles.statsGrid}>
                <div style={{ ...styles.statCard, borderTopColor: '#10B981' }}>
                  <Percent size={48} style={{ ...styles.statIcon, color: '#10B981' }} />
                  <div style={styles.statNumber}>-</div>
                  <div style={styles.statLabel}>% Aprobación</div>
                </div>
                
                <div style={{ ...styles.statCard, borderTopColor: '#3B82F6' }}>
                  <TrendingUp size={48} style={styles.statIcon} />
                  <div style={styles.statNumber}>-</div>
                  <div style={styles.statLabel}>Tendencia Mes</div>
                </div>
                
                <div style={{ ...styles.statCard, borderTopColor: '#F59E0B' }}>
                  <Award size={48} style={{ ...styles.statIcon, color: '#F59E0B' }} />
                  <div style={styles.statNumber}>-</div>
                  <div style={styles.statLabel}>Mejor Programa</div>
                </div>
                
                <div style={{ ...styles.statCard, borderTopColor: '#EF4444' }}>
                  <AlertTriangle size={48} style={{ ...styles.statIcon, color: '#EF4444' }} />
                  <div style={styles.statNumber}>-</div>
                  <div style={styles.statLabel}>En Riesgo</div>
                </div>
              </div>

              {/* Charts Card */}
              <div style={styles.card}>
                <div style={{ ...styles.cardHeader, background: 'linear-gradient(90deg, #6366F1, #4F46E5)' }}>
                  <h3 style={styles.cardHeaderTitle}>
                    <BarChart3 />
                    Gráficos de Rendimiento
                  </h3>
                </div>
                
                <div style={styles.cardContent}>
                  <div style={styles.buttonGroup}>
                    <button style={{ ...styles.buttonPrimary, backgroundColor: '#6366F1' }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#4F46E5'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#6366F1'}>
                      <BarChart3 size={16} />
                      <span>Cargar Gráficos</span>
                    </button>
                    
                    <button style={{ ...styles.buttonPrimary, backgroundColor: '#3B82F6' }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#2563EB'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#3B82F6'}>
                      <RefreshCw size={16} />
                      <span>Actualizar</span>
                    </button>
                  </div>
                  
                  <div style={styles.emptyState}>
                    <BarChart size={64} style={styles.emptyIcon} />
                    <h3 style={styles.emptyTitle}>Análisis Avanzado</h3>
                    <p style={styles.emptyText}>Haga clic en "Cargar Gráficos" para visualizar las estadísticas detalladas.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Gestión Section */}
          {currentSection === 'gestion' && (
            <div>
              <div style={{ ...styles.pageHeader, background: 'linear-gradient(90deg, #14B8A6, #0D9488)' }}>
                <h1 style={styles.pageTitle}>
                  <UsersRound />
                  Gestión de Fichas
                </h1>
                <p style={styles.pageSubtitle}>Administración y mantenimiento de fichas de formación</p>
              </div>

              {/* Quick Actions */}
              <div style={styles.card}>
                <div style={{ ...styles.cardHeader, background: 'linear-gradient(90deg, #10B981, #059669)' }}>
                  <h3 style={styles.cardHeaderTitle}>
                    <Plus />
                    Acciones Rápidas
                  </h3>
                </div>
                
                <div style={styles.cardContent}>
                  <div style={styles.buttonGroup}>
                    <button style={{ ...styles.buttonPrimary, backgroundColor: '#10B981' }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#10B981'}>
                      <Plus size={16} />
                      <span>Nueva Ficha</span>
                    </button>
                    
                    <button style={{ ...styles.buttonPrimary, backgroundColor: '#3B82F6' }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#2563EB'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#3B82F6'}>
                      <Upload size={16} />
                      <span>Importar Datos</span>
                    </button>
                    
                    <button style={styles.buttonSecondary}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#4B5563'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#6B7280'}>
                      <RotateCcw size={16} />
                      <span>Sincronizar</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Files Management */}
              <div style={styles.card}>
                <div style={{ ...styles.cardHeader, background: 'linear-gradient(90deg, #14B8A6, #0D9488)' }}>
                  <h3 style={styles.cardHeaderTitle}>
                    <List size={20} />
                    Gestión de Fichas Activas
                  </h3>
                </div>
                
                <div style={styles.cardContent}>
                  <div style={{ ...styles.formGrid, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                    <div style={styles.inputGroup}>
                      <label style={styles.inputLabel}>
                        <Search size={16} />
                        Buscar Ficha
                      </label>
                      <input
                        type="text"
                        placeholder="Número de ficha o programa"
                        style={styles.input}
                        onFocus={(e) => e.target.style.borderColor = '#F97316'}
                        onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                      />
                    </div>
                    
                    <div style={styles.inputGroup}>
                      <label style={styles.inputLabel}>
                        <Filter size={16} />
                        Estado
                      </label>
                      <select style={styles.select}
                              onFocus={(e) => e.target.style.borderColor = '#F97316'}
                              onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}>
                        <option value="">Todos</option>
                        <option value="activa">Activa</option>
                        <option value="terminada">Terminada</option>
                        <option value="suspendida">Suspendida</option>
                      </select>
                    </div>
                  </div>

                  <div style={styles.emptyState}>
                    <UsersRound size={64} style={styles.emptyIcon} />
                    <h3 style={styles.emptyTitle}>Gestión de Fichas</h3>
                    <p style={styles.emptyText}>Use los filtros para buscar y administrar las fichas de formación.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Configuración Section */}
          {currentSection === 'configuracion' && (
            <div>
              <div style={{ ...styles.pageHeader, background: 'linear-gradient(90deg, #6B7280, #4B5563)' }}>
                <h1 style={styles.pageTitle}>
                  <Cog />
                  Configuración del Sistema
                </h1>
                <p style={styles.pageSubtitle}>Preferencias y configuración general</p>
              </div>

              {/* User Preferences */}
              <div style={styles.card}>
                <div style={{ ...styles.cardHeader, background: 'linear-gradient(90deg, #3B82F6, #1D4ED8)' }}>
                  <h3 style={styles.cardHeaderTitle}>
                    <User size={20} />
                    Preferencias del Usuario
                  </h3>
                </div>
                
                <div style={styles.cardContent}>
                  <div style={{ ...styles.formGrid, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                    <div style={styles.inputGroup}>
                      <label style={styles.inputLabel}>
                        <Palette size={16} />
                        Tema
                      </label>
                      <select style={styles.select}
                              onFocus={(e) => e.target.style.borderColor = '#F97316'}
                              onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}>
                        <option value="claro">Claro</option>
                        <option value="oscuro">Oscuro</option>
                        <option value="auto">Automático</option>
                      </select>
                    </div>
                    
                    <div style={styles.inputGroup}>
                      <label style={styles.inputLabel}>
                        <Languages size={16} />
                        Idioma
                      </label>
                      <select style={styles.select}
                              onFocus={(e) => e.target.style.borderColor = '#F97316'}
                              onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}>
                        <option value="es">Español</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                    
                    <div style={styles.inputGroup}>
                      <label style={styles.inputLabel}>
                        <List size={16} />
                        Registros por página
                      </label>
                      <select style={styles.select}
                              onFocus={(e) => e.target.style.borderColor = '#F97316'}
                              onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                      </select>
                    </div>
                  </div>

                  <div style={styles.buttonGroup}>
                    <button style={{ ...styles.buttonPrimary, backgroundColor: '#3B82F6' }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#2563EB'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#3B82F6'}>
                      <Save size={16} />
                      <span>Guardar Cambios</span>
                    </button>
                    
                    <button style={styles.buttonSecondary}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#4B5563'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#6B7280'}>
                      <Undo size={16} />
                      <span>Restaurar</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* System Configuration */}
              <div style={styles.card}>
                <div style={{ ...styles.cardHeader, background: 'linear-gradient(90deg, #6B7280, #4B5563)' }}>
                  <h3 style={styles.cardHeaderTitle}>
                    <Settings size={20} />
                    Configuración del Sistema
                  </h3>
                </div>
                
                <div style={styles.cardContent}>
                  <div style={styles.buttonGroup}>
                    <button style={{ ...styles.buttonPrimary, backgroundColor: '#3B82F6' }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#2563EB'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#3B82F6'}>
                      <Wifi size={16} />
                      <span>Verificar Conexión</span>
                    </button>
                    
                    <button style={styles.buttonSecondary}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#4B5563'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#6B7280'}>
                      <Trash2 size={16} />
                      <span>Limpiar Cache</span>
                    </button>
                    
                    <button style={{ ...styles.buttonPrimary, backgroundColor: '#10B981' }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#10B981'}>
                      <Shield size={16} />
                      <span>Respaldar Datos</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile overlay */}
      {!sidebarCollapsed && window.innerWidth <= 768 && (
        <div 
          style={styles.overlay}
          onClick={toggleSidebar}
        />
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Responsive styles */
        @media (max-width: 768px) {
          .nav-menu {
            display: none !important;
          }
          
          .main-content {
            margin-left: 0 !important;
          }
          
          .sidebar {
            transform: translateX(-100%) !important;
          }
          
          .sidebar.open {
            transform: translateX(0) !important;
          }
          
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
          
          .form-grid {
            grid-template-columns: 1fr !important;
          }
          
          .page-title {
            font-size: 24px !important;
          }
          
          .button-group {
            flex-direction: column !important;
          }
          
          .table-container {
            font-size: 12px !important;
          }
        }

        @media (max-width: 480px) {
          .content-area {
            padding: 16px !important;
          }
          
          .card-content {
            padding: 16px !important;
          }
          
          .page-header {
            padding: 16px !important;
          }
          
          .stat-card {
            padding: 16px !important;
          }
        }

        /* Hover effects for buttons */
        button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        button:active {
          transform: translateY(0);
        }

        /* Focus styles for inputs */
        input:focus,
        select:focus {
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
        }

        /* Smooth transitions */
        * {
          transition: all 0.2s ease;
        }

        /* Scrollbar styles */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        /* Table hover effects */
        tr:hover {
          background-color: #FFF7ED !important;
        }

        /* Card hover effects */
        .card:hover {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        /* Loading animation improvements */
        .spinner {
          animation: spin 1s linear infinite;
        }

        /* Badge animations */
        .badge {
          transition: all 0.2s ease;
        }

        .badge:hover {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

export default JuiciosPage;