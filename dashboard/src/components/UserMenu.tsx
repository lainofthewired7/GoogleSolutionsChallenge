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
    <div className="user-menu" ref={menuRef}>
      <button
        className="user-avatar"
        onClick={() => setOpen(!open)}
        aria-label="User menu"
      >
        {initials}
      </button>

      {open && (
        <div className="user-dropdown">
          <div className="user-dropdown-header">
            <span className="user-dropdown-name">{user.display_name}</span>
            <span className="user-dropdown-email">{user.email}</span>
          </div>
          <hr className="user-dropdown-divider" />
          <button className="user-dropdown-item" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
