/**
 * AuthContext — manages user authentication state.
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { User } from '../types';
import * as authService from '../services/auth';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /* Check for OAuth callback token in URL or existing token in storage */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const callbackToken = params.get('token');
    const authError = params.get('auth_error');

    if (authError) {
      console.error('OAuth error:', authError);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
      setLoading(false);
      return;
    }

    if (callbackToken) {
      // OAuth callback — store token and fetch user
      authService.setToken(callbackToken);
      window.history.replaceState({}, '', window.location.pathname);
      authService
        .getMe()
        .then(setUser)
        .catch(() => {
          authService.clearToken();
        })
        .finally(() => setLoading(false));
    } else {
      const token = authService.getToken();
      if (token) {
        authService
          .getMe()
          .then(setUser)
          .catch(() => {
            authService.clearToken();
          })
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await authService.login(email, password);
    const me = await authService.getMe();
    setUser(me);
  }, []);

  const register = useCallback(
    async (email: string, password: string, displayName: string) => {
      await authService.register(email, password, displayName);
      /* Auto-login after registration */
      await authService.login(email, password);
      const me = await authService.getMe();
      setUser(me);
    },
    [],
  );

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within <AuthProvider>');
  }
  return ctx;
}
