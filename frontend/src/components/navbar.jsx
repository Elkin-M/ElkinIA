import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Building, Home, FileText, Settings } from "lucide-react";
import { styles } from './styles.js';

// ==============================
// Componente Navbar
// ==============================
function Navbar() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const isActive = (path) => location.pathname === path;
  
  return (
    <nav style={styles.navbar}>
      <div style={styles.navContainer}>
        <Link to="/" style={styles.logo}>
          <div style={styles.logoIcon}>
            <Building size={24} />
          </div>
          <span>SENA Dashboard</span>
        </Link>
        
        <div style={styles.navLinks}>
          <Link 
            to="/" 
            style={{
              ...styles.navLink,
              ...(isActive('/') ? styles.navLinkActive : {})
            }}
          >
            <Home size={18} />
            Dashboard
          </Link>
          <Link 
            to="/juicios" 
            style={{
              ...styles.navLink,
              ...(isActive('/juicios') ? styles.navLinkActive : {})
            }}
          >
            <FileText size={18} />
            Juicios
          </Link>
          <Link 
            to="/configuracion" 
            style={{
              ...styles.navLink,
              ...(isActive('/configuracion') ? styles.navLinkActive : {})
            }}
          >
            <Settings size={18} />
            Configuración
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;