'use client';

import { useAppStore } from '@/store/app-store';
import { useExamStore } from '@/store/exam-store';
import {
  ArrowLeft,
  Shield,
  Clock,
  Camera,
  AlertTriangle,
  CheckCircle2,
  Play,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function ExamInstructions() {
  const { setView, isAuthenticated } = useAppStore();
  const { loadQuestions, startExam, isExamLoading } = useExamStore();

  const handleStart = async () => {
    if (!isAuthenticated) {
      setView('auth');
      return;
    }

    // Load questions first
    const loaded = await loadQuestions();
    if (loaded) {
      await startExam();
      if (useExamStore.getState().isExamActive) {
        setView('exam');
      }
    }
  };

  const rules = [
    {
      icon: <Clock className="h-5 w-5" />,
      title: 'Duration: 3 Hours 20 Minutes',
      desc: 'The timer starts when you begin. No extra time will be provided.',
      color: 'text-blue-600',
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: '180 Questions',
      desc: '45 Physics + 45 Chemistry + 90 Biology. All questions are compulsory.',
      color: 'text-emerald-600',
    },
    {
      icon: <AlertTriangle className="h-5 w-5" />,
      title: 'Anti-Cheat Protection',
      desc: 'Tab switching, copy/paste, right-click, and devtools are blocked. 3 violations = auto submit.',
      color: 'text-amber-600',
    },
    {
      icon: <Camera className="h-5 w-5" />,
      title: 'AI Proctoring',
      desc: 'Webcam monitoring is active. Face must remain visible at all times.',
      color: 'text-purple-600',
    },
    {
      icon: <CheckCircle2 className="h-5 w-5" />,
      title: 'Marking Scheme: +4 / -1',
      desc: '+4 for correct answer, -1 for wrong, 0 for unanswered.',
      color: 'text-emerald-600',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-semibold">Exam Instructions</span>
          </div>
          <Badge variant="secondary">Full-Length Mock Test</Badge>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Exam Instructions</h1>
          <p className="text-muted-foreground">
            Please read all instructions carefully before starting the exam.
          </p>
        </div>

        {/* Rules */}
        <div className="space-y-4 mb-8">
          {rules.map((rule) => (
            <Card key={rule.title}>
              <CardContent className="p-4 flex items-start gap-4">
                <div className={`${rule.color} shrink-0 mt-0.5`}>{rule.icon}</div>
                <div>
                  <h3 className="font-semibold">{rule.title}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{rule.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Exam Pattern */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Exam Pattern</CardTitle>
            <CardDescription>Question distribution across subjects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30">
                <div className="text-2xl font-bold text-red-600">45</div>
                <div className="text-sm text-muted-foreground">Physics</div>
                <div className="text-xs text-muted-foreground mt-1">180 marks</div>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                <div className="text-2xl font-bold text-blue-600">45</div>
                <div className="text-sm text-muted-foreground">Chemistry</div>
                <div className="text-xs text-muted-foreground mt-1">180 marks</div>
              </div>
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30">
                <div className="text-2xl font-bold text-green-600">90</div>
                <div className="text-sm text-muted-foreground">Biology</div>
                <div className="text-xs text-muted-foreground mt-1">360 marks</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Warning */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-200">
                Important Warning
              </h3>
              <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
                Once you start the exam, the timer will begin immediately. You cannot pause or
                restart the exam. Switching tabs or attempting to cheat will be recorded, and 3
                violations will result in automatic submission of your current answers.
              </p>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="text-center">
          <Button size="lg" className="text-lg px-12 h-14" onClick={handleStart} disabled={isExamLoading}>
            {isExamLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Loading Questions...
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2" />
                I Understand — Start Exam
              </>
            )}
          </Button>
          <p className="text-sm text-muted-foreground mt-3">
            By clicking start, you agree to the exam rules and anti-cheat policy.
          </p>
        </div>
      </main>
    </div>
  );
}
