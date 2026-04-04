/**
 * Auth service — login, register, token management.
 */

import type { User, TokenResponse } from '../types';

const API_BASE = '/api/auth';
const TOKEN_KEY = 'projectr_token';

/* ── Token storage ── */

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* ── Auth API calls ── */

export async function login(email: string, password: string): Promise<TokenResponse> {
  const form = new URLSearchParams();
  form.append('username', email);
  form.append('password', password);

  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Login failed');
  }
  const data: TokenResponse = await res.json();
  setToken(data.access_token);
  return data;
}

export async function register(
  email: string,
  password: string,
  displayName: string,
): Promise<User> {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, display_name: displayName }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Registration failed');
  }
  return res.json();
}

export async function updateProfile(displayName: string): Promise<User> {
  const res = await fetch(`${API_BASE}/update`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ display_name: displayName }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to update profile');
  }
  return res.json();
}

export async function getMe(): Promise<User> {
  const res = await fetch(`${API_BASE}/me`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error('Not authenticated');
  }
  return res.json();
}

export function logout(): void {
  clearToken();
}
