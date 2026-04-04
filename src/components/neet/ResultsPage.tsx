'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/app-store';
import { useExamStore, type ExamResult, type Question } from '@/store/exam-store';
import {
  GraduationCap,
  Trophy,
  Target,
  Clock,
  TrendingUp,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  BarChart3,
  CheckCircle2,
  XCircle,
  MinusCircle,
  BookOpen,
  Home,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuestionCard } from './QuestionCard';

export function ResultsPage() {
  const { setView } = useAppStore();
  const { result, questions, answers } = useExamStore();
  const [viewQuestionIdx, setViewQuestionIdx] = useState(0);
  const [filter, setFilter] = useState<'all' | 'correct' | 'wrong' | 'unanswered'>('all');

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No results available</p>
      </div>
    );
  }

  const scorePercent = Math.round((result.totalScore / result.maxScore) * 100);
  const isGoodScore = scorePercent >= 60;
  const isGreatScore = scorePercent >= 80;

  // Filter questions based on selected filter
  const filteredQuestions = questions.filter((q) => {
    const answer = answers[q.id];
    if (filter === 'correct') return answer === q.correctAnswer;
    if (filter === 'wrong') return answer && answer !== q.correctAnswer;
    if (filter === 'unanswered') return !answer;
    return true;
  });

  // Get all filtered indices
  const filteredIndices = filteredQuestions.map((q) => questions.indexOf(q));
  const currentFilteredIdx = filteredIndices.indexOf(viewQuestionIdx);
  const currentQuestion = questions[viewQuestionIdx];

  const goNextFiltered = () => {
    if (currentFilteredIdx < filteredIndices.length - 1) {
      setViewQuestionIdx(filteredIndices[currentFilteredIdx + 1]);
    }
  };

  const goPrevFiltered = () => {
    if (currentFilteredIdx > 0) {
      setViewQuestionIdx(filteredIndices[currentFilteredIdx - 1]);
    }
  };

  const subjectData = [
    {
      name: 'Physics',
      score: result.physicsScore,
      correct: result.physicsCorrect,
      wrong: result.physicsWrong,
      unanswered: result.physicsUnanswered,
      total: 180,
      color: 'bg-red-500',
      lightColor: 'text-red-600',
    },
    {
      name: 'Chemistry',
      score: result.chemistryScore,
      correct: result.chemistryCorrect,
      wrong: result.chemistryWrong,
      unanswered: result.chemistryUnanswered,
      total: 180,
      color: 'bg-blue-500',
      lightColor: 'text-blue-600',
    },
    {
      name: 'Biology',
      score: result.biologyScore,
      correct: result.biologyCorrect,
      wrong: result.biologyWrong,
      unanswered: result.biologyUnanswered,
      total: 360,
      color: 'bg-green-500',
      lightColor: 'text-green-600',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-semibold">Exam Results</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setView('dashboard')}>
              <Home className="h-4 w-4 mr-1.5" />
              Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Score Header */}
        <div className="text-center mb-8">
          <div
            className={`inline-flex items-center justify-center h-24 w-24 rounded-full mb-4 ${
              isGreatScore
                ? 'bg-emerald-100 text-emerald-600'
                : isGoodScore
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-amber-100 text-amber-600'
            }`}
          >
            <Trophy className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-bold mb-2">
            {result.totalScore}{' '}
            <span className="text-lg text-muted-foreground font-normal">/ {result.maxScore}</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            {isGreatScore
              ? 'Outstanding Performance!'
              : isGoodScore
                ? 'Good Job! Keep Improving!'
                : 'Keep Practicing, You Can Do Better!'}
          </p>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              Time: {result.timeTaken}
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4" />
              Rank Prediction: ~{result.rankPrediction.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Score progress bar */}
        <div className="max-w-md mx-auto mb-10">
          <div className="flex justify-between text-sm mb-1">
            <span>Score</span>
            <span className="font-medium">{scorePercent}%</span>
          </div>
          <Progress value={scorePercent} className="h-3" />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="review">Review Answers</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Answer summary */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-emerald-600">{result.correctCount}</div>
                  <div className="text-sm text-muted-foreground">Correct</div>
                  <div className="text-sm font-medium text-emerald-600">
                    +{result.correctCount * 4}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-600">{result.wrongCount}</div>
                  <div className="text-sm text-muted-foreground">Wrong</div>
                  <div className="text-sm font-medium text-red-600">
                    -{result.wrongCount}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <MinusCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <div className="text-2xl font-bold">{result.unansweredCount}</div>
                  <div className="text-sm text-muted-foreground">Unanswered</div>
                  <div className="text-sm font-medium">0</div>
                </CardContent>
              </Card>
            </div>

            {/* Subject breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Subject-wise Score</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {subjectData.map((subject) => (
                  <div key={subject.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{subject.name}</span>
                      <span className={`text-sm font-bold ${subject.lightColor}`}>
                        {subject.score}/{subject.total}
                      </span>
                    </div>
                    <Progress value={(subject.score / subject.total) * 100} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>
                        {subject.correct} correct (+{subject.correct * 4})
                      </span>
                      <span>
                        {subject.wrong} wrong (-{subject.wrong})
                      </span>
                      <span>{subject.unanswered} unanswered</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Rank prediction */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Predicted Rank
                </CardTitle>
                <CardDescription>
                  Based on your score, your estimated All India Rank
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <div className="text-4xl font-bold">
                    ~{result.rankPrediction.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Out of approximately 20 lakh NEET aspirants
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            {/* Weak Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  Weak Topics (Below 40% Accuracy)
                </CardTitle>
                <CardDescription>
                  Focus on these topics to improve your score
                </CardDescription>
              </CardHeader>
              <CardContent>
                {result.weakTopics.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-600" />
                    <p>Great job! No weak topics detected.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {result.weakTopics.map((topic, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div>
                          <div className="font-medium text-sm">{topic.topic}</div>
                          <Badge variant="outline" className="text-xs mt-1">
                            {topic.subject}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-lg font-bold ${
                              topic.accuracy < 20
                                ? 'text-red-600'
                                : 'text-amber-600'
                            }`}
                          >
                            {topic.accuracy}%
                          </div>
                          <div className="text-xs text-muted-foreground">accuracy</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Score Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="w-24 text-sm text-muted-foreground">Positive</div>
                    <div
                      className="h-6 rounded bg-emerald-500 flex items-center px-2"
                      style={{
                        width: `${Math.max(10, (result.correctCount * 4 / result.maxScore) * 100)}%`,
                      }}
                    >
                      <span className="text-xs text-white font-medium">
                        +{result.correctCount * 4}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-24 text-sm text-muted-foreground">Negative</div>
                    <div
                      className="h-6 rounded bg-red-500 flex items-center px-2"
                      style={{
                        width: `${Math.max(3, (result.wrongCount / result.maxScore) * 100)}%`,
                      }}
                    >
                      <span className="text-xs text-white font-medium">
                        -{result.wrongCount}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-24 text-sm text-muted-foreground">Unattempted</div>
                    <div
                      className="h-6 rounded bg-gray-300 dark:bg-gray-600 flex items-center px-2"
                      style={{
                        width: `${Math.max(3, (result.unansweredCount * 4 / result.maxScore) * 100)}%`,
                      }}
                    >
                      <span className="text-xs font-medium">
                        {result.unansweredCount * 4} lost
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Improvement Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-emerald-600" />
                  Improvement Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {result.weakTopics.length > 0 && (
                    <li className="flex items-start gap-2">
                      <ArrowLeft className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                      <span>
                        Focus on <strong>{result.weakTopics[0]?.topic}</strong> (
                        {result.weakTopics[0]?.subject}) — your accuracy was only{' '}
                        {result.weakTopics[0]?.accuracy}%.
                      </span>
                    </li>
                  )}
                  {result.unansweredCount > 20 && (
                    <li className="flex items-start gap-2">
                      <ArrowLeft className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                      <span>
                        You left {result.unansweredCount} questions unanswered. Try to attempt
                        more questions — even guessing can be beneficial with 4 options.
                      </span>
                    </li>
                  )}
                  {result.wrongCount > result.correctCount * 0.5 && (
                    <li className="flex items-start gap-2">
                      <ArrowLeft className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                      <span>
                        Your wrong-to-correct ratio is high ({result.wrongCount}:
                        {result.correctCount}). Focus on concepts before speed.
                      </span>
                    </li>
                  )}
                  {scorePercent >= 70 && (
                    <li className="flex items-start gap-2">
                      <ArrowLeft className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                      <span>
                        You&apos;re on track for a good rank! Keep practicing and focus on
                        reducing negative marks.
                      </span>
                    </li>
                  )}
                  <li className="flex items-start gap-2">
                    <ArrowLeft className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                    <span>
                      Review the detailed explanations for wrong answers in the &quot;Review
                      Answers&quot; tab.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Review Answers Tab */}
          <TabsContent value="review" className="space-y-4">
            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setFilter('all');
                  setViewQuestionIdx(0);
                }}
              >
                All ({questions.length})
              </Button>
              <Button
                variant={filter === 'correct' ? 'default' : 'outline'}
                size="sm"
                className={filter === 'correct' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                onClick={() => {
                  setFilter('correct');
                  const firstCorrect = questions.findIndex(
                    (q) => answers[q.id] === q.correctAnswer
                  );
                  setViewQuestionIdx(firstCorrect >= 0 ? firstCorrect : 0);
                }}
              >
                Correct ({result.correctCount})
              </Button>
              <Button
                variant={filter === 'wrong' ? 'default' : 'outline'}
                size="sm"
                className={filter === 'wrong' ? 'bg-red-600 hover:bg-red-700' : ''}
                onClick={() => {
                  setFilter('wrong');
                  const firstWrong = questions.findIndex(
                    (q) => answers[q.id] && answers[q.id] !== q.correctAnswer
                  );
                  setViewQuestionIdx(firstWrong >= 0 ? firstWrong : 0);
                }}
              >
                Wrong ({result.wrongCount})
              </Button>
              <Button
                variant={filter === 'unanswered' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setFilter('unanswered');
                  const firstUnanswered = questions.findIndex((q) => !answers[q.id]);
                  setViewQuestionIdx(firstUnanswered >= 0 ? firstUnanswered : 0);
                }}
              >
                Unanswered ({result.unansweredCount})
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              Showing {filteredIndices.length} questions
            </div>

            {/* Question display */}
            {currentQuestion && (
              <Card>
                <CardContent className="p-6">
                  <QuestionCard
                    question={currentQuestion}
                    questionNumber={viewQuestionIdx + 1}
                    selectedAnswer={answers[currentQuestion.id] || null}
                    onSelectAnswer={() => {}}
                    showResult={true}
                  />
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={goPrevFiltered}
                disabled={currentFilteredIdx <= 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                {currentFilteredIdx + 1} / {filteredIndices.length}
              </span>
              <Button
                variant="outline"
                onClick={goNextFiltered}
                disabled={currentFilteredIdx >= filteredIndices.length - 1}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={() => setView('dashboard')}>
            <Home className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => {
              useExamStore.getState().resetExam();
              setView('instructions');
            }}
          >
            Retake Exam
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} NEETPrep AI — Exam completed successfully
          </p>
        </div>
      </footer>
    </div>
  );
}
