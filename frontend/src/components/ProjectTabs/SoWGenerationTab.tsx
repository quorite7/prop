import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Description as DescriptionIcon } from '@mui/icons-material';
import { Project } from '../../services/projectService';

interface SoWGenerationTabProps {
  project: Project;
  isQuestionnaireComplete?: boolean;
}

const SoWGenerationTab: React.FC<SoWGenerationTabProps> = ({ project, isQuestionnaireComplete = false }) => {
  const [generating, setGenerating] = useState(false);

  const handleGenerateSoW = async () => {
    setGenerating(true);
    // TODO: Implement SoW generation
    setTimeout(() => {
      setGenerating(false);
      console.log('SoW generated');
    }, 3000);
  };

  const canGenerateSoW = isQuestionnaireComplete;

  return (
    <Box>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">
              Scope of Work Generation
            </Typography>
          </Box>
          
          {!canGenerateSoW ? (
            <Alert severity="warning" sx={{ mb: 3 }}>
              Complete the project questionnaire first to generate your Scope of Work.
            </Alert>
          ) : (
            <>
              <Typography variant="body1" paragraph>
                Generate a comprehensive Scope of Work document based on your project requirements.
              </Typography>
              
              <Alert severity="info" sx={{ mb: 3 }}>
                Our AI will create a detailed specification document that builders can use to provide accurate quotes.
              </Alert>
            </>
          )}
          
          <Button
            variant="contained"
            size="large"
            onClick={handleGenerateSoW}
            disabled={!canGenerateSoW || generating}
            startIcon={generating ? <CircularProgress size={20} /> : <DescriptionIcon />}
          >
            {generating ? 'Generating SoW...' : 'Generate Scope of Work'}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SoWGenerationTab;
