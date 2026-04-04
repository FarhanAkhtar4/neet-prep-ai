import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  setView: (view: AppView) => void;
  setUser: (user: UserInfo | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      view: 'landing',
      user: null,
      isAuthenticated: false,

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
            set({
              user: data.user,
              isAuthenticated: true,
              view: 'dashboard',
            });
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
            set({
              user: data.user,
              isAuthenticated: true,
              view: 'dashboard',
            });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          view: 'landing',
        }),
    }),
    {
      name: 'neet-app-store',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
