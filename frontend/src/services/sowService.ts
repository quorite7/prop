import { apiService } from './api';

export interface ScopeOfWork {
  id: string;
  projectId: string;
  ownerId: string;
  scope: any;
  materials: any;
  timeline: any;
  costs: any;
  permits?: any;
  standards?: any;
  generatedAt: string;
  version: string;
}

class SoWService {
  // Generate SoW for project
  async generateSoW(projectId: string): Promise<{ sowId: string; status: string }> {
    return apiService.post(`/projects/${projectId}/sow/generate`, {});
  }

  // Get SoW generation status
  async getSoWStatus(projectId: string, sowId: string): Promise<{
    sowId: string;
    status: string;
    progress: number;
    estimatedCompletion: string;
  }> {
    return apiService.get(`/projects/${projectId}/sow/${sowId}/status`);
  }

  // Get completed SoW
  async getSoW(projectId: string, sowId: string): Promise<ScopeOfWork> {
    return apiService.get(`/projects/${projectId}/sow/${sowId}`);
  }

  // Format currency for display
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  }

  // Format date for display
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}

export const sowService = new SoWService();
