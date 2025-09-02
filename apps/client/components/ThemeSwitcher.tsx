import React, { useState, useEffect } from 'react';

const themes = ['light', 'dark', 'desert', 'ocean', 'corporate'];

const ThemeSwitcher: React.FC = () => {
  const [activeTheme, setActiveTheme] = useState('light');

  useEffect(() => {
    document.body.className = activeTheme;
  }, [activeTheme]);

  return (
    <div className="theme-switcher">
      <label htmlFor="theme-select" className="theme-label">
        Select Theme
      </label>
      <select
        id="theme-select"
        value={activeTheme}
        onChange={(e) => setActiveTheme(e.target.value)}
        className="theme-select"
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
