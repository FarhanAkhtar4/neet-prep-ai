import { NextResponse } from 'next/server';
import { getQuestions } from '@/data/exam-service';

export async function GET() {
  try {
    const questions = await getQuestions();
    // Sort by subject then id for consistent ordering
    const sorted = [...questions].sort((a, b) => {
      const subjOrder = { Physics: 0, Chemistry: 1, Biology: 2 };
      const diff = (subjOrder[a.subject] ?? 3) - (subjOrder[b.subject] ?? 3);
      return diff !== 0 ? diff : a.id.localeCompare(b.id);
    });

    return NextResponse.json({
      success: true,
      count: sorted.length,
      questions: sorted,
    });
  } catch (error) {
    console.error('Questions fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}
