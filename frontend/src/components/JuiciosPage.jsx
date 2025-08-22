// src/components/JuiciosPage.jsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { styles } from './styles.js';

export default function JuiciosPage() {
  const { numeroFicha } = useParams();

  return (
    <div style={styles.container}>
      <div style={styles.mainContainer}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1 style={{ color: '#1F2937' }}>
            Juicios de la Ficha: {numeroFicha}
          </h1>
          <p style={{ color: '#6B7280', marginTop: '1rem' }}>
            Aquí se mostrarán los detalles de los juicios para esta ficha.
          </p>
          <Link to="/" style={{
            ...styles.button,
            marginTop: '24px',
            backgroundColor: '#6B7280'
          }}>
            Volver a la página principal
          </Link>
        </div>
      </div>
    </div>
  );
}