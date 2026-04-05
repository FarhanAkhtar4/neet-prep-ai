import { create } from 'zustand';
import { apiFetch, type ApiError, isApiError } from '@/lib/api';

export type AppView = 'landing' | 'auth' | 'dashboard' | 'instructions' | 'exam' | 'results';

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'pro';
  token?: string;
}

interface AppState {
  view: AppView;
  user: UserInfo | null;
  isAuthenticated: boolean;
  _hydrated: boolean;

  // API connection
  apiConnected: boolean | null; // null = haven't checked yet
  apiChecking: boolean;

  // Last API error message (for displaying in forms)
  lastApiError: string | null;

  setView: (view: AppView) => void;
  setUser: (user: UserInfo | null) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hydrate: () => void;
  setApiStatus: (connected: boolean | null, checking?: boolean) => void;
  clearApiError: () => void;
}

export const useAppStore = create<AppState>()((set, get) => ({
  view: 'landing',
  user: null,
  isAuthenticated: false,
  _hydrated: false,
  apiConnected: null,
  apiChecking: false,
  lastApiError: null,

  setView: (view) => set({ view }),

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  login: async (email: string, password: string) => {
    set({ lastApiError: null });
    try {
      const data = await apiFetch<{ success: boolean; user?: Record<string, string>; error?: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (data.success) {
        const user = { ...(data.user as unknown as UserInfo), plan: (data.user as unknown as UserInfo).plan };
        set({ user, isAuthenticated: true, view: 'dashboard', apiConnected: true });
        if (typeof window !== 'undefined') {
          localStorage.setItem('neet-user', JSON.stringify(user));
          localStorage.setItem('neet-auth', 'true');
        }
        return { success: true };
      }
      return { success: false, error: data.error || 'Login failed' };
    } catch (err) {
      const apiErr = isApiError(err) ? err : { message: 'An unexpected error occurred.' };
      set({ lastApiError: apiErr.message });
      return { success: false, error: apiErr.message };
    }
  },

  register: async (name: string, email: string, password: string) => {
    set({ lastApiError: null });
    try {
      const data = await apiFetch<{ success: boolean; user?: Record<string, string>; error?: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      if (data.success) {
        const user = { ...(data.user as unknown as UserInfo), plan: (data.user as unknown as UserInfo).plan };
        set({ user, isAuthenticated: true, view: 'dashboard', apiConnected: true });
        if (typeof window !== 'undefined') {
          localStorage.setItem('neet-user', JSON.stringify(user));
          localStorage.setItem('neet-auth', 'true');
        }
        return { success: true };
      }
      return { success: false, error: data.error || 'Registration failed' };
    } catch (err) {
      const apiErr = isApiError(err) ? err : { message: 'An unexpected error occurred.' };
      set({ lastApiError: apiErr.message });
      return { success: false, error: apiErr.message };
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false, view: 'landing' });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('neet-user');
      localStorage.removeItem('neet-auth');
    }
  },

  hydrate: () => {
    try {
      if (typeof window === 'undefined') return;
      const savedUser = localStorage.getItem('neet-user');
      const savedAuth = localStorage.getItem('neet-auth');
      if (savedUser && savedAuth === 'true') {
        const user = JSON.parse(savedUser);
        set({ user, isAuthenticated: true, view: 'dashboard', _hydrated: true });
      } else {
        set({ _hydrated: true });
      }
    } catch {
      set({ _hydrated: true });
    }
  },

  setApiStatus: (connected, checking = false) =>
    set({ apiConnected: connected, apiChecking: checking }),

  clearApiError: () => set({ lastApiError: null }),
}));
