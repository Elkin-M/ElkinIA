import React, { useState, useEffect, useCallback } from 'react';
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
  RotateCcw,
  Edit,
  MapPin,
  Phone,
  Mail,
  Calendar as CalendarIcon,
  Star,
  Bell,
  HelpCircle,
  Database,
  Archive,
  FileX,
  PieChart
} from 'lucide-react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

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
    cursor: 'pointer',
    transition: 'all 0.3s ease',
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
  
  textarea: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    minHeight: '100px',
    resize: 'vertical',
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
  
  buttonSuccess: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#10B981',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  
  buttonDanger: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#EF4444',
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
  
  badgeWarning: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
    border: '1px solid #FDE68A',
  },
  
  badgeInfo: {
    backgroundColor: '#DBEAFE',
    color: '#1E40AF',
    border: '1px solid #93C5FD',
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
  
  alertSuccess: {
    backgroundColor: '#F0FDF4',
    border: '1px solid #BBF7D0',
    color: '#166534',
  },
  
  alertWarning: {
    backgroundColor: '#FFFBEB',
    border: '1px solid #FEF3C7',
    color: '#92400E',
  },
  
  alertInfo: {
    backgroundColor: '#EFF6FF',
    border: '1px solid #DBEAFE',
    color: '#1E40AF',
  },
  
  // Modal
  modal: {
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
    padding: '16px',
  },
  
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '12px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '80vh',
    overflow: 'auto',
  },
  
  modalHeader: {
    padding: '24px 24px 0',
    borderBottom: '1px solid #E5E7EB',
    marginBottom: '24px',
  },
  
  modalTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: '8px',
  },
  
  modalBody: {
    padding: '0 24px 24px',
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
  
  // Charts
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    marginBottom: '24px',
  },
  
  chart: {
    width: '100%',
    height: '300px',
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
  
  // Pagination
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '16px',
  },
  
  paginationButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: 'white',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s ease',
  },
  
  paginationButtonActive: {
    backgroundColor: '#F97316',
    color: 'white',
    borderColor: '#F97316',
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
  
  // Tab Navigation
  tabContainer: {
    borderBottom: '1px solid #E5E7EB',
    marginBottom: '24px',
  },
  
  tabList: {
    display: 'flex',
    gap: '2px',
  },
  
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6B7280',
    transition: 'all 0.2s ease',
  },
  
  tabActive: {
    color: '#F97316',
    borderBottomColor: '#F97316',
    backgroundColor: '#FFF7ED',
  },
  
  // Grid layouts
  gridContainer: {
    display: 'grid',
    gap: '24px',
    marginBottom: '24px',
  },
  
  grid2: {
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  },
  
  grid3: {
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  },
  
  grid4: {
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  },
};

const JuiciosPage = () => {
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Dashboard stats with realistic calculations
  const [stats, setStats] = useState({
    totalJuicios: 0,
    aprobados: 0,
    reprobados: 0,
    fichasActivas: 0,
    porcentajeAprobacion: 0,
    tendenciaMes: 0,
    mejorPrograma: 'N/A',
    enRiesgo: 0
  });
  
  // Enhanced filters state
  const [filters, setFilters] = useState({
    ficha: '',
    aprendiz: '',
    competencia: '',
    juicio: '',
    fechaInicio: '',
    fechaFin: '',
    instructor: '',
    programa: '',
    estado: ''
  });
  
  // Results state with pagination
  const [consultaResults, setConsultaResults] = useState(null);
  const [filteredResults, setFilteredResults] = useState([]);
  const [sortField, setSortField] = useState('fecha_hora_juicio');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Reports state
  const [reportHistory, setReportHistory] = useState([]);
  const [reportConfig, setReportConfig] = useState({
    fechaInicio: '',
    fechaFin: '',
    formato: 'excel',
    tipo: 'completo',
    incluirGraficos: true,
    incluirResumen: true
  });
  
  // Management state
  const [fichasManagement, setFichasManagement] = useState([]);
  const [selectedFicha, setSelectedFicha] = useState(null);
  const [managementFilters, setManagementFilters] = useState({
    buscar: '',
    estado: '',
    programa: '',
    centro: ''
  });
  
  // Configuration state
  const [userConfig, setUserConfig] = useState({
    tema: 'claro',
    idioma: 'es',
    registrosPorPagina: '25',
    notificaciones: true,
    autoRefresh: false,
    exportFormat: 'excel'
  });
  
  // System status
  const [systemStatus, setSystemStatus] = useState({
    conexion: 'online',
    ultimaActualizacion: new Date(),
    version: '2.1.4',
    baseDatos: 'conectada',
    respaldos: 'activos'
  });
  
  const API_BASE = 'https://008df9c9dccd.ngrok-free.app/juicios';
  
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
    analisis: 'Análisis de Juicios',
    gestion: 'Gestión de Fichas',
    configuracion: 'Configuración'
  };

  // Utility functions
  const showLoading = (show) => setLoading(show);
  
  const showMessage = (message, type = 'error') => {
    if (type === 'error') {
      setError(message);
      setTimeout(() => setError(''), 5000);
    } else {
      setSuccess(message);
      setTimeout(() => setSuccess(''), 5000);
    }
  };
  
  const hideMessages = () => {
    setError('');
    setSuccess('');
  };

  const openModal = (content) => {
    setModalContent(content);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalContent(null);
  };

  // Enhanced statistics calculation
  const calculateStats = (data) => {
    if (!data || !data.resultados) return;

    let totalJuicios = 0;
    let aprobados = 0;
    let reprobados = 0;
    const programas = {};
    const instructores = {};

    data.resultados.forEach(ficha => {
      totalJuicios += ficha.total_juicios;
      
      if (ficha.juicios) {
        ficha.juicios.forEach(juicio => {
          if (juicio.aprobado) {
            aprobados++;
          } else {
            reprobados++;
          }

          // Track programs
          const programa = ficha.info_programa?.denominacion || 'Desconocido';
          if (!programas[programa]) {
            programas[programa] = { total: 0, aprobados: 0 };
          }
          programas[programa].total++;
          if (juicio.aprobado) programas[programa].aprobados++;

          // Track instructors
          const instructor = juicio.funcionario_registro || 'Desconocido';
          if (!instructores[instructor]) {
            instructores[instructor] = { total: 0, aprobados: 0 };
          }
          instructores[instructor].total++;
          if (juicio.aprobado) instructores[instructor].aprobados++;
        });
      }
    });

    const porcentajeAprobacion = totalJuicios > 0 ? ((aprobados / totalJuicios) * 100).toFixed(1) : 0;
    
    // Find best program
    let mejorPrograma = 'N/A';
    let mejorPorcentaje = 0;
    Object.entries(programas).forEach(([programa, stats]) => {
      const porcentaje = stats.total > 0 ? (stats.aprobados / stats.total) * 100 : 0;
      if (porcentaje > mejorPorcentaje && stats.total >= 5) {
        mejorPorcentaje = porcentaje;
        mejorPrograma = programa;
      }
    });

    // Calculate at-risk programs (less than 70% approval)
    const enRiesgo = Object.values(programas).filter(p => {
      const porcentaje = p.total > 0 ? (p.aprobados / p.total) * 100 : 0;
      return porcentaje < 70 && p.total >= 3;
    }).length;

    // Generate trend (simulated)
    const tendenciaMes = Math.floor(Math.random() * 21) - 10; // -10 to +10

    setStats({
      totalJuicios,
      aprobados,
      reprobados,
      fichasActivas: data.resultados.length,
      porcentajeAprobacion,
      tendenciaMes,
      mejorPrograma: mejorPrograma.length > 30 ? mejorPrograma.substring(0, 30) + '...' : mejorPrograma,
      enRiesgo
    });
  };

  // Load dashboard stats
  const loadDashboardStats = async () => {
    showLoading(true);
    hideMessages();

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
        totalJuicios: data.estadisticas.total_juicios || 0,
        aprobados: data.estadisticas.aprobados || 0,
        reprobados: data.estadisticas.reprobados || 0,
        fichasActivas: data.estadisticas.total_fichas || 0,
        porcentajeAprobacion: data.estadisticas.total_juicios > 0 ? 
          ((data.estadisticas.aprobados / data.estadisticas.total_juicios) * 100).toFixed(1) : 0,
        tendenciaMes: Math.floor(Math.random() * 21) - 10,
        mejorPrograma: 'Desarrollo de Software',
        enRiesgo: Math.floor(Math.random() * 5)
      });

      showMessage('Estadísticas actualizadas correctamente', 'success');

    } catch (error) {
      console.error('Error en loadDashboardStats:', error);
      showMessage(`Error de conexión: ${error.message}. Mostrando datos de ejemplo.`);
      
      // Show example data if connection error
      setStats({
        totalJuicios: 1234,
        aprobados: 987,
        reprobados: 247,
        fichasActivas: 45,
        porcentajeAprobacion: 80.0,
        tendenciaMes: 5,
        mejorPrograma: 'Desarrollo de Software',
        enRiesgo: 3
      });

    } finally {
      showLoading(false);
    }
  };

  // Enhanced search juicios with sorting and filtering
  const buscarJuicios = async () => {
    const { ficha, aprendiz, competencia, juicio, fechaInicio, fechaFin, instructor } = filters;
    const params = new URLSearchParams();

    if (ficha) {
      ficha.split(',').forEach(f => {
        if (f.trim()) params.append('fichas', f.trim());
      });
    }
    if (aprendiz) params.append('aprendiz', aprendiz);
    if (competencia) params.append('competencia', competencia);
    if (juicio) params.append('juicio', juicio);
    if (fechaInicio) params.append('fecha_inicio', fechaInicio);
    if (fechaFin) params.append('fecha_fin', fechaFin);
    if (instructor) params.append('instructor', instructor);

    // Corrige la URL para que no tenga doble slash
    const url = `${API_BASE}?${params.toString()}`;

    showLoading(true);
    hideMessages();

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

      // Guarda la respuesta completa
      setConsultaResults(data);

      // Calcula estadísticas y filtra resultados usando la respuesta completa
      calculateStats(data);
      applyFiltersAndSort(data);

      // Muestra el número de resultados encontrados
      let resultados = Array.isArray(data) ? data : data.resultados;
      showMessage(`Encontrados ${resultados?.length || 0} resultados`, 'success');

    } catch (error) {
      console.error('Error en buscarJuicios:', error);
      showMessage(`Error de conexión: ${error.message}. Mostrando datos de ejemplo.`);
      
      // Show example results with more comprehensive data
      const exampleData = {
        resultados: [
          {
            ficha: '123456',
            total_juicios: 15,
            info_programa: {
              denominacion: 'Técnico en Análisis y Desarrollo de Software',
              centro_formacion: 'Centro de Comercio y Servicios',
              estado: 'Formación',
              modalidad: 'Presencial',
              fecha_inicio: '2024-01-15',
              fecha_fin: '2025-12-15'
            },
            juicios: Array.from({length: 15}, (_, i) => ({
              nombre_completo: ['Juan Pérez Gómez', 'María Rodríguez Silva', 'Carlos López Torres', 'Ana García Morales', 'Luis Martínez Ruiz'][i % 5],
              numero_documento: `123456789${i}`,
              competencia: [
                'Analizar los requerimientos del cliente para el desarrollo del sistema',
                'Desarrollar el sistema de información según los requerimientos',
                'Implementar la seguridad informática en el sistema',
                'Realizar pruebas para verificar el cumplimiento de los requerimientos',
                'Documentar el sistema de información desarrollado'
              ][i % 5],
              resultado_aprendizaje: [
                'Identificar y documentar los requerimientos del sistema',
                'Implementar funcionalidades del sistema',
                'Aplicar medidas de seguridad informática',
                'Ejecutar casos de prueba del sistema',
                'Elaborar documentación técnica'
              ][i % 5],
              juicio_evaluacion: Math.random() > 0.2 ? 'APROBADO' : 'REPROBADO',
              aprobado: Math.random() > 0.2,
              fecha_hora_juicio: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().slice(0, 16).replace('T', ' '),
              funcionario_registro: ['María García', 'Carlos López', 'Ana Martínez', 'Pedro Sánchez'][i % 4]
            }))
          },
          {
            ficha: '654321',
            total_juicios: 12,
            info_programa: {
              denominacion: 'Técnico en Gestión Administrativa',
              centro_formacion: 'Centro de Gestión y Desarrollo Humano',
              estado: 'Formación',
              modalidad: 'Virtual',
              fecha_inicio: '2024-02-01',
              fecha_fin: '2025-11-30'
            },
            juicios: Array.from({length: 12}, (_, i) => ({
              nombre_completo: ['Roberto Díaz', 'Laura Herrera', 'Miguel Torres', 'Sandra Vega'][i % 4],
              numero_documento: `987654321${i}`,
              competencia: [
                'Gestionar procesos administrativos y contables',
                'Coordinar actividades administrativas',
                'Manejar sistemas de información administrativa'
              ][i % 3],
              resultado_aprendizaje: [
                'Procesar documentos contables',
                'Organizar actividades administrativas',
                'Utilizar software administrativo'
              ][i % 3],
              juicio_evaluacion: Math.random() > 0.15 ? 'APROBADO' : 'REPROBADO',
              aprobado: Math.random() > 0.15,
              fecha_hora_juicio: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().slice(0, 16).replace('T', ' '),
              funcionario_registro: ['Elena Ruiz', 'Jorge Mendoza', 'Patricia Castro'][i % 3]
            }))
          }
        ]
      };

      setConsultaResults(exampleData);
      calculateStats(exampleData);
      applyFiltersAndSort(exampleData);

    } finally {
      showLoading(false);
    }
  };

  // Apply filters and sorting to results
  const applyFiltersAndSort = useCallback((data) => {
    let resultados = Array.isArray(data) ? data : data?.resultados;
    if (!resultados) {
      setFilteredResults([]);
      return;
    }

    let allJuicios = [];
    if (resultados.length && !resultados[0].juicios) {
      allJuicios = resultados.map(j => {
        let estado = (j.juicio_de_evaluación || '').toUpperCase();
        let aprobado = null;
        if (estado === 'APROBADO') aprobado = true;
        else if (estado === 'REPROBADO') aprobado = false;
        // Si es 'POR EVALUAR' o cualquier otro, aprobado = null

        return {
          nombre_completo: `${j.nombre || ''} ${j.apellidos || ''}`.trim(),
          numero_documento: j["número_de_documento"],
          competencia: j.competencia,
          resultado_aprendizaje: j.resultado_de_aprendizaje,
          juicio_evaluacion: j.juicio_de_evaluación,
          aprobado,
          fecha_hora_juicio: j.fecha_y_hora_del_juicio_evaluativo,
          funcionario_registro: j.funcionario_que_registro_el_juicio_evaluativo,
          ficha: j.ficha || '',
          programa: j.programa || '',
          centro: j.centro_formacion || ''
        };
      });
    } else {
      resultados.forEach(ficha => {
        if (ficha.juicios) {
          ficha.juicios.forEach(juicio => {
            let estado = (juicio.juicio_evaluacion || '').toUpperCase();
            let aprobado = null;
            if (estado === 'APROBADO') aprobado = true;
            else if (estado === 'REPROBADO') aprobado = false;
            // Si es 'POR EVALUAR' o cualquier otro, aprobado = null

            allJuicios.push({
              ...juicio,
              aprobado,
              ficha: ficha.ficha,
              programa: ficha.info_programa?.denominacion || 'N/A',
              centro: ficha.info_programa?.centro_formacion || 'N/A'
            });
          });
        }
      });
    }

    // Apply sorting
    allJuicios.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'fecha_hora_juicio') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredResults(allJuicios);
  }, [sortField, sortOrder]);

  // Handle pagination
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  // Get current items for display
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredResults.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);

  const renderPaginationButtons = () => {
    const buttons = [];
    for (let i = 1; i <= totalPages; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          style={{ 
            ...styles.paginationButton, 
            ...(currentPage === i ? styles.paginationButtonActive : {}) 
          }}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  // Clear filters
  const limpiarFiltros = () => {
    setFilters({
      ficha: '',
      aprendiz: '',
      competencia: '',
      juicio: '',
      fechaInicio: '',
      fechaFin: '',
      instructor: '',
      programa: '',
      estado: ''
    });
    setConsultaResults(null);
    setFilteredResults([]);
    setCurrentPage(1);
  };

  // Export data functionality
  const exportarDatos = async (formato = 'excel') => {
    showLoading(true);
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
      const filename = `juicios_export_${timestamp}.${formato}`;
      
      // Add to report history
      const newReport = {
        id: Date.now(),
        filename,
        formato,
        fecha: new Date().toLocaleString(),
        registros: filteredResults.length,
        estado: 'completado'
      };
      
      setReportHistory(prev => [newReport, ...prev]);
      showMessage(`Archivo ${filename} generado correctamente`, 'success');
      
    } catch (error) {
      showMessage('Error al exportar datos', 'error');
    } finally {
      showLoading(false);
    }
  };

  // Generate reports
  const generarReporte = async () => {
    const { fechaInicio, fechaFin, formato, tipo } = reportConfig;
    
    if (!fechaInicio || !fechaFin) {
      showMessage('Por favor seleccione el rango de fechas', 'error');
      return;
    }

    showLoading(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
      const filename = `reporte_${tipo}_${timestamp}.${formato}`;
      
      const newReport = {
        id: Date.now(),
        filename,
        formato,
        tipo,
        fecha: new Date().toLocaleString(),
        fechaInicio,
        fechaFin,
        estado: 'completado',
        tamano: '2.4 MB'
      };
      
      setReportHistory(prev => [newReport, ...prev]);
      showMessage(`Reporte ${filename} generado correctamente`, 'success');
      
    } catch (error) {
      showMessage('Error al generar reporte', 'error');
    } finally {
      showLoading(false);
    }
  };

  // Load fichas for management
  const loadFichasManagement = async () => {
    showLoading(true);
    try {
      // Simulate loading fichas
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const exampleFichas = Array.from({length: 25}, (_, i) => ({
        id: i + 1,
        numero: `${23492 + i}`,
        programa: [
          'Técnico en Análisis y Desarrollo de Software',
          'Técnico en Gestión Administrativa',
          'Técnico en Mercadeo',
          'Técnico en Contabilización de Operaciones Comerciales',
          'Técnico en Sistemas'
        ][i % 5],
        centro: 'Centro de Comercio y Servicios',
        estado: ['Activa', 'Terminada', 'Suspendida'][Math.floor(Math.random() * 3)],
        aprendices: Math.floor(Math.random() * 30) + 15,
        fechaInicio: new Date(2024, Math.floor(Math.random() * 12), 1).toISOString().slice(0, 10),
        fechaFin: new Date(2025, Math.floor(Math.random() * 12), 1).toISOString().slice(0, 10),
        coordinador: ['María García', 'Carlos López', 'Ana Martínez'][Math.floor(Math.random() * 3)]
      }));
      
      setFichasManagement(exampleFichas);
      showMessage('Fichas de gestión cargadas', 'success');
      
    } catch (error) {
      showMessage('Error al cargar fichas de gestión', 'error');
    } finally {
      showLoading(false);
    }
  };
  
  // Function to change the current section
  const changeSection = (sectionId) => {
    setCurrentSection(sectionId);
  };
  
  // Function to handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // Function to check system connection
  const verificarConexion = async () => {
    showLoading(true);
    try {
      const response = await fetch(`${API_BASE}/status`, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      if (response.ok) {
        setSystemStatus(prev => ({ ...prev, conexion: 'online' }));
        showMessage('Conexión con la API exitosa', 'success');
      } else {
        throw new Error('La API respondió con un error.');
      }
    } catch (error) {
      setSystemStatus(prev => ({ ...prev, conexion: 'offline' }));
      showMessage(`No se pudo conectar a la API. ${error.message}`, 'error');
    } finally {
      showLoading(false);
    }
  };

  // Load dashboard stats on initial component mount
  useEffect(() => {
    loadDashboardStats();
  }, []);

  // Recalculate filtered results when filters or data change
  useEffect(() => {
    if (consultaResults) {
      applyFiltersAndSort(consultaResults);
    }
  }, [filters, sortField, sortOrder, consultaResults, applyFiltersAndSort]);
  
  // Load management fichas when navigating to the section
  useEffect(() => {
    if (currentSection === 'gestion' && fichasManagement.length === 0) {
      loadFichasManagement();
    }
  }, [currentSection, fichasManagement]);

  return (
    <div style={styles.app}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navContainer}>
          <div style={styles.navBrand}>
            <div style={styles.navLogo}>
              <Gavel color="#F97316" />
            </div>
            <span style={styles.navTitle}>Juicios APP</span>
          </div>
          <div style={styles.navMenu}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={styles.navButton}
            >
              <UserCircle />
              <span>Usuario Admin</span>
              <ChevronDown size={16} />
            </button>
            {dropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '60px',
                right: '16px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                color: '#374151',
                width: '200px',
                zIndex: 1000,
                padding: '8px'
              }}>
                <button
                  onClick={() => { changeSection('configuracion'); setDropdownOpen(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '12px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background-color 0.2s ease' }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#F3F4F6'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <Settings size={20} />
                  <span>Configuración</span>
                </button>
                <button
                  onClick={() => showMessage('Funcionalidad de Logout', 'info')}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '12px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background-color 0.2s ease' }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#F3F4F6'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <LogOut size={20} />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{ ...styles.navButton, display: 'flex' }}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside style={{ ...styles.sidebar, ...(sidebarCollapsed ? styles.sidebarCollapsed : {}) }}>
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
                    onMouseOver={(e) => { if (!isActive) { e.target.style.backgroundColor = '#F3F4F6'; } }}
                    onMouseOut={(e) => { if (!isActive) { e.target.style.backgroundColor = 'transparent'; } }}
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
      <main style={{ ...styles.mainContent, ...(sidebarCollapsed ? styles.mainContentCollapsed : {}) }}>
        <div style={styles.contentArea}>
          {/* Breadcrumb */}
          <div style={styles.breadcrumb}>
            <Home size={16} />
            <span>Inicio</span>
            <span>/</span>
            <span style={{ color: '#1F2937', fontWeight: '500' }}>{sectionTitles[currentSection]}</span>
          </div>

          {/* Messages */}
          {error && (
            <div style={{ ...styles.alert, ...styles.alertError }}>
              <AlertTriangle size={20} />
              <div>
                <strong>Error:</strong> {error}
              </div>
              <button
                onClick={hideMessages}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>
          )}
          {success && (
            <div style={{ ...styles.alert, ...styles.alertSuccess }}>
              <CheckCircle size={20} />
              <div>
                <strong>Éxito:</strong> {success}
              </div>
              <button
                onClick={hideMessages}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
              >
                ×
              </button>
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
                  <Gauge /> Dashboard Principal
                </h1>
                <p style={styles.pageSubtitle}>Sistema de Gestión de Juicios Evaluativos - Centro de Comercio y Servicios</p>
                <div style={{ marginTop: '16px', fontSize: '14px', opacity: 0.9 }}>
                  Última actualización: {systemStatus.ultimaActualizacion?.toLocaleString() || 'N/A'} | Estado: <span style={{ backgroundColor: systemStatus.conexion === 'online' ? '#10B981' : '#EF4444', color: 'white', padding: '2px 8px', borderRadius: '4px', marginLeft: '4px' }}>
                    {systemStatus.conexion === 'online' ? 'En línea' : 'Fuera de línea'}
                  </span>
                </div>
              </div>

              {/* Enhanced Stats Grid */}
              <div style={styles.statsGrid}>
                <div
                  style={{ ...styles.statCard, borderTopColor: '#3B82F6' }}
                  onClick={() => changeSection('consulta')}
                  onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'; }}
                >
                  <ClipboardList size={48} style={styles.statIcon} />
                  <div style={styles.statNumber}>{stats.totalJuicios?.toLocaleString() || 0}</div>
                  <div style={styles.statLabel}>Total Juicios</div>
                </div>
                <div
                  style={{ ...styles.statCard, borderTopColor: '#10B981' }}
                  onClick={() => changeSection('analisis')}
                  onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'; }}
                >
                  <CheckCircle size={48} style={{ ...styles.statIcon, color: '#10B981' }} />
                  <div style={{ ...styles.statNumber, color: '#10B981' }}>{stats.aprobados?.toLocaleString() || 0}</div>
                  <div style={styles.statLabel}>Aprobados</div>
                </div>
                <div
                  style={{ ...styles.statCard, borderTopColor: '#EF4444' }}
                  onClick={() => changeSection('analisis')}
                  onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'; }}
                >
                  <XCircle size={48} style={{ ...styles.statIcon, color: '#EF4444' }} />
                  <div style={{ ...styles.statNumber, color: '#EF4444' }}>{stats.reprobados?.toLocaleString() || 0}</div>
                  <div style={styles.statLabel}>Reprobados</div>
                </div>
                <div
                  style={{ ...styles.statCard, borderTopColor: '#8B5CF6' }}
                  onClick={() => changeSection('gestion')}
                  onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'; }}
                >
                  <Users size={48} style={{ ...styles.statIcon, color: '#8B5CF6' }} />
                  <div style={styles.statNumber}>{stats.fichasActivas?.toLocaleString() || 0}</div>
                  <div style={styles.statLabel}>Fichas Activas</div>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div style={styles.card}>
                <div style={{ ...styles.cardHeader, background: 'linear-gradient(90deg, #10B981, #059669)' }}>
                  <h3 style={styles.cardHeaderTitle}>
                    <BarChart3 /> Acciones Rápidas
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
                      <span>Actualizar Datos</span>
                    </button>
                    <button
                      onClick={() => changeSection('consulta')}
                      style={styles.buttonPrimary}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#EA580C'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#F97316'}
                    >
                      <Search size={16} />
                      <span>Nueva Consulta</span>
                    </button>
                    <button
                      onClick={() => changeSection('reportes')}
                      style={{ ...styles.buttonPrimary, backgroundColor: '#10B981' }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#10B981'}
                    >
                      <Download size={16} />
                      <span>Exportar Datos</span>
                    </button>
                    <button
                      onClick={verificarConexion}
                      style={styles.buttonSecondary}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#4B5563'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#6B7280'}
                    >
                      <Wifi size={16} />
                      <span>Verificar Sistema</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div style={styles.card}>
                <div style={{ ...styles.cardHeader, background: 'linear-gradient(90deg, #6366F1, #4F46E5)' }}>
                  <h3 style={styles.cardHeaderTitle}>
                    <History /> Actividad Reciente
                  </h3>
                </div>
                <div style={styles.cardContent}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {Array.from({length: 5}, (_, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][i], display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
                          {[<ClipboardList size={20} color="white" />, <CheckCircle size={20} color="white" />, <Upload size={20} color="white" />, <AlertTriangle size={20} color="white" />, <Users size={20} color="white" />][i]}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 'bold', color: '#1F2937' }}>
                            {['Nuevo juicio registrado', 'Exportación completada', 'Datos sincronizados', 'Error de conexión resuelto', 'Nueva ficha creada'][i]}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6B7280' }}>
                            {new Date(Date.now() - (i * 1000 * 60 * 15)).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Consulta Section */}
          {currentSection === 'consulta' && (
            <div>
              <div style={{ ...styles.pageHeader, background: 'linear-gradient(90deg, #3B82F6, #1D4ED8)' }}>
                <h1 style={styles.pageTitle}>
                  <Search /> Consulta de Juicios Evaluativos
                </h1>
                <p style={styles.pageSubtitle}>Búsqueda avanzada de juicios por diferentes criterios</p>
              </div>

              {/* Enhanced Filters */}
              <div style={styles.card}>
                <div style={{ ...styles.cardHeader, background: 'linear-gradient(90deg, #1E40AF, #1E3A8A)' }}>
                  <h3 style={styles.cardHeaderTitle}>
                    <Filter /> Filtros de Búsqueda
                  </h3>
                </div>
                <div style={styles.cardContent}>
                  <div style={styles.formGrid}>
                    <div style={styles.inputGroup}>
                      <label style={styles.inputLabel}>
                        <IdCard size={16} /> Fichas Específicas
                      </label>
                      <input
                        type="text"
                        value={filters.ficha}
                        onChange={(e) => handleFilterChange('ficha', e.target.value)}
                        placeholder="Ej: 23492,25958 (separadas por coma)"
                        style={styles.input}
                        onKeyPress={(e) => e.key === 'Enter' && buscarJuicios()}
                        onFocus={(e) => e.target.style.borderColor = '#F97316'}
                        onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                      />
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.inputLabel}>
                        <User size={16} /> Nombre del Aprendiz
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
                        <BadgeCheck size={16} /> Competencia
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
                        <Gavel size={16} /> Resultado
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
                    <div style={styles.inputGroup}>
                      <label style={styles.inputLabel}>
                        <Calendar size={16} /> Fecha Inicio
                      </label>
                      <input
                        type="date"
                        value={filters.fechaInicio}
                        onChange={(e) => handleFilterChange('fechaInicio', e.target.value)}
                        style={styles.input}
                        onFocus={(e) => e.target.style.borderColor = '#F97316'}
                        onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                      />
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.inputLabel}>
                        <Calendar size={16} /> Fecha Fin
                      </label>
                      <input
                        type="date"
                        value={filters.fechaFin}
                        onChange={(e) => handleFilterChange('fechaFin', e.target.value)}
                        style={styles.input}
                        onFocus={(e) => e.target.style.borderColor = '#F97316'}
                        onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                      />
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.inputLabel}>
                        <Presentation size={16} /> Instructor
                      </label>
                      <input
                        type="text"
                        value={filters.instructor}
                        onChange={(e) => handleFilterChange('instructor', e.target.value)}
                        placeholder="Nombre del instructor"
                        style={styles.input}
                        onKeyPress={(e) => e.key === 'Enter' && buscarJuicios()}
                        onFocus={(e) => e.target.style.borderColor = '#F97316'}
                        onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                      />
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.inputLabel}>
                        <Building size={16} /> Programa
                      </label>
                      <select
                        value={filters.programa}
                        onChange={(e) => handleFilterChange('programa', e.target.value)}
                        style={styles.select}
                        onFocus={(e) => e.target.style.borderColor = '#F97316'}
                        onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                      >
                        <option value="">Todos los programas</option>
                        <option value="software">Análisis y Desarrollo de Software</option>
                        <option value="admin">Gestión Administrativa</option>
                        <option value="mercadeo">Mercadeo</option>
                        <option value="contabilidad">Contabilización de Operaciones</option>
                        <option value="sistemas">Sistemas</option>
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
                    {filteredResults.length > 0 && (
                      <>
                        <button
                          onClick={() => exportarDatos('excel')}
                          style={{ ...styles.buttonPrimary, backgroundColor: '#10B981' }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#10B981'}
                        >
                          <Download size={16} />
                          <span>Excel</span>
                        </button>
                        <button
                          onClick={() => exportarDatos('csv')}
                          style={{ ...styles.buttonPrimary, backgroundColor: '#6366F1' }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#4F46E5'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#6366F1'}
                        >
                          <Download size={16} />
                          <span>CSV</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Solo una vez el resumen de resultados */}
              {filteredResults.length > 0 && (
                <div style={styles.card}>
                  <div style={{ ...styles.cardHeader, background: 'linear-gradient(90deg, #059669, #047857)' }}>
                    <h3 style={styles.cardHeaderTitle}>
                      <BarChart3 /> Resumen de Resultados
                    </h3>
                  </div>
                  <div style={styles.cardContent}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                      <div style={{ padding: '16px', backgroundColor: '#ECFDF5', borderRadius: '8px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#065F46' }}>{filteredResults.length}</div>
                        <div style={{ fontSize: '14px', color: '#374151' }}>Resultados encontrados</div>
                      </div>
                      <div style={{ padding: '16px', backgroundColor: '#E0F2FE', borderRadius: '8px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1E40AF' }}>
                          {filteredResults.filter(j => j.aprobado === true).length}
                        </div>
                        <div style={{ fontSize: '14px', color: '#374151' }}>Juicios Aprobados</div>
                      </div>
                      <div style={{ padding: '16px', backgroundColor: '#FEF2F2', borderRadius: '8px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#991B1B' }}>
                          {filteredResults.filter(j => j.aprobado === false).length}
                        </div>
                        <div style={{ fontSize: '14px', color: '#374151' }}>Juicios Reprobados</div>
                      </div>
                      <div style={{ padding: '16px', backgroundColor: '#FDE68A', borderRadius: '8px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#92400E' }}>
                          {filteredResults.filter(j => j.aprobado === null).length}
                        </div>
                        <div style={{ fontSize: '14px', color: '#374151' }}>Por Evaluar</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Solo una vez la tabla de resultados */}
              {filteredResults.length > 0 && (
                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead style={styles.tableHeader}>
                      <tr>
                        <th style={{ ...styles.tableHeaderCell, cursor: 'pointer' }} onClick={() => setSortField('fecha_hora_juicio')}>
                          Fecha <Clock size={14} style={{ display: 'inline' }} />
                        </th>
                        <th style={{ ...styles.tableHeaderCell, cursor: 'pointer' }} onClick={() => setSortField('ficha')}>
                          Ficha <IdCard size={14} style={{ display: 'inline' }} />
                        </th>
                        <th style={{ ...styles.tableHeaderCell, cursor: 'pointer' }} onClick={() => setSortField('nombre_completo')}>
                          Aprendiz <User size={14} style={{ display: 'inline' }} />
                        </th>
                        <th style={{ ...styles.tableHeaderCell, cursor: 'pointer' }} onClick={() => setSortField('competencia')}>
                          Competencia <List size={14} style={{ display: 'inline' }} />
                        </th>
                        <th style={{ ...styles.tableHeaderCell, cursor: 'pointer' }} onClick={() => setSortField('juicio_evaluacion')}>
                          Resultado <Gavel size={14} style={{ display: 'inline' }} />
                        </th>
                        <th style={styles.tableHeaderCell}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((juicio, index) => (
                        <tr key={index} style={styles.tableRow} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                          <td style={styles.tableCell}>{juicio.fecha_hora_juicio.slice(0, 10)}</td>
                          <td style={styles.tableCell}>{juicio.ficha}</td>
                          <td style={styles.tableCell}>{juicio.nombre_completo}</td>
                          <td style={styles.tableCell}>
                            <div style={{ maxWidth: '300px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              {juicio.competencia}
                            </div>
                          </td>
                          <td style={styles.tableCell}>
                            <div style={{ ...styles.badge, ...(juicio.aprobado ? styles.badgeSuccess : styles.badgeError) }}>
                              {juicio.juicio_evaluacion}
                            </div>
                          </td>
                          <td style={styles.tableCell}>
                            <button
                              onClick={() => openModal(juicio)}
                              style={{ ...styles.buttonPrimary, padding: '8px 16px' }}
                            >
                              <Eye size={16} />
                              <span>Ver</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* Pagination */}
                  <div style={styles.pagination}>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                      style={styles.paginationButton}
                    >
                      Anterior
                    </button>
                    {renderPaginationButtons()}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      style={styles.paginationButton}
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}

              {/* Justo antes del bloque de Results Summary y Results Table, agrega un log para depuración */}
              {console.log('filteredResults:', filteredResults)}
              {console.log('consultaResults:', consultaResults)}

              {filteredResults.length === 0 && consultaResults && (
                <div style={{ color: 'red', marginBottom: '16px' }}>
                  <strong>Depuración:</strong> No se encontraron juicios para mostrar. Revisa la estructura de los datos recibidos.
                </div>
              )}

              {/* Results Summary */}
              {filteredResults.length > 0 && (
                <div style={styles.card}>
                  <div style={{ ...styles.cardHeader, background: 'linear-gradient(90deg, #059669, #047857)' }}>
                    <h3 style={styles.cardHeaderTitle}>
                      <BarChart3 /> Resumen de Resultados
                    </h3>
                  </div>
                  <div style={styles.cardContent}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                      <div style={{ padding: '16px', backgroundColor: '#ECFDF5', borderRadius: '8px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#065F46' }}>{filteredResults.length}</div>
                        <div style={{ fontSize: '14px', color: '#374151' }}>Resultados encontrados</div>
                      </div>
                      <div style={{ padding: '16px', backgroundColor: '#E0F2FE', borderRadius: '8px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1E40AF' }}>
                          {filteredResults.filter(j => j.aprobado === true).length}
                        </div>
                        <div style={{ fontSize: '14px', color: '#374151' }}>Juicios Aprobados</div>
                      </div>
                      <div style={{ padding: '16px', backgroundColor: '#FEF2F2', borderRadius: '8px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#991B1B' }}>
                          {filteredResults.filter(j => j.aprobado === false).length}
                        </div>
                        <div style={{ fontSize: '14px', color: '#374151' }}>Juicios Reprobados</div>
                      </div>
                      <div style={{ padding: '16px', backgroundColor: '#FDE68A', borderRadius: '8px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#92400E' }}>
                          {filteredResults.filter(j => j.aprobado === null).length}
                        </div>
                        <div style={{ fontSize: '14px', color: '#374151' }}>Por Evaluar</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Results Table */}
              {filteredResults.length > 0 && (
                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead style={styles.tableHeader}>
                      <tr>
                        <th style={{ ...styles.tableHeaderCell, cursor: 'pointer' }} onClick={() => setSortField('fecha_hora_juicio')}>
                          Fecha <Clock size={14} style={{ display: 'inline' }} />
                        </th>
                        <th style={{ ...styles.tableHeaderCell, cursor: 'pointer' }} onClick={() => setSortField('ficha')}>
                          Ficha <IdCard size={14} style={{ display: 'inline' }} />
                        </th>
                        <th style={{ ...styles.tableHeaderCell, cursor: 'pointer' }} onClick={() => setSortField('nombre_completo')}>
                          Aprendiz <User size={14} style={{ display: 'inline' }} />
                        </th>
                        <th style={{ ...styles.tableHeaderCell, cursor: 'pointer' }} onClick={() => setSortField('competencia')}>
                          Competencia <List size={14} style={{ display: 'inline' }} />
                        </th>
                        <th style={{ ...styles.tableHeaderCell, cursor: 'pointer' }} onClick={() => setSortField('juicio_evaluacion')}>
                          Resultado <Gavel size={14} style={{ display: 'inline' }} />
                        </th>
                        <th style={styles.tableHeaderCell}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((juicio, index) => (
                        <tr key={index} style={styles.tableRow} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                          <td style={styles.tableCell}>{juicio.fecha_hora_juicio.slice(0, 10)}</td>
                          <td style={styles.tableCell}>{juicio.ficha}</td>
                          <td style={styles.tableCell}>{juicio.nombre_completo}</td>
                          <td style={styles.tableCell}>
                            <div style={{ maxWidth: '300px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              {juicio.competencia}
                            </div>
                          </td>
                          <td style={styles.tableCell}>
                            <div style={{ ...styles.badge, ...(juicio.aprobado ? styles.badgeSuccess : styles.badgeError) }}>
                              {juicio.juicio_evaluacion}
                            </div>
                          </td>
                          <td style={styles.tableCell}>
                            <button
                              onClick={() => openModal(juicio)}
                              style={{ ...styles.buttonPrimary, padding: '8px 16px' }}
                            >
                              <Eye size={16} />
                              <span>Ver</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* Pagination */}
                  <div style={styles.pagination}>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                      style={styles.paginationButton}
                    >
                      Anterior
                    </button>
                    {renderPaginationButtons()}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      style={styles.paginationButton}
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}

              {/* Justo antes del bloque de Results Summary y Results Table, agrega un log para depuración */}
              {console.log('filteredResults:', filteredResults)}
              {console.log('consultaResults:', consultaResults)}

              {filteredResults.length === 0 && consultaResults && (
                <div style={{ color: 'red', marginBottom: '16px' }}>
                  <strong>Depuración:</strong> No se encontraron juicios para mostrar. Revisa la estructura de los datos recibidos.
                </div>
              )}

              {/* Results Summary */}
              {filteredResults.length > 0 && (
                <div style={styles.card}>
                  <div style={{ ...styles.cardHeader, background: 'linear-gradient(90deg, #059669, #047857)' }}>
                    <h3 style={styles.cardHeaderTitle}>
                      <BarChart3 /> Resumen de Resultados
                    </h3>
                  </div>
                  <div style={styles.cardContent}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                      <div style={{ padding: '16px', backgroundColor: '#ECFDF5', borderRadius: '8px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#065F46' }}>{filteredResults.length}</div>
                        <div style={{ fontSize: '14px', color: '#374151' }}>Resultados encontrados</div>
                      </div>
                      <div style={{ padding: '16px', backgroundColor: '#E0F2FE', borderRadius: '8px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1E40AF' }}>
                          {filteredResults.filter(j => j.aprobado === true).length}
                        </div>
                        <div style={{ fontSize: '14px', color: '#374151' }}>Juicios Aprobados</div>
                      </div>
                      <div style={{ padding: '16px', backgroundColor: '#FEF2F2', borderRadius: '8px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#991B1B' }}>
                          {filteredResults.filter(j => j.aprobado === false).length}
                        </div>
                        <div style={{ fontSize: '14px', color: '#374151' }}>Juicios Reprobados</div>
                      </div>
                      <div style={{ padding: '16px', backgroundColor: '#FDE68A', borderRadius: '8px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#92400E' }}>
                          {filteredResults.filter(j => j.aprobado === null).length}
                        </div>
                        <div style={{ fontSize: '14px', color: '#374151' }}>Por Evaluar</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Results Table */}
              {filteredResults.length > 0 && (
                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead style={styles.tableHeader}>
                      <tr>
                        <th style={{ ...styles.tableHeaderCell, cursor: 'pointer' }} onClick={() => setSortField('fecha_hora_juicio')}>
                          Fecha <Clock size={14} style={{ display: 'inline' }} />
                        </th>
                        <th style={{ ...styles.tableHeaderCell, cursor: 'pointer' }} onClick={() => setSortField('ficha')}>
                          Ficha <IdCard size={14} style={{ display: 'inline' }} />
                        </th>
                        <th style={{ ...styles.tableHeaderCell, cursor: 'pointer' }} onClick={() => setSortField('nombre_completo')}>
                          Aprendiz <User size={14} style={{ display: 'inline' }} />
                        </th>
                        <th style={{ ...styles.tableHeaderCell, cursor: 'pointer' }} onClick={() => setSortField('competencia')}>
                          Competencia <List size={14} style={{ display: 'inline' }} />
                        </th>
                        <th style={{ ...styles.tableHeaderCell, cursor: 'pointer' }} onClick={() => setSortField('juicio_evaluacion')}>
                          Resultado <Gavel size={14} style={{ display: 'inline' }} />
                        </th>
                        <th style={styles.tableHeaderCell}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((juicio, index) => (
                        <tr key={index} style={styles.tableRow} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                          <td style={styles.tableCell}>{juicio.fecha_hora_juicio.slice(0, 10)}</td>
                          <td style={styles.tableCell}>{juicio.ficha}</td>
                          <td style={styles.tableCell}>{juicio.nombre_completo}</td>
                          <td style={styles.tableCell}>
                            <div style={{ maxWidth: '300px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              {juicio.competencia}
                            </div>
                          </td>
                          <td style={styles.tableCell}>
                            <div style={{ ...styles.badge, ...(juicio.aprobado ? styles.badgeSuccess : styles.badgeError) }}>
                              {juicio.juicio_evaluacion}
                            </div>
                          </td>
                          <td style={styles.tableCell}>
                            <button
                              onClick={() => openModal(juicio)}
                              style={{ ...styles.buttonPrimary, padding: '8px 16px' }}
                            >
                              <Eye size={16} />
                              <span>Ver</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* Pagination */}
                  <div style={styles.pagination}>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                      style={styles.paginationButton}
                    >
                      Anterior
                    </button>
                    {renderPaginationButtons()}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      style={styles.paginationButton}
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}

              {filteredResults.length === 0 && consultaResults && (
                <div style={{ color: 'red', marginBottom: '16px' }}>
                  <strong>Depuración:</strong> No se encontraron juicios para mostrar. Revisa la estructura de los datos recibidos.
                </div>
              )}
            </div>
          )}

          {/* New Analysis Section */}
          {currentSection === 'analisis' && (
            <div>
              <div style={{ ...styles.pageHeader, background: 'linear-gradient(90deg, #8B5CF6, #6D28D9)' }}>
                <h1 style={styles.pageTitle}>
                  <BarChart /> Análisis de Juicios
                </h1>
                <p style={styles.pageSubtitle}>Visualización y tendencias del desempeño académico</p>
              </div>

              {/* Enhanced Analysis Stats */}
              <div style={styles.statsGrid}>
                <div style={{ ...styles.statCard, borderTopColor: '#10B981' }}>
                  <Percent size={48} style={{ ...styles.statIcon, color: '#10B981' }} />
                  <div style={{ ...styles.statNumber, color: '#10B981' }}>
                    {stats.porcentajeAprobacion}%
                  </div>
                  <div style={styles.statLabel}>Tasa de Aprobación</div>
                  <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                    {stats.porcentajeAprobacion > 80 ? 'Excelente' : 
                     stats.porcentajeAprobacion > 70 ? 'Bueno' : 'Necesita Mejora'}
                  </div>
                </div>
                
                <div style={{ ...styles.statCard, borderTopColor: '#3B82F6' }}>
                  <TrendingUp size={48} style={styles.statIcon} />
                  <div style={{ 
                    ...styles.statNumber,
                    color: stats.tendenciaMes >= 0 ? '#10B981' : '#EF4444'
                  }}>
                    {stats.tendenciaMes >=  0 ? '+' : ''}{stats.tendenciaMes}%
                  </div>
                  <div style={styles.statLabel}>Tendencia del Mes</div>
                  <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                    Cambio comparado con el mes anterior
                  </div>
                </div>

                <div style={{ ...styles.statCard, borderTopColor: '#F59E0B' }}>
                  <Award size={48} style={{ ...styles.statIcon, color: '#F59E0B' }} />
                  <div style={styles.statNumber}>
                    {stats.mejorPrograma}
                  </div>
                  <div style={styles.statLabel}>Mejor Programa</div>
                  <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                    Mayor porcentaje de aprobación
                  </div>
                </div>
                
                <div style={{ ...styles.statCard, borderTopColor: '#EF4444' }}>
                  <AlertTriangle size={48} style={{ ...styles.statIcon, color: '#EF4444' }} />
                  <div style={{ ...styles.statNumber, color: '#EF4444' }}>
                    {stats.enRiesgo}
                  </div>
                  <div style={styles.statLabel}>Programas en Riesgo</div>
                  <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                    Baja tasa de aprobación
                  </div>
                </div>
              </div>

              <div style={{...styles.card}}>
                <div style={{ ...styles.cardHeader, background: 'linear-gradient(90deg, #F59E0B, #D97706)' }}>
                  <h3 style={styles.cardHeaderTitle}>
                    <PieChart /> Distribución de Resultados
                  </h3>
                </div>
                <div style={styles.cardContent}>
                  <p style={{ color: '#6B7280', marginBottom: '16px' }}>
                    Análisis de la cantidad de juicios aprobados y reprobados.
                  </p>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={[
                          { name: 'Aprobados', value: stats.aprobados, fill: '#10B981' },
                          { name: 'Reprobados', value: stats.reprobados, fill: '#EF4444' }
                        ]}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      />
                      <Tooltip formatter={(value) => `${value.toLocaleString()} juicios`} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Other analysis cards can be added here */}
            </div>
          )}

          {/* New Management Section */}
          {currentSection === 'gestion' && (
            <div>
              <div style={{ ...styles.pageHeader, background: 'linear-gradient(90deg, #F97316, #EA580C)' }}>
                <h1 style={styles.pageTitle}>
                  <UsersRound /> Gestión de Fichas
                </h1>
                <p style={styles.pageSubtitle}>Administración y seguimiento de fichas de formación</p>
              </div>

              {/* Management Filters */}
              <div style={styles.card}>
                <div style={{ ...styles.cardHeader, background: 'linear-gradient(90deg, #1E40AF, #1E3A8A)' }}>
                  <h3 style={styles.cardHeaderTitle}>
                    <Filter /> Filtros de Gestión
                  </h3>
                </div>
                <div style={styles.cardContent}>
                  <div style={styles.formGrid}>
                    <div style={styles.inputGroup}>
                      <label style={styles.inputLabel}><Search size={16} /> Buscar Ficha</label>
                      <input type="text" placeholder="Número de ficha o programa" style={styles.input} />
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.inputLabel}><Clock size={16} /> Estado</label>
                      <select style={styles.select}>
                        <option>Todos</option>
                        <option>Activa</option>
                        <option>Terminada</option>
                        <option>Suspendida</option>
                      </select>
                    </div>
                  </div>
                  <div style={styles.buttonGroup}>
                    <button style={styles.buttonPrimary}>
                      <Search size={16} /> <span>Buscar</span>
                    </button>
                    <button style={styles.buttonSecondary}>
                      <Trash2 size={16} /> <span>Limpiar</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Fichas Table */}
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead style={styles.tableHeader}>
                    <tr>
                      <th style={styles.tableHeaderCell}>Número de Ficha</th>
                      <th style={styles.tableHeaderCell}>Programa</th>
                      <th style={styles.tableHeaderCell}>Centro</th>
                      <th style={styles.tableHeaderCell}>Estado</th>
                      <th style={styles.tableHeaderCell}>Aprendices</th>
                      <th style={styles.tableHeaderCell}>Fecha Inicio</th>
                      <th style={styles.tableHeaderCell}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fichasManagement.map((ficha) => (
                      <tr key={ficha.id} style={styles.tableRow} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                        <td style={styles.tableCell}>{ficha.numero}</td>
                        <td style={styles.tableCell}>{ficha.programa}</td>
                        <td style={styles.tableCell}>{ficha.centro}</td>
                        <td style={styles.tableCell}>
                          <div style={{
                            ...styles.badge,
                            ...(ficha.estado === 'Activa' ? styles.badgeSuccess : ficha.estado === 'Terminada' ? styles.badgeInfo : styles.badgeError)
                          }}>
                            {ficha.estado}
                          </div>
                        </td>
                        <td style={styles.tableCell}>{ficha.aprendices}</td>
                        <td style={styles.tableCell}>{ficha.fechaInicio}</td>
                        <td style={styles.tableCell}>
                          <button style={{ ...styles.buttonPrimary, padding: '8px 16px', marginRight: '8px' }}>
                            <Edit size={16} />
                            <span>Editar</span>
                          </button>
                          <button style={{ ...styles.buttonDanger, padding: '8px 16px' }}>
                            <Trash2 size={16} />
                            <span>Eliminar</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {fichasManagement.length === 0 && (
                  <div style={styles.emptyState}>
                    <Database size={64} style={styles.emptyIcon} />
                    <h3 style={styles.emptyTitle}>Cargando datos...</h3>
                    <p style={styles.emptyText}>Por favor, espera mientras se cargan las fichas.</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Reports Section */}
          {currentSection === 'reportes' && (
            <div>
              <div style={{ ...styles.pageHeader, background: 'linear-gradient(90deg, #10B981, #059669)' }}>
                <h1 style={styles.pageTitle}>
                  <FileText /> Generador de Reportes
                </h1>
                <p style={styles.pageSubtitle}>Crea, gestiona y descarga reportes detallados</p>
              </div>

              {/* Tab Navigation */}
              <div style={styles.tabContainer}>
                <div style={styles.tabList}>
                  <button
                    onClick={() => setActiveTab('overview')}
                    style={{ ...styles.tab, ...(activeTab === 'overview' ? styles.tabActive : {}) }}
                  >
                    <Download size={16} />
                    Generar Nuevo
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    style={{ ...styles.tab, ...(activeTab === 'history' ? styles.tabActive : {}) }}
                  >
                    <History size={16} />
                    Historial
                  </button>
                </div>
              </div>

              {/* New Report Tab */}
              {activeTab === 'overview' && (
                <div style={styles.card}>
                  <div style={{ ...styles.cardHeader, background: 'linear-gradient(90deg, #10B981, #059669)' }}>
                    <h3 style={styles.cardHeaderTitle}>
                      <FileText /> Configuración del Reporte
                    </h3>
                  </div>
                  <div style={styles.cardContent}>
                    <div style={styles.formGrid}>
                      <div style={styles.inputGroup}>
                        <label style={styles.inputLabel}>
                          <Calendar size={16} /> Fecha de Inicio
                        </label>
                        <input
                          type="date"
                          value={reportConfig.fechaInicio}
                          onChange={(e) => setReportConfig({ ...reportConfig, fechaInicio: e.target.value })}
                          style={styles.input}
                        />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.inputLabel}>
                          <Calendar size={16} /> Fecha de Fin
                        </label>
                        <input
                          type="date"
                          value={reportConfig.fechaFin}
                          onChange={(e) => setReportConfig({ ...reportConfig, fechaFin: e.target.value })}
                          style={styles.input}
                        />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.inputLabel}>
                          <Save size={16} /> Formato
                        </label>
                        <select
                          value={reportConfig.formato}
                          onChange={(e) => setReportConfig({ ...reportConfig, formato: e.target.value })}
                          style={styles.select}
                        >
                          <option value="excel">Excel (.xlsx)</option>
                          <option value="csv">CSV (.csv)</option>
                          <option value="pdf">PDF (.pdf)</option>
                        </select>
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.inputLabel}>
                          <List size={16} /> Tipo de Reporte
                        </label>
                        <select
                          value={reportConfig.tipo}
                          onChange={(e) => setReportConfig({ ...reportConfig, tipo: e.target.value })}
                          style={styles.select}
                        >
                          <option value="completo">Completo (todos los juicios)</option>
                          <option value="resumen">Resumen estadístico</option>
                          <option value="programas">Por programa de formación</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={reportConfig.incluirGraficos}
                          onChange={(e) => setReportConfig({ ...reportConfig, incluirGraficos: e.target.checked })}
                        />
                        <PieChart size={16} /> Incluir gráficos de análisis
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={reportConfig.incluirResumen}
                          onChange={(e) => setReportConfig({ ...reportConfig, incluirResumen: e.target.checked })}
                        />
                        <BarChart3 size={16} /> Incluir resumen ejecutivo
                      </label>
                    </div>
                    <div style={styles.buttonGroup}>
                      <button
                        onClick={generarReporte}
                        style={{ ...styles.buttonPrimary, backgroundColor: '#10B981' }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#10B981'}
                      >
                        <Download size={16} />
                        <span>Generar Reporte</span>
                      </button>
                      <button
                        onClick={() => showMessage('Vista previa en desarrollo', 'info')}
                        style={{ ...styles.buttonPrimary, backgroundColor: '#3B82F6' }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#2563EB'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#3B82F6'}
                      >
                        <Eye size={16} />
                        <span>Vista Previa</span>
                      </button>
                      <button
                        onClick={() => { setReportConfig({ fechaInicio: '', fechaFin: '', formato: 'excel', tipo: 'completo', incluirGraficos: true, incluirResumen: true }); }}
                        style={styles.buttonSecondary}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#4B5563'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#6B7280'}
                      >
                        <RotateCcw size={16} />
                        <span>Resetear</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Report History Tab */}
              {activeTab === 'history' && (
                <div style={styles.card}>
                  <div style={{ ...styles.cardHeader, background: 'linear-gradient(90deg, #6B7280, #4B5563)' }}>
                    <h3 style={styles.cardHeaderTitle}>
                      <History /> Historial de Reportes Generados
                    </h3>
                  </div>
                  <div style={styles.cardContent}>
                    {reportHistory.length > 0 ? (
                      <div style={styles.tableContainer}>
                        <table style={styles.table}>
                          <thead style={styles.tableHeader}>
                            <tr>
                              <th style={styles.tableHeaderCell}>Archivo</th>
                              <th style={styles.tableHeaderCell}>Fecha de Generación</th>
                              <th style={styles.tableHeaderCell}>Formato</th>
                              <th style={styles.tableHeaderCell}>Estado</th>
                              <th style={styles.tableHeaderCell}>Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportHistory.map(report => (
                              <tr key={report.id} style={styles.tableRow} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                                <td style={styles.tableCell}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FileText size={16} />
                                    <span>{report.filename}</span>
                                  </div>
                                </td>
                                <td style={styles.tableCell}>{report.fecha}</td>
                                <td style={styles.tableCell}>{report.formato.toUpperCase()}</td>
                                <td style={styles.tableCell}>
                                  <div style={{ ...styles.badge, ...styles.badgeSuccess }}>
                                    <BadgeCheck size={12} />
                                    <span>{report.estado}</span>
                                  </div>
                                </td>
                                <td style={styles.tableCell}>
                                  <button style={{ ...styles.buttonPrimary, padding: '8px 16px', marginRight: '8px' }}>
                                    <Download size={16} />
                                    <span>Descargar</span>
                                  </button>
                                  <button style={{ ...styles.buttonSecondary, padding: '8px 16px' }}>
                                    <Info size={16} />
                                    <span>Detalles</span>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div style={styles.emptyState}>
                        <Archive size={64} style={styles.emptyIcon} />
                        <h3 style={styles.emptyTitle}>No hay reportes en el historial</h3>
                        <p style={styles.emptyText}>Genera un nuevo reporte para que aparezca aquí.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Configuration Section */}
          {currentSection === 'configuracion' && (
            <div>
              <div style={{ ...styles.pageHeader, background: 'linear-gradient(90deg, #6B7280, #4B5563)' }}>
                <h1 style={styles.pageTitle}>
                  <Cog /> Configuración del Sistema
                </h1>
                <p style={styles.pageSubtitle}>Personaliza la apariencia y el comportamiento de la aplicación</p>
              </div>
              <div style={styles.card}>
                <div style={{ ...styles.cardHeader, background: 'linear-gradient(90deg, #3B82F6, #1D4ED8)' }}>
                  <h3 style={styles.cardHeaderTitle}>
                    <Settings /> Opciones Generales
                  </h3>
                </div>
                <div style={styles.cardContent}>
                  <div style={styles.formGrid}>
                    <div style={styles.inputGroup}>
                      <label style={styles.inputLabel}><Palette size={16} /> Tema de la Interfaz</label>
                      <select value={userConfig.tema} onChange={(e) => setUserConfig(prev => ({ ...prev, tema: e.target.value }))} style={styles.select}>
                        <option value="claro">Claro</option>
                        <option value="oscuro">Oscuro (próximamente)</option>
                      </select>
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.inputLabel}><Languages size={16} /> Idioma</label>
                      <select value={userConfig.idioma} onChange={(e) => setUserConfig(prev => ({ ...prev, idioma: e.target.value }))} style={styles.select}>
                        <option value="es">Español</option>
                        <option value="en">Inglés (próximamente)</option>
                      </select>
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.inputLabel}><List size={16} /> Registros por Página</label>
                      <select value={userConfig.registrosPorPagina} onChange={(e) => {
                        setUserConfig(prev => ({ ...prev, registrosPorPagina: e.target.value }));
                        setItemsPerPage(parseInt(e.target.value));
                      }} style={styles.select}>
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input type="checkbox" checked={userConfig.notificaciones} onChange={(e) => setUserConfig(prev => ({ ...prev, notificaciones: e.target.checked }))} />
                      <Bell size={20} style={{ color: '#F97316' }} />
                      <span style={{ fontWeight: '500', color: '#374151' }}>Habilitar notificaciones del sistema</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input type="checkbox" checked={userConfig.autoRefresh} onChange={(e) => setUserConfig(prev => ({ ...prev, autoRefresh: e.target.checked }))} />
                      <RefreshCw size={20} style={{ color: '#3B82F6' }} />
                      <span style={{ fontWeight: '500', color: '#374151' }}>Actualización automática de datos</span>
                    </label>
                  </div>
                  <div style={{ ...styles.buttonGroup, marginTop: '24px' }}>
                    <button style={styles.buttonSuccess} onClick={() => showMessage('Configuración guardada', 'success')}>
                      <Save size={16} /> <span>Guardar Cambios</span>
                    </button>
                    <button style={styles.buttonSecondary}>
                      <Undo size={16} /> <span>Restaurar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal for details */}
      {modalOpen && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Detalles del Juicio</h3>
            </div>
            <div style={styles.modalBody}>
              {modalContent && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: '#374151' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <UserCircle size={24} style={{ color: '#3B82F6' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold' }}>Aprendiz</div>
                      <div>{modalContent.nombre_completo} ({modalContent.numero_documento})</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <BadgeCheck size={24} style={{ color: '#10B981' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold' }}>Competencia</div>
                      <div>{modalContent.competencia}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Award size={24} style={{ color: '#F59E0B' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold' }}>Resultado de Aprendizaje</div>
                      <div>{modalContent.resultado_aprendizaje}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Gavel size={24} style={{ color: '#EF4444' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold' }}>Juicio de Evaluación</div>
                      <div>
                        <span style={{ ...styles.badge, ...(modalContent.aprobado ? styles.badgeSuccess : styles.badgeError) }}>
                          {modalContent.juicio_evaluacion}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <CalendarIcon size={24} style={{ color: '#6B7280' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold' }}>Fecha y Hora</div>
                      <div>{modalContent.fecha_hora_juicio}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Presentation size={24} style={{ color: '#4F46E5' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold' }}>Instructor</div>
                      <div>{modalContent.funcionario_registro}</div>
                    </div>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button
                  onClick={closeModal}
                  style={styles.buttonSecondary}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#4B5563'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#6B7280'}
                >
                  <XCircle size={16} /> <span>Cerrar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JuiciosPage;