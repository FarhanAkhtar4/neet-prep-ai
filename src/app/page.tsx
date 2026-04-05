'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import { useExamStore } from '@/store/exam-store';
import { checkApiHealth } from '@/lib/api';
import { ApiStatusBanner } from '@/components/neet/ApiStatusBanner';
import { LandingPage } from '@/components/neet/LandingPage';
import { AuthPage } from '@/components/neet/AuthPage';
import { Dashboard } from '@/components/neet/Dashboard';
import { ExamInstructions } from '@/components/neet/ExamInstructions';
import { ExamUI } from '@/components/neet/ExamUI';
import { ResultsPage } from '@/components/neet/ResultsPage';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const view = useAppStore((s) => s.view);
  const isExamActive = useExamStore((s) => s.isExamActive);
  const result = useExamStore((s) => s.result);
  const hydrated = useAppStore((s) => s._hydrated);
  const setApiStatus = useAppStore((s) => s.setApiStatus);

  // Hydrate zustand from localStorage on mount
  useEffect(() => {
    useAppStore.getState().hydrate();
  }, []);

  // Check API health on mount and periodically
  useEffect(() => {
    if (!hydrated) return;

    let cancelled = false;

    async function ping() {
      if (cancelled) return;
      setApiStatus(null, true);
      try {
        const res = await fetch('/api', { signal: AbortSignal.timeout(8000) });
        setApiStatus(res.ok, false);
      } catch {
        setApiStatus(false, false);
      }
    }

    ping();
    const interval = setInterval(ping, 30000); // Re-check every 30 seconds
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [hydrated, setApiStatus]);

  // Prevent hydration mismatch: render loading until client-side is ready
  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Never render the API banner during an active exam
  const showBanner = !isExamActive;

  return (
    <>
      {showBanner && <ApiStatusBanner />}
      {isExamActive ? (
        <ExamUI />
      ) : view === 'exam' && result ? (
        <ResultsPage />
      ) : (
        <>
          {view === 'landing' && <LandingPage />}
          {view === 'auth' && <AuthPage />}
          {view === 'dashboard' && <Dashboard />}
          {view === 'instructions' && <ExamInstructions />}
          {view === 'results' && <ResultsPage />}
          {!['landing', 'auth', 'dashboard', 'instructions', 'results'].includes(view) && <LandingPage />}
        </>
      )}
    </>
  );
}
