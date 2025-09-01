import { LocalDocument } from '../components/ProjectCreation/DocumentsStep';

export interface ProjectFormData {
  propertyAddress: {
    line1: string;
    line2?: string;
    city: string;
    postcode: string;
    country: string;
  };
  projectType: string;
  requirements: {
    description: string;
    dimensions?: {
      length?: number;
      width?: number;
      height?: number;
    };
    materials?: string[];
    timeline?: string;
    budget?: {
      min?: number;
      max?: number;
    };
    specialRequirements?: string[];
  };
  documents?: LocalDocument[];
}

export interface Requirements {
  description?: string;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  materials?: string[];
  timeline?: string;
  budget?: {
    min?: number;
    max?: number;
  };
  specialRequirements?: string[];
}
