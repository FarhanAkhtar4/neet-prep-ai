'use client';

import { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, ServerCrash, Loader2, CheckCircle2 } from 'lucide-react';
import { getApiStatus, onApiStatusChange, checkApiHealth, type ApiStatus } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<ApiStatus, {
  icon: typeof WifiOff;
  label: string;
  color: string;
  bg: string;
  show: boolean;
}> = {
  unknown: { icon: Loader2, label: 'Checking connection...', color: 'text-muted-foreground', bg: 'bg-muted', show: false },
  checking: { icon: Loader2, label: 'Checking connection...', color: 'text-muted-foreground', bg: 'bg-muted', show: true },
  connected: { icon: CheckCircle2, label: '', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30', show: false },
  error: {
    icon: WifiOff,
    label: 'Unable to connect to the server. Check your internet connection.',
    color: 'text-red-700 dark:text-red-300',
    bg: 'bg-red-50 dark:bg-red-950/40',
    show: true,
  },
  server_error: {
    icon: ServerCrash,
    label: 'Server is experiencing issues. Some features may not work.',
    color: 'text-amber-700 dark:text-amber-300',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    show: true,
  },
};

export function ApiStatusBanner() {
  const [status, setStatus] = useState<ApiStatus>('unknown');
  const [checking, setChecking] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Subscribe to status changes — the callback itself updates state
    const unsub = onApiStatusChange(setStatus);
    return unsub;
  }, []);

  // Show banner after a short delay to avoid flicker
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(t);
  }, []);

  const handleRetry = async () => {
    setChecking(true);
    setDismissed(false);
    await checkApiHealth();
    setChecking(false);
  };

  const config = STATUS_CONFIG[status];
  if (!config.show || !visible || dismissed) return null;

  const Icon = config.icon;
  const isSpinning = status === 'checking';

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-[200] flex items-center justify-center gap-3 px-4 py-2.5 text-sm font-medium border-b transition-all',
        config.bg,
        config.color
      )}
    >
      <Icon className={cn('h-4 w-4 shrink-0', isSpinning && 'animate-spin')} />
      <span>{config.label}</span>
      <Button
        variant="ghost"
        size="sm"
        className={cn('h-7 gap-1.5 text-xs', config.color)}
        onClick={handleRetry}
        disabled={checking}
      >
        <RefreshCw className={cn('h-3 w-3', checking && 'animate-spin')} />
        Retry
      </Button>
      <button
        onClick={() => setDismissed(true)}
        className="ml-2 text-xs opacity-60 hover:opacity-100 transition-opacity leading-none"
      >
        Dismiss
      </button>
    </div>
  );
}
