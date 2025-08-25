import React from "react";
import { Settings } from "lucide-react";

// ==============================
// Componente ConfiguracionPage
// ==============================
function ConfiguracionPage() {
  return (
    <div style={styles.app}>
      <Navbar />
      <div style={styles.mainContent}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>
              <Settings size={24} />
              Configuración del Sistema
            </h2>
            <p style={styles.cardSubtitle}>
              Ajusta los parámetros y configuraciones del sistema
            </p>
          </div>
          
          <div style={{ padding: '24px' }}>
            <div style={{
              backgroundColor: '#F0F9FF',
              border: '2px dashed #3B82F6',
              borderRadius: '12px',
              padding: '40px',
              textAlign: 'center',
            }}>
              <Settings size={48} color="#3B82F6" style={{ marginBottom: '16px' }} />
              <h3 style={{ color: '#1E293B', marginBottom: '8px' }}>
                Configuraciones Avanzadas
              </h3>
              <p style={{ color: '#64748B', marginBottom: '24px' }}>
                Panel de configuración en desarrollo
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ConfiguracionPage;