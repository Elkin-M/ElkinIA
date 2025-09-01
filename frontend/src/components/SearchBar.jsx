import React, { useState } from "react";
import { Search } from "lucide-react";
import { styles } from './styles.js';

// ==============================
// Componente SearchBar mejorado
// ==============================
function SearchBar({ query, setQuery, resultCount, totalCount }) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div style={styles.card}>
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
          <div style={{
            position: 'relative',
            flex: 1,
            display: 'flex',
            alignItems: 'center',
          }}>
            <Search size={20} style={{
              position: 'absolute',
              left: '16px',
              color: '#6B7280',
              zIndex: 1,
            }} />
            <input
              type="text"
              placeholder="Buscar por número de ficha, nombre del programa, centro..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              style={{
                ...styles.input,
                paddingLeft: '48px',
                width: '100%',
                ...(isFocused ? styles.inputFocus : {}),
              }}
            />
          </div>
          {query && (
            <button
              onClick={() => setQuery("")}
              style={{
                background: '#EF4444',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'background-color 0.2s ease',
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
            margin: 0,
          }}>
            {resultCount} de {totalCount} resultado{resultCount !== 1 ? 's' : ''} para "{query}"
          </p>
        )}
      </div>
    </div>
  );
}

export default SearchBar;