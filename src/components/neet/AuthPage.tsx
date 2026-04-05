'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/app-store';
import { GraduationCap, Eye, EyeOff, ArrowLeft, Loader2, WifiOff, ServerCrash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export function AuthPage() {
  const { login, register, setView } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState<'validation' | 'network' | 'server' | 'auth'>('validation');
  const [showPassword, setShowPassword] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!loginEmail || !loginPassword) {
      setError('Please fill all fields');
      setErrorType('validation');
      return;
    }
    setLoading(true);
    const result = await login(loginEmail, loginPassword);
    if (!result.success) {
      setError(result.error || 'Login failed');
      // Classify the error type
      const msg = result.error?.toLowerCase() || '';
      if (msg.includes('connect') || msg.includes('network') || msg.includes('internet')) {
        setErrorType('network');
      } else if (msg.includes('server') || msg.includes('500') || msg.includes('unavailable')) {
        setErrorType('server');
      } else {
        setErrorType('auth');
      }
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!regName || !regEmail || !regPassword || !regConfirm) {
      setError('Please fill all fields');
      setErrorType('validation');
      return;
    }
    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setErrorType('validation');
      return;
    }
    if (regPassword !== regConfirm) {
      setError('Passwords do not match');
      setErrorType('validation');
      return;
    }
    setLoading(true);
    const result = await register(regName, regEmail, regPassword);
    if (!result.success) {
      setError(result.error || 'Registration failed. Email may already exist.');
      const msg = result.error?.toLowerCase() || '';
      if (msg.includes('connect') || msg.includes('network') || msg.includes('internet')) {
        setErrorType('network');
      } else if (msg.includes('server') || msg.includes('500') || msg.includes('unavailable')) {
        setErrorType('server');
      } else {
        setErrorType('auth');
      }
    }
    setLoading(false);
  };

  const getErrorConfig = () => {
    switch (errorType) {
      case 'network':
        return {
          icon: <WifiOff className="h-4 w-4 text-red-500" />,
          className: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
        };
      case 'server':
        return {
          icon: <ServerCrash className="h-4 w-4 text-amber-500" />,
          className: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        };
      default:
        return {
          icon: null,
          className: 'bg-destructive/10 text-destructive border-destructive/20',
        };
    }
  };

  const errorConfig = getErrorConfig();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Button variant="ghost" className="mb-4" onClick={() => setView('landing')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Welcome to NEETPrep AI</h1>
          <p className="text-muted-foreground mt-1">
            Sign in to access your mock tests and analytics
          </p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>Enter your credentials to continue</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  {error && (
                    <div className={cn('flex items-start gap-2.5 text-sm p-3 rounded-md border', errorConfig.className)}>
                      {errorConfig.icon}
                      <span>{error}</span>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Sign In
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>Join thousands of NEET aspirants</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  {error && (
                    <div className={cn('flex items-start gap-2.5 text-sm p-3 rounded-md border', errorConfig.className)}>
                      {errorConfig.icon}
                      <span>{error}</span>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">Full Name</Label>
                    <Input
                      id="reg-name"
                      placeholder="Your name"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="you@example.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="Min 6 characters"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-confirm">Confirm Password</Label>
                    <Input
                      id="reg-confirm"
                      type="password"
                      placeholder="Re-enter password"
                      value={regConfirm}
                      onChange={(e) => setRegConfirm(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create Account
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
