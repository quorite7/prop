import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
} from '@mui/material';
import { Assignment as AssignmentIcon } from '@mui/icons-material';
import { Project } from '../../services/projectService';

interface ProjectDetailsTabProps {
  project: Project;
}

const ProjectDetailsTab: React.FC<ProjectDetailsTabProps> = ({ project }) => {
  const handleStartQuestionnaire = () => {
    // TODO: Implement AI-guided questionnaire
    console.log('Starting AI questionnaire...');
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AssignmentIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">
              Project Details Collection
            </Typography>
          </Box>
          
          <Typography variant="body1" paragraph>
            Let's gather detailed information about your project to create the perfect scope of work.
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            Our AI assistant will guide you through a series of questions to understand your specific requirements, preferences, and constraints.
          </Alert>
          
          <Button
            variant="contained"
            size="large"
            onClick={handleStartQuestionnaire}
            startIcon={<AssignmentIcon />}
          >
            Start AI Questionnaire
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProjectDetailsTab;
