import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const questions = await db.question.findMany({
      orderBy: [{ subject: 'asc' }, { id: 'asc' }],
    });

    return NextResponse.json({
      success: true,
      count: questions.length,
      questions,
    });
  } catch (error) {
    console.error('Questions fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}
