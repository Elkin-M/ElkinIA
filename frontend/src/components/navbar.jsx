import React from 'react';
import { colors } from './styles.js';

const Navbar = () => {
  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <span className="font-bold text-xl">Betowa</span>
        <a href="#" className="hover:text-gray-300">Inicio</a>
        <a href="#" className="hover:text-gray-300">Pruebas</a>
      </div>
      <div className="flex items-center space-x-4">
        <a
          href="#"
          className="px-4 py-2 rounded-lg font-bold"
          style={{ backgroundColor: colors.lightGreen, color: colors.white }}
        >
          Ingresar
        </a>
        <a
          href="#"
          className="px-4 py-2 rounded-lg font-bold"
          style={{ backgroundColor: colors.buttonPurple, color: colors.white }}
        >
          Registrarse
        </a>
      </div>
    </nav>
  );
};

export default Navbar;