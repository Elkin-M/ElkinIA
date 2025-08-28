import React from 'react';
import { colors } from './styles.js';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = React.useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form className="flex w-full max-w-lg" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Buscar..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-grow p-3 rounded-l-lg focus:outline-none"
      />
      <button
        type="submit"
        className="p-3 rounded-r-lg"
        style={{ backgroundColor: colors.lightGreen, color: colors.white }}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </button>
    </form>
  );
};

export default SearchBar;