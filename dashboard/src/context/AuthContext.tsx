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
  updateUserState: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>({
    id: 1,
    email: 'admin@example.com',
    display_name: 'Dev User',
    is_active: true,
    created_at: new Date().toISOString()
  });
  const [loading] = useState(false);

  /* Check for OAuth callback token in URL or existing token in storage */
  useEffect(() => {
    // Temporarily disabled to skip login page during development
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

  // Update user state locally without full login flow
  const updateUserState = useCallback((updatedUser: User) => {
    setUser(updatedUser);
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
        updateUserState,
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
