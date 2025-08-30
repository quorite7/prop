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
  documents?: File[];
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
