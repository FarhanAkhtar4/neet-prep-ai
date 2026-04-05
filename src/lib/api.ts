/**
 * API utility with error handling, health checks, and connection status tracking.
 * All API calls in the app should go through `apiFetch` for consistent error handling.
 */

export type ApiStatus = 'unknown' | 'checking' | 'connected' | 'error' | 'server_error';

export interface ApiError {
  type: 'network' | 'server' | 'client' | 'invalid';
  message: string;
  status?: number;
  detail?: string;
}

/** Singleton status that any component can read */
let _globalStatus: ApiStatus = 'unknown';
let _listeners: Array<(status: ApiStatus) => void> = [];

export function getApiStatus(): ApiStatus {
  return _globalStatus;
}

export function onApiStatusChange(fn: (status: ApiStatus) => void): () => void {
  _listeners.push(fn);
  return () => {
    _listeners = _listeners.filter((l) => l !== fn);
  };
}

function setApiStatus(status: ApiStatus) {
  if (_globalStatus !== status) {
    _globalStatus = status;
    _listeners.forEach((fn) => fn(status));
  }
}

/**
 * Wraps fetch with error handling and API status tracking.
 * Returns parsed JSON on success, throws ApiError on failure.
 */
export async function apiFetch<T = unknown>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
  } catch (err) {
    // Network-level failure (no response at all)
    const apiErr: ApiError = {
      type: 'network',
      message: 'Unable to connect to the server. Please check your internet connection and try again.',
    };
    setApiStatus('error');
    throw apiErr;
  }

  // We got a response — mark as connected (server is reachable)
  setApiStatus('connected');

  // Try to parse JSON
  let data: T;
  try {
    data = await response.json();
  } catch {
    const apiErr: ApiError = {
      type: 'server',
      message: 'Server returned an invalid response. Please try again later.',
      status: response.status,
    };
    setApiStatus('server_error');
    throw apiErr;
  }

  // Check for HTTP error status codes
  if (!response.ok) {
    const detail = typeof data === 'object' && data !== null && 'error' in (data as Record<string, unknown>)
      ? String((data as Record<string, unknown>).error)
      : undefined;

    const apiErr: ApiError = {
      type: response.status >= 500 ? 'server' : 'client',
      message: detail || getErrorMessageForStatus(response.status),
      status: response.status,
      detail,
    };
    if (response.status >= 500) setApiStatus('server_error');
    throw apiErr;
  }

  // Check for application-level error (success: false)
  if (typeof data === 'object' && data !== null && 'success' in (data as Record<string, unknown>)) {
    const rec = data as Record<string, unknown>;
    if (rec.success === false) {
      const apiErr: ApiError = {
        type: 'invalid',
        message: String(rec.error || 'An unexpected error occurred.'),
        detail: String(rec.error || ''),
      };
      throw apiErr;
    }
  }

  return data;
}

/**
 * Run a health check against the /api endpoint.
 */
export async function checkApiHealth(): Promise<ApiStatus> {
  setApiStatus('checking');
  try {
    const res = await fetch('/api', { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      setApiStatus('connected');
      return 'connected';
    }
    setApiStatus('server_error');
    return 'server_error';
  } catch {
    setApiStatus('error');
    return 'error';
  }
}

function getErrorMessageForStatus(status: number): string {
  switch (status) {
    case 400:
      return 'Bad request. Please check your input and try again.';
    case 401:
      return 'Authentication failed. Please sign in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 408:
      return 'Request timed out. Please check your connection and try again.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'Internal server error. Our team has been notified. Please try again.';
    case 502:
      return 'Server is temporarily unavailable. Please try again in a few moments.';
    case 503:
      return 'Service is currently down for maintenance. Please try again later.';
    default:
      return `Server error (${status}). Please try again.`;
  }
}

/** Type guard to check if an error is an ApiError */
export function isApiError(err: unknown): err is ApiError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'type' in err &&
    'message' in err &&
    typeof (err as ApiError).message === 'string'
  );
}
