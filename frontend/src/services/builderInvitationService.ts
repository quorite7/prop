import { apiService } from './api';

export interface BuilderInvitation {
  id: string;
  projectId: string;
  invitationCode: string;
  builderEmail: string;
  status: 'pending' | 'accepted' | 'expired';
  createdAt: string;
  expiresAt: string;
  acceptedAt?: string;
  acceptedBy?: string;
}

export interface ProjectQuote {
  id: string;
  projectId: string;
  builderId: string;
  totalCost: number;
  laborCost: number;
  materialsCost: number;
  timeline: string;
  description: string;
  status: 'submitted' | 'accepted' | 'rejected';
  submittedAt: string;
  builderName?: string;
  builderEmail?: string;
}

export const builderInvitationService = {
  // Generate invitation code
  async generateInvitation(projectId: string, builderEmail: string): Promise<{ invitationCode: string; expiresAt: string }> {
    return await apiService.post<{ invitationCode: string; expiresAt: string }>(`/projects/${projectId}/invitations`, { builderEmail });
  },

  // Get project invitations
  async getProjectInvitations(projectId: string): Promise<BuilderInvitation[]> {
    return await apiService.get<BuilderInvitation[]>(`/projects/${projectId}/invitations`);
  },

  // Validate invitation code
  async validateInvitation(invitationCode: string): Promise<{ valid: boolean; projectId?: string; projectTitle?: string }> {
    return await apiService.post<{ valid: boolean; projectId?: string; projectTitle?: string }>('/invitations/validate', { invitationCode });
  },

  // Accept invitation (for existing builders)
  async acceptInvitation(invitationCode: string): Promise<{ success: boolean; projectId: string }> {
    return await apiService.post<{ success: boolean; projectId: string }>('/invitations/accept', { invitationCode });
  },

  // Get builder's accessible projects
  async getBuilderProjects(): Promise<any[]> {
    return await apiService.get<any[]>('/builder/projects');
  },

  // Get project details for builder
  async getBuilderProject(projectId: string): Promise<{ project: any; sow: any }> {
    return await apiService.get<{ project: any; sow: any }>(`/builder/projects/${projectId}`);
  },

  // Submit quote
  async submitQuote(projectId: string, quoteData: {
    totalCost: number;
    laborCost: number;
    materialsCost: number;
    timeline: string;
    description: string;
  }): Promise<ProjectQuote> {
    return await apiService.post<ProjectQuote>(`/builder/projects/${projectId}/quotes`, quoteData);
  },

  // Get project quotes (for project owner)
  async getProjectQuotes(projectId: string): Promise<ProjectQuote[]> {
    return await apiService.get<ProjectQuote[]>(`/projects/${projectId}/quotes`);
  }
};
