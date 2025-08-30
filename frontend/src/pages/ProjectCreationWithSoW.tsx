import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Fade
} from '@mui/material';
import {
  Home as HomeIcon,
  Assignment as AssignmentIcon,
  Build as BuildIcon,
  CheckCircle as CheckCircleIcon,
  Timeline as TimelineIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';

// Import existing components
import ProjectTypeSelection from '../components/ProjectTypeSelection';
import PropertyAssessmentStep from '../components/PropertyAssessmentStep';

// Import new SoW components
import SoWQuestionnaire from '../components/SoWQuestionnaire';
import SoWDisplay from '../components/SoWDisplay';

// Import services
import { sowService, ScopeOfWork } from '../services/sowService';
import { propertyAssessmentService } from '../services/propertyAssessmentService';

interface ProjectCreationWithSoWProps {
  onComplete?: (sow: ScopeOfWork) => void;
}

const ProjectCreationWithSoW: React.FC<ProjectCreationWithSoWProps> = ({
  onComplete
}) => {
  // Step management
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Project data
  const [selectedProjectType, setSelectedProjectType] = useState<any>(null);
  const [propertyAssessment, setPropertyAssessment] = useState<any>(null);
  const [questionnaireResponses, setQuestionnaireResponses] = useState<Record<string, any>>({});
  const [generatedSoW, setGeneratedSoW] = useState<ScopeOfWork | null>(null);

  const steps = [
    {
      label: 'Project Type',
      description: 'Select your project type',
      icon: <HomeIcon />
    },
    {
      label: 'Property Assessment',
      description: 'Assess property constraints',
      icon: <AssignmentIcon />
    },
    {
      label: 'Project Requirements',
      description: 'Answer project questions',
      icon: <DescriptionIcon />
    },
    {
      label: 'Generate Scope of Work',
      description: 'Create detailed project plan',
      icon: <TimelineIcon />
    },
    {
      label: 'Review & Proceed',
      description: 'Review and get builder quotes',
      icon: <CheckCircleIcon />
    }
  ];

  const handleProjectTypeSelect = (projectType: any) => {
    setSelectedProjectType(projectType);
    setError(null);
    setActiveStep(1);
  };

  const handlePropertyAssessmentComplete = (assessment: any) => {
    setPropertyAssessment(assessment);
    setError(null);
    setActiveStep(2);
  };

  const handleQuestionnaireComplete = async (responses: Record<string, any>) => {
    try {
      setLoading(true);
      setError(null);
      setQuestionnaireResponses(responses);
      
      // Generate SoW
      const sow = await sowService.generateSoW(
        selectedProjectType.id,
        responses,
        propertyAssessment
      );
      
      setGeneratedSoW(sow);
      setActiveStep(4);
    } catch (error) {
      console.error('Error generating SoW:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate Scope of Work');
    } finally {
      setLoading(false);
    }
  };

  const handleSoWEdit = () => {
    setActiveStep(2); // Go back to questionnaire
  };

  const handleProceedToBuilders = () => {
    if (generatedSoW && onComplete) {
      onComplete(generatedSoW);
    }
  };

  const handleDownloadSoW = async () => {
    try {
      if (!generatedSoW) return;
      
      // This would generate and download a PDF
      // For now, we'll show an alert
      alert('PDF download functionality will be implemented in the next phase');
    } catch (error) {
      console.error('Error downloading SoW:', error);
      setError('Failed to download SoW');
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
      setError(null);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <ProjectTypeSelection
            onSelect={handleProjectTypeSelect}
            selectedType={selectedProjectType}
          />
        );

      case 1:
        return (
          <PropertyAssessmentStep
            projectType={selectedProjectType}
            onComplete={handlePropertyAssessmentComplete}
            onBack={handleBack}
          />
        );

      case 2:
        return (
          <SoWQuestionnaire
            projectTypeId={selectedProjectType.id}
            projectTypeName={selectedProjectType.name}
            onComplete={handleQuestionnaireComplete}
            onBack={handleBack}
            loading={loading}
          />
        );

      case 3:
        return (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h6" gutterBottom>
              Generating Your Scope of Work
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Please wait while we create your detailed project plan...
            </Typography>
          </Box>
        );

      case 4:
        return generatedSoW ? (
          <SoWDisplay
            sow={generatedSoW}
            onEdit={handleSoWEdit}
            onProceedToBuilders={handleProceedToBuilders}
            onDownload={handleDownloadSoW}
          />
        ) : null;

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h4" gutterBottom>
          Create Your Project
        </Typography>
        <Typography variant="subtitle1">
          Get a detailed scope of work and connect with verified builders
        </Typography>
      </Paper>

      {/* Progress Stepper */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                icon={step.icon}
                optional={
                  <Typography variant="caption">
                    {step.description}
                  </Typography>
                }
              >
                {step.label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Error Display */}
      {error && (
        <Fade in={!!error}>
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        </Fade>
      )}

      {/* Step Content */}
      <Fade in={true} key={activeStep}>
        <Box>
          {renderStepContent()}
        </Box>
      </Fade>

      {/* Progress Summary */}
      {activeStep > 0 && (
        <Paper sx={{ p: 3, mt: 4, bgcolor: 'grey.50' }}>
          <Typography variant="h6" gutterBottom>
            Progress Summary
          </Typography>
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {selectedProjectType && (
              <Box>
                <Typography variant="caption" color="textSecondary">
                  Project Type
                </Typography>
                <Typography variant="body2">
                  {selectedProjectType.name}
                </Typography>
              </Box>
            )}
            {propertyAssessment && (
              <Box>
                <Typography variant="caption" color="textSecondary">
                  Property
                </Typography>
                <Typography variant="body2">
                  {propertyAssessment.address}
                </Typography>
              </Box>
            )}
            {generatedSoW && (
              <Box>
                <Typography variant="caption" color="textSecondary">
                  Estimated Cost
                </Typography>
                <Typography variant="body2">
                  {sowService.formatCurrency(generatedSoW.costs.total)}
                </Typography>
              </Box>
            )}
            {generatedSoW && (
              <Box>
                <Typography variant="caption" color="textSecondary">
                  Duration
                </Typography>
                <Typography variant="body2">
                  {generatedSoW.timeline.totalDuration} days
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      )}

      {/* Loading Overlay */}
      {loading && activeStep !== 3 && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6">
              Processing...
            </Typography>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default ProjectCreationWithSoW;
