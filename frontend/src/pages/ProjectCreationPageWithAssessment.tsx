import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Button,
  useTheme,
  useMediaQuery,
  Alert,
  CircularProgress,
} from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { useAIAssistant } from '../contexts/AIAssistantContext';
import { projectService, CreateProjectData } from '../services/projectService';
import { PropertyAssessment } from '../services/propertyAssessmentService';
import AddressStep from '../components/ProjectCreation/AddressStep';
import PropertyAssessmentStep from '../components/ProjectCreation/PropertyAssessmentStep';
import EnhancedProjectTypeStep from '../components/ProjectCreation/EnhancedProjectTypeStep';
import ProjectVisionStep from '../components/ProjectCreation/ProjectVisionStep';
import DocumentsStep, { LocalDocument } from '../components/ProjectCreation/DocumentsStep';
import ReviewStep from '../components/ProjectCreation/ReviewStep';

const steps = [
  'Property Address',
  'Property Assessment',
  'Project Type',
  'Requirements',
  'Documents',
  'Review & Create',
];

interface ProjectFormData {
  propertyAddress: {
    line1: string;
    line2?: string;
    city: string;
    postcode: string;
    country: string;
  };
  propertyAssessment?: PropertyAssessment;
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

const ProjectCreationPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { getGuidance } = useAIAssistant();

  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<ProjectFormData>({
    propertyAddress: {
      line1: '',
      city: '',
      postcode: '',
      country: 'United Kingdom',
    },
    projectType: '',
    requirements: {
      description: '',
    },
    documents: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Auto-save form data to localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('projectCreationData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
      } catch (e) {
        console.error('Failed to parse saved form data:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('projectCreationData', JSON.stringify(formData));
  }, [formData]);

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleAddressComplete = (addressData: any) => {
    setFormData(prev => ({
      ...prev,
      propertyAddress: addressData,
    }));
    handleNext();
  };

  const handleAssessmentComplete = (assessment: PropertyAssessment) => {
    setFormData(prev => ({
      ...prev,
      propertyAssessment: assessment,
    }));
    handleNext();
  };

  const handleAssessmentError = (error: string) => {
    setError(error);
    // Allow user to continue even if assessment fails
  };

  const handleProjectTypeSelect = (projectType: string) => {
    setFormData(prev => ({
      ...prev,
      projectType,
    }));
    handleNext();
  };

  const handleRequirementsComplete = (requirements: any) => {
    setFormData(prev => ({
      ...prev,
      requirements,
    }));
    handleNext();
  };

  const handleDocumentsComplete = (documents: LocalDocument[]) => {
    setFormData(prev => ({
      ...prev,
      documents,
    }));
    handleNext();
  };

  const handleProjectCreate = async () => {
    setLoading(true);
    setError('');

    try {
      const projectData: CreateProjectData = {
        propertyAddress: formData.propertyAddress,
        projectType: formData.projectType,
        requirements: formData.requirements,
        propertyAssessment: formData.propertyAssessment,
      };

      const project = await projectService.createProject(projectData);
      
      // Clear saved form data
      localStorage.removeItem('projectCreationData');
      
      // Navigate to project dashboard
      navigate(`/app/projects/${project.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0: // Address
        return formData.propertyAddress.line1 && 
               formData.propertyAddress.city && 
               formData.propertyAddress.postcode;
      case 1: // Property Assessment
        return true; // Can proceed even if assessment fails
      case 2: // Project Type
        return formData.projectType;
      case 3: // Requirements
        return formData.requirements.description;
      case 4: // Documents
        return true; // Documents are optional
      case 5: // Review
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <AddressStep
            initialData={formData.propertyAddress}
            onComplete={handleAddressComplete}
            onError={setError}
          />
        );
      case 1:
        return (
          <PropertyAssessmentStep
            address={`${formData.propertyAddress.line1}${formData.propertyAddress.line2 ? ', ' + formData.propertyAddress.line2 : ''}, ${formData.propertyAddress.city}`}
            postcode={formData.propertyAddress.postcode}
            projectType={formData.projectType}
            onAssessmentComplete={handleAssessmentComplete}
            onError={handleAssessmentError}
          />
        );
      case 2:
        return (
          <EnhancedProjectTypeStep
            selectedType={formData.projectType}
            onSelect={handleProjectTypeSelect}
            propertyAssessment={formData.propertyAssessment}
          />
        );
      case 3:
        return (
          <ProjectVisionStep
            projectType={formData.projectType}
            initialData={formData.requirements}
            onComplete={handleRequirementsComplete}
            propertyAssessment={formData.propertyAssessment}
          />
        );
      case 4:
        return (
          <DocumentsStep
            initialDocuments={formData.documents || []}
            onComplete={handleDocumentsComplete}
          />
        );
      case 5:
        return (
          <ReviewStep
            formData={formData}
            onSubmit={handleProjectCreate}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Project
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Let's gather information about your home improvement project
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Stepper 
            activeStep={activeStep} 
            orientation={isMobile ? 'vertical' : 'horizontal'}
            sx={{ mb: 4 }}
          >
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ minHeight: 400 }}>
            {renderStepContent()}
          </Box>

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            mt: 4,
            pt: 2,
            borderTop: '1px solid',
            borderColor: 'divider'
          }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0}
              startIcon={<ArrowBack />}
            >
              Back
            </Button>

            <Box sx={{ display: 'flex', gap: 2 }}>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleProjectCreate}
                  disabled={loading || !canProceed()}
                  startIcon={loading ? <CircularProgress size={20} /> : undefined}
                >
                  {loading ? 'Creating Project...' : 'Create Project'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!canProceed()}
                  endIcon={<ArrowForward />}
                >
                  {activeStep === 1 && !formData.propertyAssessment ? 'Skip Assessment' : 'Next'}
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ProjectCreationPage;
