'use client';

import { useAppStore } from '@/store/app-store';
import {
  GraduationCap,
  Shield,
  Clock,
  BarChart3,
  Camera,
  Lock,
  Zap,
  ChevronRight,
  Star,
  CheckCircle2,
  Play,
  BookOpen,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function LandingPage() {
  const { setView, isAuthenticated } = useAppStore();

  const features = [
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: '180 NEET Questions',
      desc: '45 Physics + 45 Chemistry + 90 Biology — real exam pattern',
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: '3h 20m Timer',
      desc: 'Precise countdown timer matching actual NEET duration',
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: 'Smart Analysis',
      desc: 'Subject breakdown, weak topic detection, rank prediction',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Anti-Cheat System',
      desc: 'Tab switch detection, copy/paste block, devtools prevention',
    },
    {
      icon: <Camera className="h-6 w-6" />,
      title: 'AI Proctoring',
      desc: 'Real-time webcam monitoring with face detection',
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Detailed Results',
      desc: '+4/-1 scoring, topic-wise analysis, improvement tips',
    },
  ];

  const steps = [
    { num: '01', title: 'Register', desc: 'Create your free account in seconds' },
    { num: '02', title: 'Start Exam', desc: 'Begin your full-length NEET simulation' },
    { num: '03', title: 'Get Results', desc: 'Detailed analysis with improvement plan' },
  ];

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">NEETPrep AI</span>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button onClick={() => setView('dashboard')}>Dashboard</Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => setView('auth')}>
                  Sign In
                </Button>
                <Button onClick={() => setView('auth')}>Get Started</Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">
            <Zap className="h-3.5 w-3.5 mr-1.5" />
            AI-Powered NEET Simulation Platform
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Crack NEET with{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Confidence
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Experience the real NEET exam with 180 questions, AI proctoring,
            anti-cheat systems, and detailed performance analytics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="text-lg px-8 h-12"
              onClick={() => setView(isAuthenticated ? 'instructions' : 'auth')}
            >
              <Play className="h-5 w-5 mr-2" />
              Start Free Mock Test
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 h-12"
              onClick={() => {
                const el = document.getElementById('features');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Learn More
              <ChevronRight className="h-5 w-5 ml-1" />
            </Button>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              180 Questions
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              AI Proctoring
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Instant Results
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Free to Start
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '180', label: 'Exam Questions' },
              { value: '720', label: 'Maximum Score' },
              { value: '3:20', label: 'Duration (H:M)' },
              { value: 'AI', label: 'Smart Proctoring' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our platform provides a complete NEET simulation experience with
              cutting-edge technology.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="border hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 mb-2">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.desc}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-muted/50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">
              Start your NEET preparation in three simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.num} className="text-center">
                <div className="text-5xl font-bold text-emerald-100 dark:text-emerald-950 mb-4">
                  {step.num}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-muted-foreground text-lg">
              Start free, upgrade when you need more
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl">Free</CardTitle>
                <CardDescription>Get started with basic features</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">₹0</span>
                  <span className="text-muted-foreground">/forever</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    '1 Mock Test per day',
                    '180 Questions (Full NEET)',
                    'Basic Score Analysis',
                    'Timer & Navigation',
                    'Anti-Cheat Protection',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full mt-6"
                  variant="outline"
                  onClick={() => setView(isAuthenticated ? 'instructions' : 'auth')}
                >
                  Start Free
                </Button>
              </CardContent>
            </Card>
            <Card className="border-2 border-emerald-600 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-emerald-600 text-white px-3">
                  <Star className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Pro</CardTitle>
                <CardDescription>Full-featured NEET preparation</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">₹499</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    'Unlimited Mock Tests',
                    '180 Questions (Full NEET)',
                    'Advanced Analytics & AI Insights',
                    'Timer & Smart Navigation',
                    'Anti-Cheat + AI Proctoring',
                    'Weak Topic Detection',
                    'Rank Prediction',
                    'Detailed Explanations',
                    'Performance History',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full mt-6"
                  onClick={() => setView(isAuthenticated ? 'instructions' : 'auth')}
                >
                  Upgrade to Pro
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 rounded-3xl p-12">
          <Lock className="h-12 w-12 mx-auto mb-4 text-emerald-600" />
          <h2 className="text-3xl font-bold mb-4">Ready to Ace NEET?</h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join thousands of students preparing smarter with AI-powered mock tests
          </p>
          <Button
            size="lg"
            className="text-lg px-8 h-12"
            onClick={() => setView(isAuthenticated ? 'instructions' : 'auth')}
          >
            Start Your First Mock Test
            <ChevronRight className="h-5 w-5 ml-1" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-semibold">NEETPrep AI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} NEETPrep AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
