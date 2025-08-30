export interface PropertyDetails {
  address: string;
  postcode: string;
  uprn?: string; // Unique Property Reference Number
  councilArea: string;
  councilWebsite: string;
  propertyType: 'detached' | 'semi-detached' | 'terraced' | 'flat' | 'bungalow' | 'other';
  buildYear?: number;
  floorArea?: number;
  bedrooms?: number;
  bathrooms?: number;
}

export interface ConservationAreaInfo {
  isInConservationArea: boolean;
  conservationAreaName?: string;
  conservationAreaDesignation?: string;
  restrictions?: string[];
  contactOfficer?: string;
  additionalInfo?: string;
}

export interface ListedBuildingInfo {
  isListedBuilding: boolean;
  listingGrade?: 'I' | 'II*' | 'II';
  listingDate?: string;
  historicalSignificance?: string;
  restrictions?: string[];
  heritageOfficer?: string;
  additionalInfo?: string;
}

export interface PlanningConstraints {
  articleFourDirection?: boolean;
  treePreservationOrder?: boolean;
  floodRisk?: 'low' | 'medium' | 'high';
  greenBelt?: boolean;
  nationalPark?: boolean;
  areaOfOutstandingNaturalBeauty?: boolean;
  sitesOfSpecialScientificInterest?: boolean;
  additionalConstraints?: string[];
}

export interface PropertyAssessment {
  property: PropertyDetails;
  conservationArea: ConservationAreaInfo;
  listedBuilding: ListedBuildingInfo;
  planningConstraints: PlanningConstraints;
  permitRequirements: {
    planningPermissionLikely: boolean;
    buildingRegulationsRequired: boolean;
    partyWallAgreement?: boolean;
    additionalConsents?: string[];
  };
  recommendations: string[];
  lastUpdated: string;
  dataSource: string;
}

export interface CouncilApiResponse {
  success: boolean;
  data?: {
    property: PropertyDetails;
    conservation_area: {
      in_conservation_area: boolean;
      area_name?: string;
      designation?: string;
      restrictions?: string[];
      contact_officer?: string;
      additional_info?: string;
    };
    listed_building: {
      is_listed: boolean;
      grade?: string;
      listing_date?: string;
      significance?: string;
      restrictions?: string[];
      heritage_officer?: string;
      additional_info?: string;
    };
    planning_constraints: {
      article_four?: boolean;
      tpo?: boolean;
      flood_risk?: string;
      green_belt?: boolean;
      national_park?: boolean;
      aonb?: boolean;
      sssi?: boolean;
      additional?: string[];
    };
    permit_requirements: {
      planning_permission_likely: boolean;
      building_regulations_required: boolean;
      party_wall_agreement?: boolean;
      additional_consents?: string[];
    };
    recommendations?: string[];
  };
  error?: string;
  message?: string;
}

class PropertyAssessmentService {
  private baseUrl = process.env.REACT_APP_API_URL || 'https://6zvmy44vl6.execute-api.eu-west-2.amazonaws.com/production';
  private councilApiUrl = 'https://mycouncil.com/api';

  /**
   * Get comprehensive property assessment including conservation and listed building status
   */
  async assessProperty(address: string, postcode: string): Promise<PropertyAssessment> {
    try {
      // First, try to get property details from our backend which integrates with mycouncil.com
      const response = await fetch(`${this.baseUrl}/property/assess`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify({
          address: address.trim(),
          postcode: postcode.trim().toUpperCase(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Property assessment failed: ${response.statusText}`);
      }

      const result: CouncilApiResponse = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to retrieve property information');
      }

      // Transform the API response to our internal format
      return this.transformCouncilResponse(result.data);
    } catch (error) {
      console.error('Property assessment error:', error);
      
      // Fallback to basic property lookup if full assessment fails
      try {
        return await this.basicPropertyLookup(address, postcode);
      } catch (fallbackError) {
        throw new Error(`Property assessment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  /**
   * Get property details by postcode (for address validation)
   */
  async getPropertiesByPostcode(postcode: string): Promise<PropertyDetails[]> {
    try {
      const response = await fetch(`${this.baseUrl}/property/lookup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify({
          postcode: postcode.trim().toUpperCase(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Property lookup failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.properties || [];
    } catch (error) {
      console.error('Property lookup error:', error);
      return [];
    }
  }

  /**
   * Validate UK postcode format
   */
  validatePostcode(postcode: string): boolean {
    const ukPostcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i;
    return ukPostcodeRegex.test(postcode.trim());
  }

  /**
   * Get planning guidance based on property assessment
   */
  getPlanningGuidance(assessment: PropertyAssessment, projectType: string): string[] {
    const guidance: string[] = [];

    if (assessment.conservationArea.isInConservationArea) {
      guidance.push(
        `Your property is in ${assessment.conservationArea.conservationAreaName} Conservation Area. ` +
        'Additional planning considerations apply for external alterations.'
      );
    }

    if (assessment.listedBuilding.isListedBuilding) {
      guidance.push(
        `Your property is a Grade ${assessment.listedBuilding.listingGrade} Listed Building. ` +
        'Listed Building Consent may be required for internal and external alterations.'
      );
    }

    if (assessment.planningConstraints.greenBelt) {
      guidance.push(
        'Your property is in the Green Belt. Extensions and outbuildings have strict size limitations.'
      );
    }

    if (assessment.planningConstraints.floodRisk === 'high') {
      guidance.push(
        'Your property is in a high flood risk area. Flood resilience measures may be required.'
      );
    }

    if (assessment.permitRequirements.planningPermissionLikely) {
      guidance.push(
        'Planning permission is likely required for this type of project at your property.'
      );
    }

    if (assessment.permitRequirements.buildingRegulationsRequired) {
      guidance.push(
        'Building Regulations approval will be required for this project.'
      );
    }

    if (assessment.permitRequirements.partyWallAgreement) {
      guidance.push(
        'A Party Wall Agreement may be required if work affects shared walls with neighbors.'
      );
    }

    // Add project-specific guidance
    guidance.push(...this.getProjectSpecificGuidance(projectType, assessment));

    return guidance;
  }

  /**
   * Transform Council API response to our internal format
   */
  private transformCouncilResponse(data: any): PropertyAssessment {
    return {
      property: data.property,
      conservationArea: {
        isInConservationArea: data.conservation_area.in_conservation_area,
        conservationAreaName: data.conservation_area.area_name,
        conservationAreaDesignation: data.conservation_area.designation,
        restrictions: data.conservation_area.restrictions || [],
        contactOfficer: data.conservation_area.contact_officer,
        additionalInfo: data.conservation_area.additional_info,
      },
      listedBuilding: {
        isListedBuilding: data.listed_building.is_listed,
        listingGrade: data.listed_building.grade as 'I' | 'II*' | 'II',
        listingDate: data.listed_building.listing_date,
        historicalSignificance: data.listed_building.significance,
        restrictions: data.listed_building.restrictions || [],
        heritageOfficer: data.listed_building.heritage_officer,
        additionalInfo: data.listed_building.additional_info,
      },
      planningConstraints: {
        articleFourDirection: data.planning_constraints.article_four,
        treePreservationOrder: data.planning_constraints.tpo,
        floodRisk: data.planning_constraints.flood_risk as 'low' | 'medium' | 'high',
        greenBelt: data.planning_constraints.green_belt,
        nationalPark: data.planning_constraints.national_park,
        areaOfOutstandingNaturalBeauty: data.planning_constraints.aonb,
        sitesOfSpecialScientificInterest: data.planning_constraints.sssi,
        additionalConstraints: data.planning_constraints.additional || [],
      },
      permitRequirements: data.permit_requirements,
      recommendations: data.recommendations || [],
      lastUpdated: new Date().toISOString(),
      dataSource: 'mycouncil.com',
    };
  }

  /**
   * Basic property lookup fallback
   */
  private async basicPropertyLookup(address: string, postcode: string): Promise<PropertyAssessment> {
    // This is a fallback that provides basic property info without full council integration
    return {
      property: {
        address,
        postcode: postcode.toUpperCase(),
        councilArea: 'Unknown Council',
        councilWebsite: '',
        propertyType: 'other',
      },
      conservationArea: {
        isInConservationArea: false,
      },
      listedBuilding: {
        isListedBuilding: false,
      },
      planningConstraints: {},
      permitRequirements: {
        planningPermissionLikely: true, // Conservative assumption
        buildingRegulationsRequired: true,
      },
      recommendations: [
        'Property assessment data is limited. Please verify conservation area and listed building status with your local council.',
        'We recommend consulting with your local planning authority before proceeding with major alterations.',
      ],
      lastUpdated: new Date().toISOString(),
      dataSource: 'basic_lookup',
    };
  }

  /**
   * Get project-specific planning guidance
   */
  private getProjectSpecificGuidance(projectType: string, assessment: PropertyAssessment): string[] {
    const guidance: string[] = [];

    switch (projectType) {
      case 'loft_conversion_dormer':
        if (assessment.conservationArea.isInConservationArea) {
          guidance.push('Dormer windows in conservation areas require careful design consideration.');
        }
        guidance.push('Loft conversions typically require Building Regulations approval for structural work and fire safety.');
        break;

      case 'rear_extension_single_storey':
        guidance.push('Single storey rear extensions may fall under Permitted Development Rights if within size limits.');
        if (assessment.planningConstraints.greenBelt) {
          guidance.push('Green Belt restrictions limit extension sizes to 50% of the original dwelling.');
        }
        break;

      case 'rear_extension_double_storey':
        guidance.push('Double storey extensions typically require planning permission.');
        guidance.push('Consider neighbor consultation requirements for two-storey extensions.');
        break;

      default:
        guidance.push('Consult with your local planning authority for project-specific requirements.');
    }

    return guidance;
  }

  /**
   * Get authentication token for API calls
   */
  private getAuthToken(): string {
    return localStorage.getItem('authToken') || '';
  }
}

export const propertyAssessmentService = new PropertyAssessmentService();
