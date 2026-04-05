'use client';

import { useSyncExternalStore, useCallback, useRef } from 'react';
import { useAppStore } from '@/store/app-store';
import { useExamStore } from '@/store/exam-store';
import { LandingPage } from '@/components/neet/LandingPage';
import { AuthPage } from '@/components/neet/AuthPage';
import { Dashboard } from '@/components/neet/Dashboard';
import { ExamInstructions } from '@/components/neet/ExamInstructions';
import { ExamUI } from '@/components/neet/ExamUI';
import { ResultsPage } from '@/components/neet/ResultsPage';
import { Loader2 } from 'lucide-react';

// SSR-safe hydration detection using useSyncExternalStore
const emptySubscribe = () => () => {};
function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,  // client: always hydrated
    () => false  // server: never hydrated
  );
}

export default function Home() {
  const mounted = useHydrated();
  const initialized = useRef(false);
  const view = useAppStore((s) => s.view);
  const isExamActive = useExamStore((s) => s.isExamActive);
  const result = useExamStore((s) => s.result);

  // Hydrate zustand from localStorage on first client render (via callback, not setState)
  if (!initialized.current && typeof window !== 'undefined') {
    initialized.current = true;
    useAppStore.getState().hydrate();
  }

  // Prevent hydration mismatch: render nothing until client-side is confirmed
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isExamActive) {
    return <ExamUI />;
  }

  if (view === 'exam' && result) {
    return <ResultsPage />;
  }

  switch (view) {
    case 'landing':
      return <LandingPage />;
    case 'auth':
      return <AuthPage />;
    case 'dashboard':
      return <Dashboard />;
    case 'instructions':
      return <ExamInstructions />;
    case 'results':
      return <ResultsPage />;
    default:
      return <LandingPage />;
  }
}
