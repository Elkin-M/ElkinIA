import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Filter, Download, MapPin, Calendar, Building, Users, Play, Home, FileText, Settings, Menu, X, Eye } from "lucide-react";

// ==============================
// Estilos mejorados
// ==============================

export const styles = {
  // Layout principal
  app: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    backgroundColor: '#F8FAFC',
  },
  
  // Navbar
  navbar: {
    backgroundColor: 'white',
    borderBottom: '1px solid #E2E8F0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
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
    color: '#1E293B',
  },
  logoIcon: {
    width: '40px',
    height: '40px',
    backgroundColor: '#3B82F6',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
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
    color: '#64748B',
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    transition: 'all 0.2s ease',
    fontWeight: '500',
  },
  navLinkActive: {
    color: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  
  // Banner hero
  heroBanner: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
    backgroundColor: 'white',
  },
  actionCardSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#F8FAFF',
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
    color: '#1E293B',
    margin: '0 0 4px 0',
  },
  actionDescription: {
    fontSize: '0.875rem',
    color: '#64748B',
    margin: 0,
    lineHeight: '1.4',
  },
  
  // Inputs mejorados
  filtersGrid: {
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
    heroTitle: {
      fontSize: '2.5rem',
    },
    actionGrid: {
      gridTemplateColumns: '1fr',
    },
    filtersGrid: {
      gridTemplateColumns: '1fr',
    },
  },
};


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