import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    await req.json(); // validate body exists

    // Generate a unique session ID
    const sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

    return NextResponse.json({
      success: true,
      sessionId,
    });
  } catch (error) {
    console.error('Exam start error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to start exam' },
      { status: 500 }
    );
  }
}
