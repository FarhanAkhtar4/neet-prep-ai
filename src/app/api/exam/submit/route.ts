import { NextRequest, NextResponse } from 'next/server';
import { getQuestions, evaluateExam } from '@/data/exam-service';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, answers, violations } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID required' },
        { status: 400 }
      );
    }

    const questions = await getQuestions();
    const result = evaluateExam(answers || [], questions, sessionId, violations || 0);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Exam submit error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit exam' },
      { status: 500 }
    );
  }
}
