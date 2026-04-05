import type { Question } from './types';
import questionsData from '@/data/questions.json';

// Static questions loaded from JSON file (works everywhere, including Vercel serverless)
const _questions: Question[] = questionsData as Question[];

export async function getQuestions(): Promise<Question[]> {
  return _questions;
}

export async function getQuestionById(id: string): Promise<Question | undefined> {
  return _questions.find((q) => q.id === id);
}

export async function getQuestionsBySubject(subject: string): Promise<Question[]> {
  return _questions.filter((q) => q.subject === subject);
}

export interface ExamResult {
  sessionId: string;
  totalScore: number;
  maxScore: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  physicsScore: number;
  chemistryScore: number;
  biologyScore: number;
  physicsCorrect: number;
  physicsWrong: number;
  physicsUnanswered: number;
  chemistryCorrect: number;
  chemistryWrong: number;
  chemistryUnanswered: number;
  biologyCorrect: number;
  biologyWrong: number;
  biologyUnanswered: number;
  rankPrediction: number;
  weakTopics: { topic: string; subject: string; accuracy: number }[];
  timeTaken: string;
}

export interface SubmitAnswer {
  questionId: string;
  selectedAnswer: string | null;
}

export function evaluateExam(
  answers: SubmitAnswer[],
  questions: Question[],
  sessionId: string,
  violations: number
): ExamResult {
  const questionMap = new Map(questions.map((q) => [q.id, q]));

  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;
  let physicsCorrect = 0, physicsWrong = 0, physicsUnanswered = 0;
  let chemistryCorrect = 0, chemistryWrong = 0, chemistryUnanswered = 0;
  let biologyCorrect = 0, biologyWrong = 0, biologyUnanswered = 0;

  const topicStats: Record<string, { correct: number; total: number; subject: string }> = {};

  for (const a of answers) {
    const question = questionMap.get(a.questionId);
    if (!question) continue;

    const isAnswered = !!a.selectedAnswer;
    const isCorrect = a.selectedAnswer === question.correctAnswer;

    if (!isAnswered) unansweredCount++;
    else if (isCorrect) correctCount++;
    else wrongCount++;

    const subject = question.subject;
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

    const key = `${question.subject}:${question.topic}`;
    if (!topicStats[key]) topicStats[key] = { correct: 0, total: 0, subject: question.subject };
    topicStats[key].total++;
    if (isCorrect) topicStats[key].correct++;
  }

  const totalScore = correctCount * 4 - wrongCount * 1;
  const physicsScore = physicsCorrect * 4 - physicsWrong * 1;
  const chemistryScore = chemistryCorrect * 4 - chemistryWrong * 1;
  const biologyScore = biologyCorrect * 4 - biologyWrong * 1;
  const maxScore = 720;

  const weakTopics = Object.entries(topicStats)
    .filter(([, stats]) => stats.total >= 2 && stats.correct / stats.total < 0.4)
    .map(([key, stats]) => ({
      topic: key.split(':')[1],
      subject: stats.subject,
      accuracy: Math.round((stats.correct / stats.total) * 100),
    }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 10);

  const rankPrediction = predictRank(Math.max(0, totalScore));

  return {
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
    timeTaken: '0h 0m',
  };
}

function predictRank(score: number): number {
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
