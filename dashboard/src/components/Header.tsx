/**
 * Header component — brand title, nav links, search, auth, and notifications.
 * Uses the Obsidian Flux design system (Tailwind).
 */

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';
import UserMenu from './UserMenu';

export default function Header() {
  const { isAuthenticated } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const location = useLocation();

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-background flex justify-between items-center px-6 h-16 font-headline tracking-tight border-b-outline-variant/10 border-b">
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
          <div className="relative hidden lg:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-outline text-sm">search</span>
            </div>
            <input
              className="bg-surface-container-highest border-none rounded-xl py-2 pl-10 pr-4 text-sm w-64 focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-outline text-on-surface"
              placeholder="Search Austin submarkets..."
              type="text"
            />
          </div>
          {isAuthenticated && (
            <>
              <button className="text-on-surface/70 hover:text-primary transition-all active:scale-95" title="Notifications">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button className="text-on-surface/70 hover:text-primary transition-all active:scale-95" title="Settings">
                <span className="material-symbols-outlined">settings</span>
              </button>
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
