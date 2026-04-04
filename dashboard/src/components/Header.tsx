/**
 * Header component — brand title, market selector, and theme toggle.
 */

import { useCallback, useState } from 'react';
import { useMarket } from '../hooks/useMarket';

export default function Header() {
  const { selectedMarket, markets, setMarket } = useMarket();
  const [lightTheme, setLightTheme] = useState(false);

  const handleThemeToggle = useCallback(() => {
    setLightTheme((prev) => {
      const next = !prev;
      document.body.classList.toggle('light-theme', next);
      return next;
    });
  }, []);

  const handleMarketChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setMarket(e.target.value);
    },
    [setMarket],
  );

  return (
    <header id="app-header">
      <div className="header-brand">
        <h1>Projectr Analytics</h1>
        <span className="header-subtitle">Real Estate Intelligence</span>
      </div>
      <div className="header-controls">
        <select
          id="market-selector"
          value={selectedMarket}
          onChange={handleMarketChange}
        >
          {markets.length > 0 ? (
            markets.map((m) => (
              <option key={m.code} value={m.code}>
                {m.name}, {m.state}
              </option>
            ))
          ) : (
            <option value="austin">Austin–Round Rock, TX</option>
          )}
        </select>
        <button
          id="theme-toggle"
          aria-label="Toggle theme"
          onClick={handleThemeToggle}
        >
          {lightTheme ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
}
