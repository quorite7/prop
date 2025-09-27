export interface QuestionnaireQuestion {
  id: string;
  text: string;
  type: 'text' | 'multiple_choice' | 'number' | 'boolean' | 'scale';
  options?: string[];
  required: boolean;
  followUpQuestions?: string[];
  isAIGenerated?: boolean;
  reasoning?: string;
}

export interface QuestionnaireResponse {
  questionId: string;
  questionText?: string; // Optional for backward compatibility
  answer: string | number | boolean;
  timestamp: string;
}

export interface QuestionnaireSession {
  id: string;
  projectId: string;
  currentQuestionIndex: number;
  responses: QuestionnaireResponse[];
  isComplete: boolean;
  completionPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface AIQuestionnaireRequest {
  projectContext: {
    projectType: string;
    description: string;
    budget?: { min?: number; max?: number };
    timeline?: string;
    propertyAddress: any;
    documents?: any[];
  };
  previousResponses: QuestionnaireResponse[];
  currentQuestionIndex: number;
}

export interface AIQuestionnaireResponse {
  question: QuestionnaireQuestion;
  isComplete: boolean;
  nextQuestionId?: string;
  reasoning?: string;
}
