import { NextResponse } from 'next/server';

export async function GET() {
  // In-memory history (resets on serverless cold start)
  // In production, use Vercel Postgres / KV
  return NextResponse.json({ success: true, sessions: [] });
}
