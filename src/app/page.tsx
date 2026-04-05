'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import { useExamStore } from '@/store/exam-store';
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

  // Hydrate zustand from localStorage on mount
  useEffect(() => {
    useAppStore.getState().hydrate();
  }, []);

  // Prevent hydration mismatch: render loading until client-side is ready
  if (!hydrated) {
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
