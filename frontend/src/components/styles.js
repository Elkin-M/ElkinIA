import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Filter, Download, MapPin, Calendar, Building, Users, Play, Home, FileText, Settings, Menu, X, Eye } from "lucide-react";

// ==============================
// Estilos mejorados
// ==============================

export const styles = {
  // Layout principal
app: {
  display: 'flex',
  flexDirection: 'column',
  fontFamily: '"Trebuchet MS", sans-serif',
  backgroundColor: '#F8FAFC',
},

  
navbar: {
    background: `linear-gradient(to right, #9333EA, #2563EB, #0891B2)`, // degradado violeta → azul → turquesa
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
  },

  navContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '64px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '20px',
    fontWeight: '700',
    color: '#FFFFFF',
    textDecoration: 'none',
  },
  logoIcon: {
    width: '40px',
    height: '40px',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFF',
  },
  navLinks: {
    display: 'flex',
    gap: '32px',
    alignItems: 'center',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#FFFFFF',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'opacity 0.2s ease',
    opacity: 0.85,
  },
  navLinkActive: {
    textDecoration: 'underline',
    textUnderlineOffset: '6px',
    opacity: 1,
  },

  // Botones extra de navbar
  navButtons: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  buttonLogin: {
    backgroundColor: '#FFFFFF',
    color: '#15803D', // verde
    padding: '8px 16px',
    borderRadius: '6px',
    fontWeight: '600',
    border: '1px solid #15803D',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
  },
  buttonLoginHover: {
    backgroundColor: '#F0FDF4',
  },
  buttonRegister: {
    backgroundColor: '#7C3AED', // púrpura
    color: '#FFFFFF',
    padding: '8px 16px',
    borderRadius: '6px',
    fontWeight: '600',
    textDecoration: 'none',
    transition: 'background 0.2s ease',
  },
  buttonRegisterHover: {
    backgroundColor: '#6D28D9',
  },
  
  // Banner hero
  heroBanner: {
    backgroundImage: `url('/bg-betowa.webp')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: 'white',
    padding: '60px 24px',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  },


  heroContent: {
    maxWidth: '800px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 2,
  },
  heroTitle: {
    fontSize: '3.5rem',
    fontWeight: '800',
    marginBottom: '16px',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  heroSubtitle: {
    fontSize: '1.25rem',
    opacity: '0.9',
    marginBottom: '32px',
    fontWeight: '400',
  },
  heroStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '32px',
    marginTop: '48px',
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  statNumber: {
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '8px',
  },
  statLabel: {
    fontSize: '0.9rem',
    opacity: '0.8',
  },
  
  // Contenido principal
  mainContent: {
    flex: 1,
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 24px',
    width: '100%',
  },
  
  // Cards
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #E2E8F0',
    overflow: 'hidden',
    marginBottom: '24px',
  },
  cardHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 24px 0',
    borderBottom: '1px solid #E2E8F0',
    paddingBottom: '16px',
    marginBottom: '24px',
  },
  cardTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  cardSubtitle: {
    color: '#64748B',
    fontSize: '0.95rem',
  },
  
  // Formulario mejorado
  formContainer: {
    padding: '24px',
  },
  sectionTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  actionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
    marginBottom: '32px',
  },
  actionCard: {
    border: '2px solid #E2E8F0',
    borderRadius: '12px',
    padding: '20px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative',
    backgroundColor: 'purple',
    backgroundImage: 'url(/patteners.webp)',
  },
  actionCardSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#4975e5ff',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
  },
  actionCardContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  actionIcon: {
    width: '48px',
    height: '48px',
    backgroundColor: '#F1F5F9',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  actionIconSelected: {
    backgroundColor: '#EFF6FF',
    color: '#3B82F6',
  },
  actionTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#ffffffff',
    margin: '0 0 4px 0',
  },
  actionDescription: {
    fontSize: '0.875rem',
    color: '#ffffffff',
    margin: 0,
    lineHeight: '1.4',
  },
  
  // Inputs mejorados
  filtersGrid: {
    color: '#393636ff',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  input: {
    padding: '12px 16px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '0.95rem',
    transition: 'all 0.2s ease',
    backgroundColor: 'white',
  },
  inputFocus: {
    borderColor: '#3B82F6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
    outline: 'none',
  },
  
  // Botón principal
  primaryButton: {
    backgroundColor: '#3B82F6',
    color: 'white',
    border: 'none',
    padding: '16px 32px',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '0 auto',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
  },
  
  // Tabla mejorada
  tableContainer: {
    overflowX: 'auto',
    backgroundColor: 'white',
    borderRadius: '12px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.9rem',
  },
  tableHeader: {
    backgroundColor: '#F8FAFC',
    borderBottom: '1px solid #E2E8F0',
  },
  tableHeaderCell: {
    padding: '16px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#374151',
    fontSize: '0.875rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tableRow: {
    borderBottom: '1px solid #E2E8F0',
    transition: 'background-color 0.2s ease',
  },
  tableRowHover: {
    backgroundColor: '#F8FAFC',
  },
  tableCell: {
    padding: '16px',
    color: '#1F2937',
  },
  
  // Badges y estados
  badge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '500',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  badgeSuccess: {
    backgroundColor: '#DCFCE7',
    color: '#166534',
  },
  badgeWarning: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
  },
  badgePending: {
    backgroundColor: '#DBEAFE',
    color: '#1E40AF',
  },
  
  // Botones de acción
  actionButton: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: 'white',
  },
  
  // Footer
  footer: {
    backgroundColor: '#1E293B',
    color: 'white',
    padding: '48px 24px 24px',
    marginTop: 'auto',
  },
  footerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '32px',
  },
  footerSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  footerTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '8px',
  },
  footerLink: {
    color: '#94A3B8',
    textDecoration: 'none',
    fontSize: '0.9rem',
    transition: 'color 0.2s ease',
  },
  footerBottom: {
    borderTop: '1px solid #334155',
    marginTop: '32px',
    paddingTop: '24px',
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: '0.875rem',
  },
  
  // Responsive
  '@media (max-width: 768px)': {
    // Navbar
    navLinks: {
      display: 'none', // Oculta los links de navegación en móviles
    },
    navButtons: {
      display: 'none', // Oculta los botones de la navbar en móviles
    },
    navContainer: {
      height: '56px',
    },
    logo: {
      fontSize: '18px',
    },
    
    // Hero Banner
    heroBanner: {
      padding: '40px 16px',
    },
    heroTitle: {
      fontSize: '2.5rem',
    },
    heroSubtitle: {
      fontSize: '1rem',
    },
    heroStats: {
      gridTemplateColumns: '1fr', // Las tarjetas de estadísticas se apilan en móviles
      gap: '24px',
    },
    statCard: {
      padding: '20px',
    },
    statNumber: {
      fontSize: '2rem',
    },
    
    // Contenido principal
    mainContent: {
      padding: '24px 16px',
    },
    
    // Formularios y filtros
    actionGrid: {
      gridTemplateColumns: '1fr', // Las tarjetas de acción se apilan
    },
    filtersGrid: {
      gridTemplateColumns: '1fr', // Los campos de filtro se apilan
    },

    // Tabla
    tableHeaderCell: {
      fontSize: '0.75rem', // Reduce el tamaño de la fuente para las celdas del encabezado
    },
    tableCell: {
      padding: '12px 10px', // Reduce el padding para las celdas
    },
  },
};

const colors = {
  // Gradiente de fondo (se seleccionó el segundo color de cada opción)
  purple: '#9333EA',
  blue: '#2563EB',
  turquoise: '#0891B2',
  
  // Colores principales
  green: '#15803D',
  white: '#FFFFFF',
  
  // Elementos de la interfaz
  lightGreen: '#059669', // Botón "Ingresar"
  buttonPurple: '#7C3AED', // Botón "Registrarse"
  
  // Elementos decorativos
  orange: '#EA580C',
  gold: '#D97706',
};

// Se crea una cadena de gradiente lineal para un uso más sencillo
const backgroundGradient = `linear-gradient(to right, ${colors.purple}, ${colors.blue}, ${colors.turquoise})`;

export { colors, backgroundGradient };

// Animación de spinner
export const spinnerKeyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Función para inyectar las animaciones CSS
export const injectStyles = () => {
  if (typeof document !== 'undefined') {
    const styleElement = document.createElement('style');
    styleElement.textContent = spinnerKeyframes;
    document.head.appendChild(styleElement);
  }
};