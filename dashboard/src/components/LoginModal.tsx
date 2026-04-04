/**
 * LoginModal — glassmorphic modal with login / register tabs + social OAuth.
 */

import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

interface LoginModalProps {
  onClose: () => void;
}

/* ── Provider SVG Icons ── */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
      <rect x="13" y="1" width="10" height="10" fill="#7FBA00"/>
      <rect x="1" y="13" width="10" height="10" fill="#00A4EF"/>
      <rect x="13" y="13" width="10" height="10" fill="#FFB900"/>
    </svg>
  );
}

const API_BASE = '/api/auth';

export default function LoginModal({ onClose }: LoginModalProps) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setSubmitting(true);
      try {
        if (tab === 'login') {
          await login(email, password);
        } else {
          await register(email, password, displayName);
        }
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setSubmitting(false);
      }
    },
    [tab, email, password, displayName, login, register, onClose],
  );

  const handleSocialLogin = useCallback((provider: string) => {
    // Redirect to backend OAuth endpoint — backend handles the rest
    window.location.href = `${API_BASE}/${provider}`;
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div 
        className="glass-panel w-full max-w-sm rounded-2xl border border-outline-variant/20 shadow-2xl overflow-hidden relative" 
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="absolute top-4 right-4 text-outline hover:text-on-surface transition-colors focus:outline-none"
          onClick={onClose}
        >
           <span className="material-symbols-outlined text-xl">close</span>
        </button>

        <div className="flex border-b border-outline-variant/20 pt-2">
          <button
            className={`flex-1 py-4 text-sm font-bold tracking-wide transition-colors ${tab === 'login' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-on-surface/60 hover:text-on-surface hover:bg-surface-variant/50'}`}
            onClick={() => setTab('login')}
          >
            Sign In
          </button>
          <button
            className={`flex-1 py-4 text-sm font-bold tracking-wide transition-colors ${tab === 'register' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-on-surface/60 hover:text-on-surface hover:bg-surface-variant/50'}`}
            onClick={() => setTab('register')}
          >
            Register
          </button>
        </div>

        <div className="p-8">
          {/* Social login buttons */}
          <div className="space-y-3">
            <button
              className="w-full bg-surface-container-highest hover:bg-surface-variant border border-outline-variant/20 rounded-xl py-2.5 px-4 flex items-center justify-center gap-3 transition-all text-on-surface text-sm font-medium"
              onClick={() => handleSocialLogin('google')}
              type="button"
            >
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>
            <button
              className="w-full bg-surface-container-highest hover:bg-surface-variant border border-outline-variant/20 rounded-xl py-2.5 px-4 flex items-center justify-center gap-3 transition-all text-on-surface text-sm font-medium"
              onClick={() => handleSocialLogin('github')}
              type="button"
            >
              <GitHubIcon />
              <span>Continue with GitHub</span>
            </button>
            <button
              className="w-full bg-surface-container-highest hover:bg-surface-variant border border-outline-variant/20 rounded-xl py-2.5 px-4 flex items-center justify-center gap-3 transition-all text-on-surface text-sm font-medium"
              onClick={() => handleSocialLogin('microsoft')}
              type="button"
            >
              <MicrosoftIcon />
              <span>Continue with Microsoft</span>
            </button>
          </div>

          <div className="flex items-center my-6">
            <div className="flex-1 bg-outline-variant/30 h-px"></div>
            <span className="px-4 text-xs font-label text-outline uppercase tracking-widest">or</span>
            <div className="flex-1 bg-outline-variant/30 h-px"></div>
          </div>

          {/* Email / password form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'register' && (
              <input
                type="text"
                placeholder="Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl py-3 px-4 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-outline"
              />
            )}
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl py-3 px-4 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-outline"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl py-3 px-4 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-outline"
            />

            {error && <p className="text-error text-xs font-medium text-center bg-error-container/20 py-2 rounded-lg border border-error-container/30">{error}</p>}

            <button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary-dim text-on-primary py-3 rounded-xl font-bold transition-all active:scale-[0.98] mt-2 shadow-[0_0_15px_rgba(129,236,255,0.2)]"
              disabled={submitting}
            >
              {submitting
                ? 'Please wait...'
                : tab === 'login'
                  ? 'Sign In'
                  : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
