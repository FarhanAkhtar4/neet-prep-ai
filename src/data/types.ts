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
