
export enum QuestionType {
  MultipleChoice = 'MULTIPLE_CHOICE',
  TrueFalse = 'TRUE_FALSE',
  FillInTheBlank = 'FILL_IN_THE_BLANK',
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[]; // For MultipleChoice
  answer: string;
  topic: string;
}

export interface Chapter {
  id: string;
  name: string;
  questions: Question[];
}

export interface Subject {
  id: string;
  name: string;
  chapters: Chapter[];
}

export interface UserAnswer {
  [questionId: string]: string;
}

export interface QuizAttempt {
  questions: Question[];
  userAnswers: UserAnswer;
  score: number;
  total: number;
  timestamp: number;
}
