'use client';

import { useAppStore } from '@/store/app-store';
import { useExamStore } from '@/store/exam-store';
import { LandingPage } from '@/components/neet/LandingPage';
import { AuthPage } from '@/components/neet/AuthPage';
import { Dashboard } from '@/components/neet/Dashboard';
import { ExamInstructions } from '@/components/neet/ExamInstructions';
import { ExamUI } from '@/components/neet/ExamUI';
import { ResultsPage } from '@/components/neet/ResultsPage';

export default function Home() {
  const { view } = useAppStore();
  const { isExamActive, result } = useExamStore();

  // If exam is active, always show exam UI regardless of view state
  if (isExamActive) {
    return <ExamUI />;
  }

  // After exam completion, show results
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
