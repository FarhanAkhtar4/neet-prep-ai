'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useExamStore } from '@/store/exam-store';
import { QuestionNav } from './QuestionNav';
import { QuestionCard } from './QuestionCard';
import { ExamTimer } from './ExamTimer';
import { ViolationAlert } from './ViolationAlert';
import { Proctoring } from './Proctoring';
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Send,
  Maximize,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export function ExamUI() {
  const {
    questions,
    currentQuestionIndex,
    answers,
    markedForReview,
    violations,
    maxViolations,
    isExamActive,
    isSubmitting,
    errorMessage,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    markForReview,
    submitExam,
    getSubjectBreakdown,
  } = useExamStore();

  const currentQuestion = questions[currentQuestionIndex];
  const breakdown = getSubjectBreakdown();
  const answeredCount = Object.values(answers).filter(Boolean).length;
  const totalQuestions = questions.length;

  // Anti-cheat: Tab switch detection
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden && useExamStore.getState().isExamActive) {
      const shouldSubmit = useExamStore.getState().addViolation();
      if (!shouldSubmit) {
        // Show alert
        const v = useExamStore.getState().violations;
        alert(`⚠️ Tab switch detected! Violation ${v}/${maxViolations}. ${maxViolations - v} more and your exam will be auto-submitted.`);
      }
    }
  }, [maxViolations]);

  // Anti-cheat: Copy/paste/right-click prevention
  useEffect(() => {
    const preventCopy = (e: ClipboardEvent) => e.preventDefault();
    const preventPaste = (e: ClipboardEvent) => e.preventDefault();
    const preventCut = (e: ClipboardEvent) => e.preventDefault();
    const preventContextMenu = (e: MouseEvent) => e.preventDefault();
    const preventSelectStart = () => false;

    document.addEventListener('copy', preventCopy);
    document.addEventListener('paste', preventPaste);
    document.addEventListener('cut', preventCut);
    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('selectstart', preventSelectStart);

    return () => {
      document.removeEventListener('copy', preventCopy);
      document.removeEventListener('paste', preventPaste);
      document.removeEventListener('cut', preventCut);
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('selectstart', preventSelectStart);
    };
  }, []);

  // Anti-cheat: Tab visibility
  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  // Anti-cheat: Keyboard shortcuts
  useEffect(() => {
    const preventKeys = (e: KeyboardEvent) => {
      // Block Ctrl+C, Ctrl+V, Ctrl+U, Ctrl+Shift+I, F12
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'u' || e.key === 'a')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
        e.key === 'F12'
      ) {
        e.preventDefault();
      }
    };
    document.addEventListener('keydown', preventKeys);
    return () => document.removeEventListener('keydown', preventKeys);
  }, []);

  // Anti-cheat: DevTools detection
  useEffect(() => {
    let devtoolsOpen = false;
    const threshold = 160;

    const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      if ((widthThreshold || heightThreshold) && !devtoolsOpen && isExamActive) {
        devtoolsOpen = true;
        const shouldSubmit = useExamStore.getState().addViolation();
        if (!shouldSubmit) {
          alert('⚠️ Developer tools detected! This is a violation.');
        }
      }
      if (!widthThreshold && !heightThreshold) {
        devtoolsOpen = false;
      }
    };

    const interval = setInterval(checkDevTools, 1000);
    return () => clearInterval(interval);
  }, [isExamActive]);

  // Fullscreen enforcement
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        await document.documentElement.requestFullscreen();
      } catch {
        // Fullscreen not supported or denied
      }
    };
    enterFullscreen();

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && useExamStore.getState().isExamActive) {
        // User exited fullscreen, warn them
        setTimeout(() => {
          if (useExamStore.getState().isExamActive && !document.fullscreenElement) {
            enterFullscreen();
          }
        }, 1000);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  if (!currentQuestion) return null;

  const currentAnswer = answers[currentQuestion.id] || null;
  const isMarked = markedForReview[currentQuestion.id] || false;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden" onCopy={(e) => e.preventDefault()}>
      {/* Top Bar */}
      <div className="shrink-0 border-b bg-background">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Left: Subject + Question info */}
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  Question {currentQuestionIndex + 1}/{totalQuestions}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Question Navigation</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  <QuestionNav />
                </div>
              </SheetContent>
            </Sheet>
            <Badge
              variant={
                currentQuestion.subject === 'Physics'
                  ? 'destructive'
                  : currentQuestion.subject === 'Chemistry'
                    ? 'default'
                    : 'secondary'
              }
            >
              {currentQuestion.subject}
            </Badge>
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Q{currentQuestionIndex + 1}/{totalQuestions}
            </span>
            <Badge variant="outline" className="text-xs">
              {currentQuestion.difficulty}
            </Badge>
          </div>

          {/* Center: Timer */}
          <ExamTimer />

          {/* Right: Violations + Mark + Submit */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-sm">
              {Array.from({ length: maxViolations }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2.5 w-2.5 rounded-full ${
                    i < violations ? 'bg-red-500' : 'bg-green-500'
                  }`}
                />
              ))}
            </div>

            <Button
              variant={isMarked ? 'default' : 'outline'}
              size="sm"
              onClick={() => markForReview(currentQuestion.id)}
              className="hidden sm:flex"
            >
              <Flag className={`h-4 w-4 mr-1 ${isMarked ? 'fill-current' : ''}`} />
              {isMarked ? 'Marked' : 'Mark'}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-1" />
                  )}
                  Submit
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Submit Exam?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You have answered {answeredCount} out of {totalQuestions} questions.
                    {totalQuestions - answeredCount > 0 && (
                      <span className="text-amber-600 block mt-1">
                        {totalQuestions - answeredCount} questions are still unanswered!
                      </span>
                    )}
                    <br />
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Continue Exam</AlertDialogCancel>
                  <AlertDialogAction onClick={submitExam}>Submit Exam</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Subject progress bar */}
        <div className="flex h-1">
          {breakdown.map((s) => {
            const pct = (s.total / totalQuestions) * 100;
            const colors: Record<string, string> = {
              Physics: 'bg-red-500',
              Chemistry: 'bg-blue-500',
              Biology: 'bg-green-500',
            };
            return (
              <div
                key={s.subject}
                className={`${colors[s.subject] || 'bg-gray-500'}`}
                style={{ width: `${pct}%` }}
              />
            );
          })}
        </div>
      </div>

      {/* Violation alert */}
      {violations > 0 && (
        <ViolationAlert violations={violations} maxViolations={maxViolations} />
      )}

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Question panel */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto p-4 sm:p-6">
            {errorMessage && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-lg mb-4 text-sm">
                {errorMessage}
              </div>
            )}

            <QuestionCard
              question={currentQuestion}
              questionNumber={currentQuestionIndex + 1}
              selectedAnswer={currentAnswer}
              onSelectAnswer={(answer) =>
                useExamStore.getState().selectAnswer(currentQuestion.id, answer)
              }
            />

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-6 mb-4">
              <Button
                variant="outline"
                onClick={prevQuestion}
                disabled={currentQuestionIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant={isMarked ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => markForReview(currentQuestion.id)}
                  className="sm:hidden"
                >
                  <Flag className={`h-4 w-4 mr-1 ${isMarked ? 'fill-current' : ''}`} />
                  {isMarked ? 'Marked' : 'Mark'}
                </Button>
              </div>

              <Button
                onClick={() => {
                  if (currentQuestionIndex < totalQuestions - 1) {
                    nextQuestion();
                  }
                }}
                disabled={currentQuestionIndex === totalQuestions - 1}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop: Question Navigation sidebar */}
        <div className="hidden lg:block w-72 border-l overflow-y-auto">
          <QuestionNav />
        </div>
      </div>

      {/* Proctoring (webcam) - hidden but active */}
      <Proctoring />
    </div>
  );
}
