// SoW (Scope of Work) API Service
// Phase 2.2: Basic SoW Generation Implementation

import { apiService } from './api';

export interface QuestionnaireSection {
  id: string;
  title: string;
  questions: Question[];
}

export interface Question {
  id: string;
  type: 'select' | 'multiselect' | 'boolean' | 'textarea' | 'number';
  question: string;
  options?: string[];
  required: boolean;
  placeholder?: string;
}

export interface Questionnaire {
  sections: QuestionnaireSection[];
}

export interface Material {
  category: string;
  item: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  supplier: string;
  notes?: string;
}

export interface CostBreakdown {
  materials: number;
  labour: number;
  additional: number;
  subtotal: number;
  contingency: number;
  total: number;
  breakdown: {
    materialsPercentage: string;
    labourPercentage: string;
    additionalPercentage: string;
    contingencyPercentage: string;
  };
}

export interface TimelinePhase {
  phase: string;
  description: string;
  duration: number;
  startDate: string;
  endDate: string;
  dependencies: string[];
  trades: string[];
  milestones: string[];
}

export interface ScopeOfWork {
  id: string;
  projectTypeId: string;
  generatedAt: string;
  version: string;
  overview: {
    title: string;
    description: string;
    location: string;
    estimatedValue: number;
    estimatedDuration: number;
  };
  scope: {
    workPackages: any[];
    specifications: any;
    exclusions: string[];
  };
  materials: {
    categories: Record<string, Material[]>;
    total: number;
    items: Material[];
  };
  costs: CostBreakdown;
  timeline: {
    phases: TimelinePhase[];
    totalDuration: number;
    startDate: string;
    endDate: string;
  };
  permits: {
    planningPermission: {
      required: boolean;
      reason: string;
      estimatedCost: number;
      estimatedTime: string;
    };
    buildingControl: {
      required: boolean;
      reason: string;
      estimatedCost: number;
      estimatedTime: string;
    };
  };
  standards: any;
  healthSafety: any;
  warranty: any;
}

export interface SoWSummary {
  id: string;
  projectTypeId: string;
  title: string;
  estimatedValue: number;
  createdAt: string;
  updatedAt: string;
  version: string;
}

class SoWService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'https://6zvmy44vl6.execute-api.eu-west-2.amazonaws.com/production';
  }

  // Get questionnaire for specific project type
  async getQuestionnaire(projectTypeId: string): Promise<Questionnaire> {
    try {
      const response = await apiService.post('/sow/questionnaire', {
        projectTypeId
      }) as any;

      if (response.success) {
        return response.questionnaire;
      } else {
        throw new Error(response.error || 'Failed to get questionnaire');
      }
    } catch (error) {
      console.error('Error getting questionnaire:', error);
      throw error;
    }
  }

  // Generate SoW based on questionnaire responses
  async generateSoW(
    projectTypeId: string, 
    responses: Record<string, any>, 
    propertyAssessment?: any
  ): Promise<ScopeOfWork> {
    try {
      const response = await apiService.post('/sow/generate', {
        projectTypeId,
        responses,
        propertyAssessment
      }) as any;

      if (response.success) {
        return response.sow;
      } else {
        throw new Error(response.error || 'Failed to generate Scope of Work');
      }
    } catch (error) {
      console.error('Error generating SoW:', error);
      throw error;
    }
  }

  // Get existing SoW by ID
  async getSoW(sowId: string): Promise<ScopeOfWork> {
    try {
      const response = await apiService.get(`/sow/${sowId}`) as any;

      if (response.success) {
        return response.sow;
      } else {
        throw new Error(response.error || 'Failed to get Scope of Work');
      }
    } catch (error) {
      console.error('Error getting SoW:', error);
      throw error;
    }
  }

  // Update existing SoW
  async updateSoW(
    sowId: string, 
    responses: Record<string, any>, 
    propertyAssessment?: any
  ): Promise<ScopeOfWork> {
    try {
      const response = await apiService.put(`/sow/${sowId}`, {
        responses,
        propertyAssessment
      }) as any;

      if (response.success) {
        return response.sow;
      } else {
        throw new Error(response.error || 'Failed to update Scope of Work');
      }
    } catch (error) {
      console.error('Error updating SoW:', error);
      throw error;
    }
  }

  // List user's SoWs
  async listUserSoWs(): Promise<SoWSummary[]> {
    try {
      const response = await apiService.get('/sow/list') as any;

      if (response.success) {
        return response.sows;
      } else {
        throw new Error(response.error || 'Failed to list Scope of Works');
      }
    } catch (error) {
      console.error('Error listing SoWs:', error);
      throw error;
    }
  }

  // Generate PDF of SoW (placeholder for future implementation)
  async generatePDF(sowId: string): Promise<Blob> {
    try {
      // This would be implemented in a future phase
      throw new Error('PDF generation not yet implemented');
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  // Share SoW (placeholder for future implementation)
  async shareSoW(sowId: string, recipients: string[]): Promise<void> {
    try {
      // This would be implemented in a future phase
      throw new Error('SoW sharing not yet implemented');
    } catch (error) {
      console.error('Error sharing SoW:', error);
      throw error;
    }
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
    }) as any;
  }

  // Calculate project complexity score
  calculateComplexityScore(sow: ScopeOfWork): number {
    let score = 0;
    
    // Base score from cost
    if (sow.costs.total > 50000) score += 3;
    else if (sow.costs.total > 25000) score += 2;
    else score += 1;
    
    // Add score from duration
    if (sow.timeline.totalDuration > 60) score += 3;
    else if (sow.timeline.totalDuration > 30) score += 2;
    else score += 1;
    
    // Add score from permits
    if (sow.permits.planningPermission.required) score += 2;
    if (sow.permits.buildingControl.required) score += 1;
    
    return Math.min(score, 10); // Cap at 10
  }

  // Get complexity label
  getComplexityLabel(score: number): string {
    if (score <= 3) return 'Low';
    if (score <= 6) return 'Medium';
    if (score <= 8) return 'High';
    return 'Very High';
  }

  // Get risk factors from SoW
  getRiskFactors(sow: ScopeOfWork): string[] {
    const risks: string[] = [];
    
    if (sow.permits.planningPermission.required) {
      risks.push('Planning permission required');
    }
    
    if (sow.permits.buildingControl.required) {
      risks.push('Building control approval needed');
    }
    
    if (sow.costs.total > 50000) {
      risks.push('High value project');
    }
    
    if (sow.timeline.totalDuration > 60) {
      risks.push('Extended project duration');
    }
    
    // Check for structural work
    const hasStructural = sow.materials.items.some(item => 
      item.category.toLowerCase().includes('structural')
    );
    if (hasStructural) {
      risks.push('Structural work involved');
    }
    
    return risks;
  }

  // Validate questionnaire responses
  validateResponses(questionnaire: Questionnaire, responses: Record<string, any>): string[] {
    const errors: string[] = [];
    
    questionnaire.sections.forEach(section => {
      section.questions.forEach(question => {
        if (question.required && !responses[question.id]) {
          errors.push(`${question.question} is required`);
        }
      }) as any;
    }) as any;
    
    return errors;
  }

  // Get recommended next steps
  getRecommendedNextSteps(sow: ScopeOfWork): string[] {
    const steps: string[] = [];
    
    if (sow.permits.planningPermission.required) {
      steps.push('Submit planning application');
    }
    
    if (sow.permits.buildingControl.required) {
      steps.push('Apply for building control approval');
    }
    
    steps.push('Get quotes from verified builders');
    steps.push('Review and compare builder proposals');
    steps.push('Check builder credentials and insurance');
    steps.push('Finalize contract terms');
    
    return steps;
  }
}

export const sowService = new SoWService();
