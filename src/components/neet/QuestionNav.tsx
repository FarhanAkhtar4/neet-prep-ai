'use client';

import { useExamStore } from '@/store/exam-store';
import { Badge } from '@/components/ui/badge';

const STATUS_COLORS: Record<string, string> = {
  answered: 'bg-emerald-600 text-white',
  marked: 'bg-purple-600 text-white',
  unanswered: 'bg-muted text-muted-foreground border',
  current: 'ring-2 ring-offset-2 ring-primary',
};

export function QuestionNav() {
  const {
    questions,
    currentQuestionIndex,
    answers,
    markedForReview,
    goToQuestion,
    getSubjectBreakdown,
    jumpToSubject,
    getQuestionStatus,
  } = useExamStore();

  const breakdown = getSubjectBreakdown();
  const answeredCount = Object.values(answers).filter(Boolean).length;
  const markedCount = Object.keys(markedForReview).filter((k) => markedForReview[k]).length;

  return (
    <div className="p-4 space-y-4">
      {/* Profile section */}
      <div className="text-sm">
        <h3 className="font-semibold mb-3">Question Palette</h3>
        <div className="flex items-center gap-3 text-xs mb-3">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-emerald-600" />
            Answered ({answeredCount})
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-purple-600" />
            Marked ({markedCount})
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-muted border" />
            Not Visited
          </div>
        </div>
      </div>

      {/* Subject breakdown */}
      {breakdown.map((subject) => (
        <div key={subject.subject}>
          <button
            onClick={() => jumpToSubject(subject.subject)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors mb-2"
          >
            <span className="text-sm font-medium">{subject.subject}</span>
            <Badge variant="outline" className="text-xs">
              {subject.answered}/{subject.total}
            </Badge>
          </button>

          {/* Question grid for this subject */}
          <div className="grid grid-cols-6 gap-1.5 mb-3">
            {questions
              .map((q, originalIdx) => ({ ...q, originalIdx }))
              .filter((q) => q.subject === subject.subject)
              .map((q) => {
                const status = getQuestionStatus(q.id);
                const isCurrent = q.originalIdx === currentQuestionIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => goToQuestion(q.originalIdx)}
                    className={`h-8 w-8 rounded text-xs font-medium transition-all ${
                      STATUS_COLORS[status]
                    } ${isCurrent ? STATUS_COLORS.current : ''} ${
                      q.difficulty === 'Hard' ? 'font-bold' : ''
                    }`}
                    title={`Q${q.originalIdx + 1} - ${q.topic} (${q.difficulty})`}
                  >
                    {q.originalIdx + 1}
                  </button>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
