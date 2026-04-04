import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const sessions = await db.examSession.findMany({
      orderBy: { startedAt: 'desc' },
      take: 20,
      select: {
        id: true,
        status: true,
        startedAt: true,
        completedAt: true,
        totalScore: true,
        correctCount: true,
        wrongCount: true,
        unansweredCount: true,
        violations: true,
      },
    });

    return NextResponse.json({ success: true, sessions });
  } catch (error) {
    console.error('History fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}
