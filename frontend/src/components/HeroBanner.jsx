// src/components/HeroBanner.jsx
import React from "react";
import { styles } from "./styles.js";
import "./HeroBanner.css"; // Importa los estilos CSS

const HeroBanner = ({ stats = {} }) => {
  return (
    <div style={styles.heroBanner} className="heroBannerPattern">
      <div style={styles.heroContent}>
        <h1 style={styles.heroTitle}>🎯 SENA Sofia Plus</h1>
        <p style={styles.heroSubtitle}>
          Sistema automatizado para mapeo y descarga de juicios de evaluación
        </p>

        <div style={styles.heroStats}>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{stats.total || "0"}</div>
            <div style={styles.statLabel}>Total Fichas</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{stats.descargadas || "0"}</div>
            <div style={styles.statLabel}>Descargadas</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{stats.pendientes || "0"}</div>
            <div style={styles.statLabel}>Pendientes</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{stats.fallidas || "0"}</div>
            <div style={styles.statLabel}>Fallidas</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
