'use client';

import { useExamStore } from '@/store/exam-store';
import { Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ExamTimer() {
  const { timeRemaining, isExamActive } = useExamStore();

  const hours = Math.floor(timeRemaining / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  const timeStr = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  const isLow = timeRemaining < 1800; // Less than 30 minutes
  const isCritical = timeRemaining < 300; // Less than 5 minutes

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-1.5 rounded-full font-mono text-lg font-bold',
        isCritical
          ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 animate-pulse'
          : isLow
            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
            : 'bg-muted text-foreground'
      )}
    >
      <Clock className={cn('h-4 w-4', isLow && 'text-current')} />
      {timeStr}
      {isCritical && (
        <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
      )}
    </div>
  );
}
