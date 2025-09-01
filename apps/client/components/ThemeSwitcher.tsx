import React, { useState, useEffect } from 'react';

const themes = ['light', 'dark', 'desert', 'ocean', 'forest', 'dracula', 'matrix', 'corporate'];

const ThemeSwitcher: React.FC = () => {
  const [activeTheme, setActiveTheme] = useState('light');

  useEffect(() => {
    document.body.className = activeTheme;
  }, [activeTheme]);

  return (
    <div className="p-4">
      <label htmlFor="theme-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Select Theme
      </label>
      <select
        id="theme-select"
        value={activeTheme}
        onChange={(e) => setActiveTheme(e.target.value)}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
      >
        {themes.map((theme) => (
          <option key={theme} value={theme}>
            {theme.charAt(0).toUpperCase() + theme.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ThemeSwitcher;
