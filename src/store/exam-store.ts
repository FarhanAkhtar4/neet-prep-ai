import { create } from 'zustand';
import { apiFetch, isApiError, type ApiError } from '@/lib/api';

export interface Question {
  id: string;
  subject: 'Physics' | 'Chemistry' | 'Biology';
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
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

export type AnswerStatus = 'unanswered' | 'answered' | 'marked';

export interface ExamApiError {
  message: string;
  isNetworkError: boolean;
  isServerError: boolean;
}

interface ExamState {
  // Exam data
  questions: Question[];
  sessionId: string | null;

  // Current state
  currentQuestionIndex: number;
  answers: Record<string, string | null>;
  markedForReview: Record<string, boolean>;

  // Timer
  timeRemaining: number; // in seconds
  timerInterval: NodeJS.Timeout | null;

  // Anti-cheat
  violations: number;
  maxViolations: number;

  // Results
  result: ExamResult | null;

  // Status
  isExamActive: boolean;
  isExamLoading: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;
  errorType: 'none' | 'network' | 'server' | 'invalid';

  // Actions
  loadQuestions: () => Promise<boolean>;
  startExam: () => Promise<void>;
  selectAnswer: (questionId: string, answer: string | null) => void;
  markForReview: (questionId: string) => void;
  goToQuestion: (index: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  startTimer: () => void;
  stopTimer: () => void;
  addViolation: () => boolean;
  submitExam: () => Promise<void>;
  autoSubmit: () => Promise<void>;
  resetExam: () => void;
  clearError: () => void;
  getQuestionStatus: (questionId: string) => AnswerStatus;
  getSubjectBreakdown: () => {
    subject: string;
    total: number;
    answered: number;
    marked: number;
    unanswered: number;
  }[];
  jumpToSubject: (subject: string) => void;
}

function classifyError(err: unknown): ExamApiError {
  if (isApiError(err)) {
    const apiErr = err as ApiError;
    return {
      message: apiErr.message,
      isNetworkError: apiErr.type === 'network',
      isServerError: apiErr.type === 'server',
    };
  }
  return {
    message: 'An unexpected error occurred. Please try again.',
    isNetworkError: false,
    isServerError: false,
  };
}

export const useExamStore = create<ExamState>()((set, get) => ({
  questions: [],
  sessionId: null,
  currentQuestionIndex: 0,
  answers: {},
  markedForReview: {},
  timeRemaining: 200 * 60, // 200 minutes (3h 20m) in seconds
  timerInterval: null,
  violations: 0,
  maxViolations: 3,
  result: null,
  isExamActive: false,
  isExamLoading: false,
  isSubmitting: false,
  errorMessage: null,
  errorType: 'none',

  loadQuestions: async () => {
    set({ isExamLoading: true, errorMessage: null, errorType: 'none' });
    try {
      const data = await apiFetch<{ success: boolean; questions: Question[]; count: number; error?: string }>('/api/questions');

      if (data.questions && data.questions.length === 180) {
        set({ questions: data.questions, isExamLoading: false });
        return true;
      }

      set({
        errorMessage: data.questions
          ? `Expected 180 questions but received ${data.questions.length}. Data may be corrupted.`
          : 'Failed to load questions. The question bank may be unavailable.',
        errorType: 'invalid',
        isExamLoading: false,
      });
      return false;
    } catch (err) {
      const classified = classifyError(err);
      set({
        errorMessage: classified.message,
        errorType: classified.isNetworkError ? 'network' : classified.isServerError ? 'server' : 'invalid',
        isExamLoading: false,
      });
      return false;
    }
  },

  startExam: async () => {
    const { questions } = get();
    if (questions.length === 0) return;

    set({ errorMessage: null, errorType: 'none' });
    try {
      const data = await apiFetch<{ success: boolean; sessionId: string; error?: string }>('/api/exam/start', {
        method: 'POST',
        body: JSON.stringify({ questionIds: questions.map((q) => q.id) }),
      });
      if (data.success) {
        set({
          sessionId: data.sessionId,
          isExamActive: true,
          currentQuestionIndex: 0,
          answers: {},
          markedForReview: {},
          timeRemaining: 200 * 60,
          violations: 0,
          result: null,
          errorMessage: null,
          errorType: 'none',
        });
        get().startTimer();
      } else {
        set({
          errorMessage: data.error || 'Failed to start the exam session.',
          errorType: 'invalid',
        });
      }
    } catch (err) {
      const classified = classifyError(err);
      set({
        errorMessage: classified.message,
        errorType: classified.isNetworkError ? 'network' : 'server',
      });
    }
  },

  selectAnswer: (questionId, answer) => {
    set((state) => ({
      answers: { ...state.answers, [questionId]: answer },
    }));
  },

  markForReview: (questionId) => {
    set((state) => ({
      markedForReview: {
        ...state.markedForReview,
        [questionId]: !state.markedForReview[questionId],
      },
    }));
  },

  goToQuestion: (index) => {
    const { questions } = get();
    if (index >= 0 && index < questions.length) {
      set({ currentQuestionIndex: index });
    }
  },

  nextQuestion: () => {
    const { currentQuestionIndex, questions } = get();
    if (currentQuestionIndex < questions.length - 1) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
    }
  },

  prevQuestion: () => {
    const { currentQuestionIndex } = get();
    if (currentQuestionIndex > 0) {
      set({ currentQuestionIndex: currentQuestionIndex - 1 });
    }
  },

  startTimer: () => {
    const { timerInterval } = get();
    if (timerInterval) clearInterval(timerInterval);

    const interval = setInterval(() => {
      const { timeRemaining } = get();
      if (timeRemaining <= 0) {
        clearInterval(interval);
        get().autoSubmit();
        return;
      }
      set({ timeRemaining: timeRemaining - 1 });
    }, 1000);

    set({ timerInterval: interval });
  },

  stopTimer: () => {
    const { timerInterval } = get();
    if (timerInterval) {
      clearInterval(timerInterval);
      set({ timerInterval: null });
    }
  },

  addViolation: () => {
    const { violations, maxViolations } = get();
    const newViolations = violations + 1;
    set({ violations: newViolations });
    if (newViolations >= maxViolations) {
      get().autoSubmit();
      return true;
    }
    return false;
  },

  submitExam: async () => {
    const { sessionId, questions, answers, isSubmitting } = get();
    if (!sessionId || isSubmitting) return;

    set({ isSubmitting: true, errorMessage: null, errorType: 'none' });

    const answerPayload = questions.map((q) => ({
      questionId: q.id,
      selectedAnswer: answers[q.id] || null,
    }));

    try {
      const data = await apiFetch<{ success: boolean; result?: ExamResult; error?: string }>('/api/exam/submit', {
        method: 'POST',
        body: JSON.stringify({
          sessionId,
          answers: answerPayload,
          violations: get().violations,
        }),
      });

      if (data.success && data.result) {
        get().stopTimer();
        set({
          isExamActive: false,
          isSubmitting: false,
          result: data.result,
          errorMessage: null,
          errorType: 'none',
        });
      } else {
        set({
          isSubmitting: false,
          errorMessage: data.error || 'Exam submission failed. Your answers may not have been saved.',
          errorType: 'invalid',
        });
      }
    } catch (err) {
      const classified = classifyError(err);
      set({
        isSubmitting: false,
        errorMessage: classified.isNetworkError
          ? 'Network error while submitting. Your answers are still saved locally. Please check your connection and try submitting again.'
          : classified.message,
        errorType: classified.isNetworkError ? 'network' : 'server',
      });
    }
  },

  autoSubmit: async () => {
    get().stopTimer();
    set({ isExamActive: false });
    await get().submitExam();
  },

  resetExam: () => {
    const { timerInterval } = get();
    if (timerInterval) clearInterval(timerInterval);
    set({
      questions: [],
      sessionId: null,
      currentQuestionIndex: 0,
      answers: {},
      markedForReview: {},
      timeRemaining: 200 * 60,
      timerInterval: null,
      violations: 0,
      result: null,
      isExamActive: false,
      isExamLoading: false,
      isSubmitting: false,
      errorMessage: null,
      errorType: 'none',
    });
  },

  clearError: () => set({ errorMessage: null, errorType: 'none' }),

  getQuestionStatus: (questionId) => {
    const { answers, markedForReview } = get();
    if (markedForReview[questionId]) return 'marked';
    if (answers[questionId]) return 'answered';
    return 'unanswered';
  },

  getSubjectBreakdown: () => {
    const { questions, answers, markedForReview } = get();
    const subjects = ['Physics', 'Chemistry', 'Biology'] as const;

    return subjects.map((subject) => {
      const subjectQuestions = questions.filter((q) => q.subject === subject);
      return {
        subject,
        total: subjectQuestions.length,
        answered: subjectQuestions.filter((q) => !!answers[q.id]).length,
        marked: subjectQuestions.filter((q) => markedForReview[q.id]).length,
        unanswered: subjectQuestions.filter(
          (q) => !answers[q.id] && !markedForReview[q.id]
        ).length,
      };
    });
  },

  jumpToSubject: (subject) => {
    const { questions } = get();
    const idx = questions.findIndex((q) => q.subject === subject);
    if (idx >= 0) set({ currentQuestionIndex: idx });
  },
}));
