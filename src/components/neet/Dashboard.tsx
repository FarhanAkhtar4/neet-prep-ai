'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/app-store';
import {
  GraduationCap,
  LogOut,
  Play,
  History,
  Trophy,
  Clock,
  Target,
  ChevronRight,
  Loader2,
  BarChart3,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ExamHistory {
  id: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  totalScore: number | null;
  correctCount: number | null;
  wrongCount: number | null;
  unansweredCount: number | null;
  violations: number;
}

export function Dashboard() {
  const { user, logout, setView } = useAppStore();
  const [history, setHistory] = useState<ExamHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch('/api/user/history');
        const data = await res.json();
        if (data.success) setHistory(data.sessions);
      } catch {
        // ignore
      }
      setLoadingHistory(false);
    }
    fetchHistory();
  }, []);

  const completedExams = history.filter((e) => e.status === 'completed' && e.totalScore !== null);
  const bestScore = completedExams.length > 0
    ? Math.max(...completedExams.map((e) => e.totalScore || 0))
    : null;
  const avgScore =
    completedExams.length > 0
      ? Math.round(
          completedExams.reduce((sum, e) => sum + (e.totalScore || 0), 0) / completedExams.length
        )
      : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">NEETPrep AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary">{user?.plan === 'pro' ? 'PRO' : 'FREE'}</Badge>
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.name}</span>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-1.5" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground">
            Ready for your next NEET mock test? Track your progress below.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <History className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Tests Taken</span>
              </div>
              <div className="text-2xl font-bold">{completedExams.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-muted-foreground">Best Score</span>
              </div>
              <div className="text-2xl font-bold">
                {bestScore !== null ? `${bestScore}/720` : '—'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="h-4 w-4 text-emerald-600" />
                <span className="text-sm text-muted-foreground">Avg Score</span>
              </div>
              <div className="text-2xl font-bold">
                {avgScore !== null ? `${avgScore}/720` : '—'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Accuracy</span>
              </div>
              <div className="text-2xl font-bold">
                {completedExams.length > 0
                  ? `${Math.round(
                      (completedExams.reduce(
                        (sum, e) => sum + (e.correctCount || 0),
                        0
                      ) /
                        completedExams.reduce(
                          (sum, e) => sum + (e.correctCount || 0) + (e.wrongCount || 0),
                          0
                        )) *
                        100
                    )}%`
                  : '—'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Start Exam CTA */}
        <Card className="mb-8 border-emerald-600/50 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold mb-1">Start a New Mock Test</h2>
              <p className="text-muted-foreground">
                180 questions across Physics, Chemistry, and Biology. Duration: 3 hours 20 minutes.
              </p>
            </div>
            <Button size="lg" onClick={() => setView('instructions')}>
              <Play className="h-5 w-5 mr-2" />
              Start Exam
            </Button>
          </CardContent>
        </Card>

        {/* Exam History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Exam History
            </CardTitle>
            <CardDescription>Your past mock test attempts</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No exams taken yet. Start your first mock test above!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((exam) => (
                  <div
                    key={exam.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          exam.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950'
                            : exam.status === 'auto_submitted'
                              ? 'bg-amber-50 text-amber-600 dark:bg-amber-950'
                              : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {exam.status === 'completed' ? (
                          <Trophy className="h-5 w-5" />
                        ) : exam.status === 'auto_submitted' ? (
                          <AlertTriangle className="h-5 w-5" />
                        ) : (
                          <Clock className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">
                          {exam.status === 'completed'
                            ? 'Completed'
                            : exam.status === 'auto_submitted'
                              ? 'Auto Submitted'
                              : 'In Progress'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(exam.startedAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {exam.violations > 0 && (
                            <Badge variant="destructive" className="ml-2 text-xs">
                              {exam.violations} violations
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {exam.totalScore !== null ? (
                        <>
                          <div className="text-lg font-bold">
                            {exam.totalScore}
                            <span className="text-sm text-muted-foreground">/720</span>
                          </div>
                          {exam.totalScore > 0 && (
                            <Progress
                              value={(exam.totalScore / 720) * 100}
                              className="w-20 h-1.5 mt-1"
                            />
                          )}
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">No score</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">NEETPrep AI</span>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} NEETPrep AI
          </p>
        </div>
      </footer>
    </div>
  );
}
