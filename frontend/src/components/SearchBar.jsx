import React, { useState } from "react";
import { Search } from "lucide-react";
import { styles } from './styles.js';

// Usa los estilos como: style={styles.searchContainer}
// ==============================
// Componente SearchBar mejorado
// ==============================
function SearchBar({ query, setQuery, resultCount }) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div style={styles.card}>
      <div style={styles.searchContainer}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={styles.searchInputContainer}>
            <Search size={20} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar por número de ficha, nombre del programa, centro..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              style={{
                ...styles.searchInput,
                ...(isFocused ? styles.inputFocus : {}),
              }}
            />
          </div>
          {query && (
            <button
              onClick={() => setQuery("")}
              style={{
                background: 'none',
                border: 'none',
                padding: '8px 16px',
                color: '#6B7280',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#1F2937';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#6B7280';
              }}
            >
              Limpiar
            </button>
          )}
        </div>
        {query && (
          <p style={{
            fontSize: '14px',
            color: '#6B7280',
            marginTop: '8px',
            margin: '8px 0 0 0',
          }}>
            {resultCount} resultado{resultCount !== 1 ? 's' : ''} para "{query}"
          </p>
        )}
      </div>
    </div>
  );
}
export default SearchBar;