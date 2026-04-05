'use client';

import { useExamStore, type Question } from '@/store/exam-store';
import { Check, X, AlertCircle } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  selectedAnswer: string | null;
  onSelectAnswer: (answer: string) => void;
  showResult?: boolean;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];
const OPTION_KEYS = ['optionA', 'optionB', 'optionC', 'optionD'] as const;

export function QuestionCard({
  question,
  questionNumber,
  selectedAnswer,
  onSelectAnswer,
  showResult = false,
}: QuestionCardProps) {
  const options = OPTION_KEYS.map((key) => ({
    label: OPTION_LABELS[OPTION_KEYS.indexOf(key)],
    text: question[key],
    key,
  }));

  return (
    <div className="space-y-4">
      {/* Question header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium text-muted-foreground">
          Question {questionNumber}
        </span>
        <span className="text-xs text-muted-foreground">•</span>
        <span className="text-xs text-muted-foreground">{question.topic}</span>
        <span className="text-xs text-muted-foreground">•</span>
        <span
          className={`text-xs font-medium ${
            question.difficulty === 'Hard'
              ? 'text-red-600'
              : question.difficulty === 'Medium'
                ? 'text-amber-600'
                : 'text-emerald-600'
          }`}
        >
          {question.difficulty}
        </span>
      </div>

      {/* Question text */}
      <div className="text-base leading-relaxed font-medium">{question.questionText}</div>

      {/* Options */}
      <div className="space-y-2.5 mt-6">
        {options.map((option) => {
          const isSelected = selectedAnswer === option.label;
          const isCorrect = showResult && question.correctAnswer === option.label;
          const isWrong = showResult && isSelected && question.correctAnswer !== option.label;

          let borderClass = 'border-border hover:border-primary/50 hover:bg-primary/5';
          if (isSelected && !showResult) {
            borderClass = 'border-primary bg-primary/10 ring-1 ring-primary';
          }
          if (isCorrect) {
            borderClass = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30';
          }
          if (isWrong) {
            borderClass = 'border-red-500 bg-red-50 dark:bg-red-950/30';
          }

          return (
            <button
              key={option.label}
              onClick={() => !showResult && onSelectAnswer(option.label)}
              disabled={showResult}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${borderClass} ${
                showResult ? 'cursor-default' : 'cursor-pointer'
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : isCorrect
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : isWrong
                          ? 'border-red-500 bg-red-500 text-white'
                          : 'border-muted-foreground/30'
                  }`}
                >
                  {showResult && isCorrect ? (
                    <Check className="h-4 w-4" />
                  ) : showResult && isWrong ? (
                    <X className="h-4 w-4" />
                  ) : (
                    option.label
                  )}
                </span>
                <span className="text-sm leading-relaxed pt-0.5">{option.text}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Show correct answer and explanation if result mode */}
      {showResult && (
        <div className="mt-6 space-y-3">
          <div
            className={`p-3 rounded-lg text-sm flex items-start gap-2 ${
              selectedAnswer === question.correctAnswer
                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200'
                : 'bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-200'
            }`}
          >
            {selectedAnswer === question.correctAnswer ? (
              <Check className="h-4 w-4 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            )}
            <span>
              {selectedAnswer === question.correctAnswer
                ? 'Correct! '
                : `Incorrect. Correct answer is ${question.correctAnswer}. `}
              You selected: {selectedAnswer || 'Not answered'}
            </span>
          </div>
          <div className="p-3 bg-muted rounded-lg text-sm">
            <span className="font-medium">Explanation:</span>
            <p className="mt-1 text-muted-foreground">{question.explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
}
