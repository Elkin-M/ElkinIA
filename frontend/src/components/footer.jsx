import React from 'react';
import { colors } from './styles.js';

const Footer = () => {
  return (
    <footer
      className="bg-gray-900 text-center py-4"
      style={{ backgroundColor: '#1A202C', color: colors.white }}
    >
      <p>&copy; 2025 Betowa. Todos los derechos reservados.</p>
    </footer>
  );
};

export default Footer;