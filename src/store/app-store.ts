import { create } from 'zustand';

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
  setView: (view: AppView) => void;
  setUser: (user: UserInfo | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hydrate: () => void;
}

export const useAppStore = create<AppState>()((set, get) => ({
  view: 'landing',
  user: null,
  isAuthenticated: false,
  _hydrated: false,

  setView: (view) => set({ view }),

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  login: async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        const user = { ...data.user, plan: data.user.plan as 'free' | 'pro' };
        set({ user, isAuthenticated: true, view: 'dashboard' });
        if (typeof window !== 'undefined') {
          localStorage.setItem('neet-user', JSON.stringify(user));
          localStorage.setItem('neet-auth', 'true');
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  register: async (name: string, email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (data.success) {
        const user = { ...data.user, plan: data.user.plan as 'free' | 'pro' };
        set({ user, isAuthenticated: true, view: 'dashboard' });
        if (typeof window !== 'undefined') {
          localStorage.setItem('neet-user', JSON.stringify(user));
          localStorage.setItem('neet-auth', 'true');
        }
        return true;
      }
      return false;
    } catch {
      return false;
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
}));
