/**
 * Header component — brand title, nav links, market selector, auth, and theme toggle.
 */

import { useCallback, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useMarket } from '../hooks/useMarket';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';
import UserMenu from './UserMenu';

export default function Header() {
  const { selectedMarket, markets, setMarket } = useMarket();
  const { isAuthenticated } = useAuth();
  const [lightTheme, setLightTheme] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const location = useLocation();

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
    <>
      <header id="app-header">
        <div className="header-brand">
          <h1>Projectr Analytics</h1>
          <span className="header-subtitle">Real Estate Intelligence</span>
        </div>

        <nav className="header-nav">
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Dashboard
          </Link>
          <Link
            to="/compare"
            className={`nav-link ${location.pathname === '/compare' ? 'active' : ''}`}
          >
            Compare
          </Link>
        </nav>

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

          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <button
              className="sign-in-btn"
              onClick={() => setShowLogin(true)}
            >
              Sign In
            </button>
          )}

          <button
            id="theme-toggle"
            aria-label="Toggle theme"
            onClick={handleThemeToggle}
          >
            {lightTheme ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
}
