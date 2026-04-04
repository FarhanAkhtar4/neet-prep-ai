import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { questionIds } = await req.json();

    const session = await db.examSession.create({
      data: {
        status: 'in_progress',
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('Exam start error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to start exam' },
      { status: 500 }
    );
  }
}
