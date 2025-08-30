import { apiService } from './api';

export interface ProjectType {
  id: string;
  name: string;
  description: string;
  estimatedCost: string;
  estimatedDuration: string;
  complexity: 'low' | 'medium' | 'high' | 'varies';
  requiresPlanning: boolean | 'sometimes' | 'usually' | 'rarely' | 'depends';
  requiresBuildingControl: boolean | 'sometimes' | 'depends';
  tags: string[];
  image?: string;
  categoryKey?: string;
  category?: string;
  categoryIcon?: string;
  categoryDescription?: string;
}

export interface ProjectTypeCategory {
  key: string;
  name: string;
  description: string;
  icon: string;
  projectCount: number;
}

export interface ProjectTypesResponse {
  categories: ProjectTypeCategory[];
  projectsByCategory?: Record<string, { projects: ProjectType[] }>;
  totalProjects: number;
  featuredProjects?: ProjectType[];
}

export interface ProjectTypeSearchResponse {
  searchQuery: string;
  totalResults: number;
  projects: ProjectType[];
  categories: ProjectTypeCategory[];
}

export interface CustomProjectAnalysis {
  originalDescription: string;
  suggestedCategory: {
    key: string;
    name: string;
    description: string;
    icon: string;
  };
  similarProjects: ProjectType[];
  recommendations: string[];
  nextSteps: string[];
}

class ProjectTypesService {
  // Get all project types organized by categories
  async getAllProjectTypes(): Promise<ProjectTypesResponse> {
    return apiService.get<ProjectTypesResponse>('/projects/types');
  }

  // Search project types by query
  async searchProjectTypes(query: string): Promise<ProjectTypeSearchResponse> {
    return apiService.get<ProjectTypeSearchResponse>(`/projects/types?q=${encodeURIComponent(query)}`);
  }

  // Get project types by category
  async getProjectTypesByCategory(categoryKey: string): Promise<{
    category: ProjectTypeCategory;
    projects: ProjectType[];
    totalResults: number;
    allCategories: ProjectTypeCategory[];
  }> {
    return apiService.get(`/projects/types?category=${categoryKey}`);
  }

  // Analyze custom project description
  async analyzeCustomProject(description: string): Promise<CustomProjectAnalysis> {
    return apiService.post<CustomProjectAnalysis>('/projects/analyze-custom', { description });
  }

  // Get project type by ID (helper method)
  async getProjectTypeById(id: string): Promise<ProjectType | null> {
    try {
      const response = await this.getAllProjectTypes();
      
      // Search through all categories for the project
      if (response.projectsByCategory) {
        for (const category of Object.values(response.projectsByCategory)) {
          const project = category.projects.find(p => p.id === id);
          if (project) {
            return project;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting project type by ID:', error);
      return null;
    }
  }

  // Get featured/popular project types
  async getFeaturedProjectTypes(): Promise<ProjectType[]> {
    try {
      const response = await this.getAllProjectTypes();
      return response.featuredProjects || [];
    } catch (error) {
      console.error('Error getting featured project types:', error);
      return [];
    }
  }

  // Helper method to format cost estimate
  formatCostEstimate(cost: string): string {
    if (cost.toLowerCase().includes('varies')) {
      return 'Contact for quote';
    }
    return cost;
  }

  // Helper method to format duration
  formatDuration(duration: string): string {
    if (duration.toLowerCase().includes('varies')) {
      return 'Contact for estimate';
    }
    return duration;
  }

  // Helper method to get complexity color
  getComplexityColor(complexity: string): string {
    switch (complexity.toLowerCase()) {
      case 'low':
        return '#4caf50'; // Green
      case 'medium':
        return '#ff9800'; // Orange
      case 'high':
        return '#f44336'; // Red
      default:
        return '#757575'; // Grey
    }
  }

  // Helper method to get planning permission text
  getPlanningPermissionText(requiresPlanning: ProjectType['requiresPlanning']): string {
    if (typeof requiresPlanning === 'boolean') {
      return requiresPlanning ? 'Usually required' : 'Not required';
    }
    
    switch (requiresPlanning) {
      case 'usually':
        return 'Usually required';
      case 'sometimes':
        return 'Sometimes required';
      case 'rarely':
        return 'Rarely required';
      case 'depends':
        return 'Depends on project';
      default:
        return 'Check with local authority';
    }
  }

  // Helper method to get building control text
  getBuildingControlText(requiresBuildingControl: ProjectType['requiresBuildingControl']): string {
    if (typeof requiresBuildingControl === 'boolean') {
      return requiresBuildingControl ? 'Required' : 'Not required';
    }
    
    switch (requiresBuildingControl) {
      case 'sometimes':
        return 'Sometimes required';
      case 'depends':
        return 'Depends on project';
      default:
        return 'Check requirements';
    }
  }

  // Helper method to get project image URL
  getProjectImageUrl(project: ProjectType): string {
    if (project.image) {
      return project.image;
    }
    
    // Return placeholder image based on category
    const categoryKey = project.categoryKey || 'others';
    return `/images/projects/placeholder-${categoryKey}.jpg`;
  }
}

export const projectTypesService = new ProjectTypesService();
