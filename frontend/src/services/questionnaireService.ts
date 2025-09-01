import { apiService } from './api';
import { 
  QuestionnaireSession, 
  QuestionnaireResponse, 
  AIQuestionnaireRequest,
  AIQuestionnaireResponse 
} from '../types/questionnaire';

class QuestionnaireService {
  async startQuestionnaire(projectId: string): Promise<QuestionnaireSession> {
    return apiService.post<QuestionnaireSession>(`/projects/${projectId}/questionnaire/start`, {});
  }

  async getQuestionnaireSession(projectId: string): Promise<QuestionnaireSession | null> {
    try {
      return await apiService.get<QuestionnaireSession>(`/projects/${projectId}/questionnaire`);
    } catch (error: any) {
      // Return null for 404 (no session found) instead of throwing
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async getNextQuestion(projectId: string, sessionId: string): Promise<AIQuestionnaireResponse> {
    return apiService.post<AIQuestionnaireResponse>(`/projects/${projectId}/questionnaire/${sessionId}/next`, {});
  }

  async submitResponse(
    projectId: string, 
    sessionId: string, 
    response: Omit<QuestionnaireResponse, 'timestamp'>
  ): Promise<QuestionnaireSession> {
    return apiService.post<QuestionnaireSession>(
      `/projects/${projectId}/questionnaire/${sessionId}/response`, 
      response
    );
  }

  async updateResponse(
    projectId: string, 
    sessionId: string, 
    questionId: string,
    response: Omit<QuestionnaireResponse, 'timestamp'>
  ): Promise<QuestionnaireSession> {
    return apiService.put<QuestionnaireSession>(
      `/projects/${projectId}/questionnaire/${sessionId}/response/${questionId}`, 
      response
    );
  }

  async completeQuestionnaire(projectId: string, sessionId: string): Promise<QuestionnaireSession> {
    return apiService.post<QuestionnaireSession>(`/projects/${projectId}/questionnaire/${sessionId}/complete`, {});
  }

  async getQuestionnaireResponses(projectId: string): Promise<QuestionnaireResponse[]> {
    return apiService.get<QuestionnaireResponse[]>(`/projects/${projectId}/questionnaire/responses`);
  }
}

export const questionnaireService = new QuestionnaireService();
