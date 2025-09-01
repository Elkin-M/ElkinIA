import React from "react";
import { Link } from "react-router-dom";
import { styles } from './styles.js';


// ==============================
// Componente Footer
// ==============================
function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.footerContent}>
        <div style={styles.footerSection}>
          <h4 style={styles.footerTitle}>SENA Dashboard</h4>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: '1.5' }}>
            Sistema automatizado para la gestión y descarga de juicios evaluativos 
            del SENA Sofia Plus.
          </p>
        </div>
        
        <div style={styles.footerSection}>
          <h4 style={styles.footerTitle}>Enlaces Rápidos</h4>
          <Link to="/" style={styles.footerLink}>Dashboard</Link>
          <Link to="/juicios" style={styles.footerLink}>Juicios</Link>
          <Link to="/configuracion" style={styles.footerLink}>Configuración</Link>
        </div>
        
        <div style={styles.footerSection}>
          <h4 style={styles.footerTitle}>Recursos</h4>
          <a href="#" style={styles.footerLink}>Documentación</a>
          <a href="#" style={styles.footerLink}>API Reference</a>
          <a href="#" style={styles.footerLink}>Soporte Técnico</a>
        </div>
        
        <div style={styles.footerSection}>
          <h4 style={styles.footerTitle}>Contacto</h4>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', margin: '0 0 8px 0' }}>
            📧 soporte@sena.edu.co
          </p>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', margin: '0 0 8px 0' }}>
            📞 +57 (1) 546 1500
          </p>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', margin: 0 }}>
            📍 Cartagena, Bolívar
          </p>
        </div>
      </div>
      
      <div style={styles.footerBottom}>
        <p>© 2024 SENA - Servicio Nacional de Aprendizaje. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}

export default Footer;