import { create } from 'zustand';

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

type AnswerStatus = 'unanswered' | 'answered' | 'marked';

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
  addViolation: () => boolean; // returns true if should auto-submit
  submitExam: () => Promise<void>;
  autoSubmit: () => Promise<void>;
  resetExam: () => void;
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

  loadQuestions: async () => {
    set({ isExamLoading: true, errorMessage: null });
    try {
      const res = await fetch('/api/questions');
      const data = await res.json();
      if (data.success && data.questions.length === 180) {
        set({ questions: data.questions, isExamLoading: false });
        return true;
      }
      set({
        errorMessage: data.error || 'Failed to load questions',
        isExamLoading: false,
      });
      return false;
    } catch (err) {
      set({
        errorMessage: 'Network error. Please try again.',
        isExamLoading: false,
      });
      return false;
    }
  },

  startExam: async () => {
    const { questions } = get();
    if (questions.length === 0) return;

    try {
      const res = await fetch('/api/exam/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionIds: questions.map((q) => q.id) }),
      });
      const data = await res.json();
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
        });
        get().startTimer();
      } else {
        set({ errorMessage: data.error || 'Failed to start exam' });
      }
    } catch {
      set({ errorMessage: 'Network error. Please try again.' });
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
    const { sessionId, questions, answers, markedForReview, isSubmitting } = get();
    if (!sessionId || isSubmitting) return;

    set({ isSubmitting: true });

    // Build answer payload
    const answerPayload = questions.map((q) => ({
      questionId: q.id,
      selectedAnswer: answers[q.id] || null,
    }));

    try {
      const res = await fetch('/api/exam/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          answers: answerPayload,
          violations: get().violations,
        }),
      });
      const data = await res.json();

      if (data.success) {
        get().stopTimer();
        set({
          isExamActive: false,
          isSubmitting: false,
          result: data.result,
        });
      } else {
        set({ isSubmitting: false, errorMessage: data.error || 'Submission failed' });
      }
    } catch {
      set({ isSubmitting: false, errorMessage: 'Network error during submission' });
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
    });
  },

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
