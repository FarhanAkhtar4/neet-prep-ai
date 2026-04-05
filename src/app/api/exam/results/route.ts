import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID required' },
        { status: 400 }
      );
    }

    // In serverless (Vercel), session history is stateless.
    // Results are computed client-side and stored in Zustand.
    return NextResponse.json({
      success: false,
      error: 'Session results are available in the exam UI. This endpoint is deprecated on serverless.',
    });
  } catch (error) {
    console.error('Results fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}
