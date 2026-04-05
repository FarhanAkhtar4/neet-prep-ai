// Simple in-memory user store (works on Vercel serverless for demo purposes)
// In production, replace with Vercel Postgres / KV / Upstash Redis

interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  plan: string;
}

const users: Map<string, User> = new Map();

// Pre-seed a demo user for testing
async function hashPassword(password: string): Promise<string> {
  // Simple hash for demo - in production use bcrypt
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'neetprep-salt-2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

let seeded = false;
async function seedDemoUser() {
  if (seeded) return;
  seeded = true;
  const demoHash = await hashPassword('demo123');
  users.set('demo@neetprep.ai', {
    id: 'demo-user-001',
    email: 'demo@neetprep.ai',
    name: 'Demo Student',
    passwordHash: demoHash,
    plan: 'pro',
  });
}

export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<{ success: boolean; user?: Record<string, string>; error?: string }> {
  await seedDemoUser();

  if (users.has(email)) {
    return { success: false, error: 'Email already registered' };
  }

  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters' };
  }

  const passwordHash = await hashPassword(password);
  const user: User = {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    email,
    name,
    passwordHash,
    plan: 'free',
  };

  users.set(email, user);

  return {
    success: true,
    user: { id: user.id, email: user.email, name: user.name, plan: user.plan },
  };
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; user?: Record<string, string>; error?: string }> {
  await seedDemoUser();

  const user = users.get(email);
  if (!user) {
    return { success: false, error: 'Invalid credentials' };
  }

  const passwordHash = await hashPassword(password);
  if (passwordHash !== user.passwordHash) {
    return { success: false, error: 'Invalid credentials' };
  }

  return {
    success: true,
    user: { id: user.id, email: user.email, name: user.name, plan: user.plan },
  };
}
