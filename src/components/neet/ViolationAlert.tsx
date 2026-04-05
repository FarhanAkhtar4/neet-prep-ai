'use client';

import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ViolationAlertProps {
  violations: number;
  maxViolations: number;
}

export function ViolationAlert({ violations, maxViolations }: ViolationAlertProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || violations === 0) return null;

  const remaining = maxViolations - violations;

  return (
    <div
      className={cn(
        'px-4 py-2.5 flex items-center justify-between',
        remaining <= 1
          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
      )}
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        <AlertTriangle className="h-4 w-4" />
        <span>
          Violation {violations}/{maxViolations}
          {remaining > 0
            ? ` — ${remaining} more and your exam will be auto-submitted`
            : ' — Exam auto-submitted due to violations'}
        </span>
      </div>
      <Button variant="ghost" size="sm" onClick={() => setDismissed(true)} className="h-6 w-6 p-0">
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}
