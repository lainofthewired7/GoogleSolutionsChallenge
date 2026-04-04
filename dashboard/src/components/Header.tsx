/**
 * Header component — brand title, nav links, search with autocomplete, auth, and notifications.
 * Uses the Obsidian Flux design system (Tailwind).
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import LoginModal from './LoginModal';
import UserMenu from './UserMenu';

export default function Header() {
  const { isAuthenticated } = useAuth();
  const { setMarket, markets, selectedMarket, marketInfo } = useAppContext();
  const [showLogin, setShowLogin] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Filter markets based on search input */
  const filteredMarkets = useMemo(() => {
    if (!searchValue.trim()) return markets;
    const query = searchValue.toLowerCase();
    return markets.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.code.toLowerCase().includes(query) ||
        m.state.toLowerCase().includes(query),
    );
  }, [searchValue, markets]);

  /* Close dropdown on outside click */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selectMarket = (code: string) => {
    setMarket(code);
    setSearchValue('');
    setShowDropdown(false);
    setHighlightIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => Math.min(prev + 1, filteredMarkets.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightIndex >= 0 && highlightIndex < filteredMarkets.length) {
        selectMarket(filteredMarkets[highlightIndex].code);
      } else if (filteredMarkets.length > 0) {
        selectMarket(filteredMarkets[0].code);
      } else if (searchValue.trim()) {
        // Fallback: slugify whatever the user typed
        selectMarket(searchValue.trim().toLowerCase().replace(/\s+/g, '-'));
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-[2000] bg-background flex justify-between items-center px-6 h-16 font-headline tracking-tight border-b-outline-variant/10 border-b">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-bold tracking-tighter text-on-surface hover:opacity-80 transition-opacity">
            Projectr Analytics
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`transition-colors duration-300 pb-1 ${
                location.pathname === '/'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-on-surface/70 hover:text-primary'
              }`}
            >
              Market Overview
            </Link>
            {isAuthenticated && (
              <Link
                to="/compare"
                className={`transition-colors duration-300 pb-1 ${
                  location.pathname === '/compare'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-on-surface/70 hover:text-primary'
                }`}
              >
                Comparison View
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Search with autocomplete */}
          <div className="relative hidden lg:block" ref={dropdownRef}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-outline text-sm">search</span>
            </div>
            <input
              ref={inputRef}
              className="bg-surface-container-highest border-none rounded-xl py-2 pl-10 pr-4 text-sm w-72 focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-outline text-on-surface"
              placeholder="Search markets (e.g. Dallas, Phoenix)..."
              type="text"
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                setShowDropdown(true);
                setHighlightIndex(-1);
              }}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={handleKeyDown}
            />

            {/* Active market badge */}
            {marketInfo && !showDropdown && (
              <div className="absolute inset-y-0 right-2 flex items-center">
                <span className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-md font-bold truncate max-w-[100px]">
                  {marketInfo.name}
                </span>
              </div>
            )}

            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-outline-variant/15 overflow-hidden shadow-2xl" style={{ background: 'rgba(15, 23, 36, 0.97)', backdropFilter: 'blur(24px)' }}>
                <div className="max-h-72 overflow-y-auto">
                  {filteredMarkets.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-on-surface-variant">
                      No matching markets found
                    </div>
                  ) : (
                    filteredMarkets.map((m, i) => (
                      <button
                        key={m.code}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer ${
                          i === highlightIndex
                            ? 'bg-primary/15 text-primary'
                            : m.code === selectedMarket
                              ? 'bg-surface-container-high text-on-surface'
                              : 'text-on-surface/80 hover:bg-surface-container-highest'
                        }`}
                        onClick={() => selectMarket(m.code)}
                        onMouseEnter={() => setHighlightIndex(i)}
                      >
                        <span className="material-symbols-outlined text-sm opacity-60">location_on</span>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium block truncate">{m.name}</span>
                        </div>
                        <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">{m.state}</span>
                        {m.code === selectedMarket && (
                          <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          {isAuthenticated && (
            <>
              <button className="text-on-surface/70 hover:text-primary transition-all active:scale-95" title="Notifications">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <Link to="/settings" className="text-on-surface/70 hover:text-primary transition-all active:scale-95" title="Settings">
                <span className="material-symbols-outlined">settings</span>
              </Link>
              <UserMenu />
            </>
          )}
          {!isAuthenticated && (
            <button
              className="bg-primary/10 text-primary hover:bg-primary/20 px-4 py-1.5 rounded-lg font-bold text-sm transition-colors border border-primary/20"
              onClick={() => setShowLogin(true)}
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
}
