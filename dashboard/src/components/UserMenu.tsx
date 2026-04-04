/**
 * UserMenu — dropdown showing user info and logout.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  /* Close on outside click */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    setOpen(false);
  }, [logout]);

  if (!user) return null;

  const initials = user.display_name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20 hover:bg-primary/20 transition-colors focus:ring-2 focus:ring-primary/50"
        onClick={() => setOpen(!open)}
        aria-label="User menu"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-60 glass-panel rounded-xl border border-outline-variant/20 shadow-2xl overflow-hidden z-[100]">
          <div className="p-4 bg-surface-container-highest/60 backdrop-blur-md">
            <span className="block text-on-surface font-bold text-sm truncate">{user.display_name}</span>
            <span className="block text-outline text-xs truncate mt-0.5">{user.email}</span>
          </div>
          <div className="border-t border-outline-variant/10"></div>
          <button 
            className="w-full text-left px-5 py-3.5 text-sm text-error/90 hover:bg-surface-variant hover:text-error transition-colors flex items-center gap-3 font-medium"
            onClick={handleLogout}
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
