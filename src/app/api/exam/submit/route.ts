import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, answers, violations } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID required' },
        { status: 400 }
      );
    }

    // Fetch all questions to compute results
    const allQuestions = await db.question.findMany();
    const questionMap = new Map(allQuestions.map((q) => [q.id, q]));

    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;
    let physicsCorrect = 0, physicsWrong = 0, physicsUnanswered = 0;
    let chemistryCorrect = 0, chemistryWrong = 0, chemistryUnanswered = 0;
    let biologyCorrect = 0, biologyWrong = 0, biologyUnanswered = 0;

    // Track topic performance for weak topic detection
    const topicStats: Record<string, { correct: number; total: number; subject: string }> = {};

    const examAnswers = [];

    for (const a of answers) {
      const question = questionMap.get(a.questionId);
      if (!question) continue;

      const isAnswered = !!a.selectedAnswer;
      const isCorrect = a.selectedAnswer === question.correctAnswer;

      // Update counters
      if (!isAnswered) {
        unansweredCount++;
      } else if (isCorrect) {
        correctCount++;
      } else {
        wrongCount++;
      }

      // Subject-specific counters
      const subject = question.subject as string;
      if (subject === 'Physics') {
        if (!isAnswered) physicsUnanswered++;
        else if (isCorrect) physicsCorrect++;
        else physicsWrong++;
      } else if (subject === 'Chemistry') {
        if (!isAnswered) chemistryUnanswered++;
        else if (isCorrect) chemistryCorrect++;
        else chemistryWrong++;
      } else if (subject === 'Biology') {
        if (!isAnswered) biologyUnanswered++;
        else if (isCorrect) biologyCorrect++;
        else biologyWrong++;
      }

      // Topic tracking
      const key = `${question.subject}:${question.topic}`;
      if (!topicStats[key]) {
        topicStats[key] = { correct: 0, total: 0, subject: question.subject };
      }
      topicStats[key].total++;
      if (isCorrect) topicStats[key].correct++;

      examAnswers.push({
        sessionId,
        questionId: a.questionId,
        selectedAnswer: a.selectedAnswer,
        isCorrect: isAnswered ? isCorrect : null,
      });
    }

    // Calculate scores (+4 correct, -1 wrong, 0 unanswered)
    const totalScore = correctCount * 4 - wrongCount * 1;
    const physicsScore = physicsCorrect * 4 - physicsWrong * 1;
    const chemistryScore = chemistryCorrect * 4 - chemistryWrong * 1;
    const biologyScore = biologyCorrect * 4 - biologyWrong * 1;
    const maxScore = 720;

    // Detect weak topics (less than 40% accuracy)
    const weakTopics = Object.entries(topicStats)
      .filter(([, stats]) => stats.total >= 2 && stats.correct / stats.total < 0.4)
      .map(([key, stats]) => ({
        topic: key.split(':')[1],
        subject: stats.subject,
        accuracy: Math.round((stats.correct / stats.total) * 100),
      }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 10);

    // Rank prediction (simplified model based on score percentile)
    const rankPrediction = predictRank(totalScore);

    // Get session start time for duration
    const session = await db.examSession.findUnique({ where: { id: sessionId } });
    const startedAt = session?.startedAt || new Date();
    const completedAt = new Date();
    const durationMs = completedAt.getTime() - startedAt.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const timeTaken = `${hours}h ${minutes}m`;

    // Update session
    await db.examSession.update({
      where: { id: sessionId },
      data: {
        status: violations >= 3 ? 'auto_submitted' : 'completed',
        completedAt,
        violations: violations || 0,
        totalScore,
        correctCount,
        wrongCount,
        unansweredCount,
        physicsScore,
        chemistryScore,
        biologyScore,
      },
    });

    // Store answers
    await db.examAnswer.createMany({ data: examAnswers });

    return NextResponse.json({
      success: true,
      result: {
        sessionId,
        totalScore: Math.max(0, totalScore),
        maxScore,
        correctCount,
        wrongCount,
        unansweredCount,
        physicsScore: Math.max(0, physicsScore),
        chemistryScore: Math.max(0, chemistryScore),
        biologyScore: Math.max(0, biologyScore),
        physicsCorrect,
        physicsWrong,
        physicsUnanswered,
        chemistryCorrect,
        chemistryWrong,
        chemistryUnanswered,
        biologyCorrect,
        biologyWrong,
        biologyUnanswered,
        rankPrediction,
        weakTopics,
        timeTaken,
      },
    });
  } catch (error) {
    console.error('Exam submit error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit exam' },
      { status: 500 }
    );
  }
}

function predictRank(score: number): number {
  // Simplified rank prediction based on NEET scoring patterns
  // Real NEET: 720 max, ~20 lakh students
  if (score >= 685) return Math.floor(Math.random() * 50) + 1;
  if (score >= 650) return Math.floor(Math.random() * 500) + 50;
  if (score >= 600) return Math.floor(Math.random() * 5000) + 500;
  if (score >= 550) return Math.floor(Math.random() * 20000) + 5000;
  if (score >= 500) return Math.floor(Math.random() * 50000) + 25000;
  if (score >= 450) return Math.floor(Math.random() * 100000) + 75000;
  if (score >= 400) return Math.floor(Math.random() * 150000) + 175000;
  if (score >= 350) return Math.floor(Math.random() * 200000) + 325000;
  if (score >= 300) return Math.floor(Math.random() * 300000) + 525000;
  if (score >= 250) return Math.floor(Math.random() * 400000) + 825000;
  if (score >= 200) return Math.floor(Math.random() * 400000) + 1225000;
  return Math.floor(Math.random() * 500000) + 1500000;
}
