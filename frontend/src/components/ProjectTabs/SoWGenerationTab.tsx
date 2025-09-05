import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import { Description as DescriptionIcon } from '@mui/icons-material';
import { Project } from '../../services/projectService';
import { apiService } from '../../services/api';

interface SoWGenerationTabProps {
  project: Project;
  isQuestionnaireComplete?: boolean;
}

const SoWGenerationTab: React.FC<SoWGenerationTabProps> = ({ project, isQuestionnaireComplete = false }) => {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sowId, setSowId] = useState<string | null>(project.sowId || null);
  const [error, setError] = useState<string>('');

  const handleGenerateSoW = async () => {
    try {
      setGenerating(true);
      setError('');
      
      const response = await apiService.post(`/projects/${project.id}/sow/generate`, {}) as any;
      setSowId(response.sowId);
      
      // Poll for progress
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await apiService.get(`/projects/${project.id}/sow/${response.sowId}/status`) as any;
          setProgress(statusResponse.progress);
          
          if (statusResponse.status === 'completed') {
            clearInterval(pollInterval);
            setGenerating(false);
            window.location.reload();
          } else if (statusResponse.status === 'failed') {
            clearInterval(pollInterval);
            setGenerating(false);
            setError('SoW generation failed. Please try again.');
          }
        } catch (err) {
          console.error('Status check failed:', err);
        }
      }, 2000);
      
      setTimeout(() => {
        clearInterval(pollInterval);
        if (generating) {
          setGenerating(false);
          setError('Generation timed out. Please try again.');
        }
      }, 35 * 60 * 1000);
      
    } catch (err: any) {
      setGenerating(false);
      setError(err.message || 'Failed to start SoW generation');
    }
  };

  const canGenerateSoW = isQuestionnaireComplete && !generating;

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
          
          {!isQuestionnaireComplete ? (
            <Alert severity="warning" sx={{ mb: 3 }}>
              Complete the project questionnaire first to generate your Scope of Work.
            </Alert>
          ) : project.status === 'sow_ready' ? (
            <Alert severity="success" sx={{ mb: 3 }}>
              Your Scope of Work is ready! View it in the project overview.
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

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {generating && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Generating SoW... {progress}% complete
              </Typography>
              <LinearProgress variant="determinate" value={progress} />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                This process takes approximately 30 minutes
              </Typography>
            </Box>
          )}
          
          <Button
            variant="contained"
            size="large"
            onClick={handleGenerateSoW}
            disabled={!canGenerateSoW || project.status === 'sow_ready'}
            startIcon={generating ? <CircularProgress size={20} /> : <DescriptionIcon />}
          >
            {generating ? 'Generating SoW...' : 
             project.status === 'sow_ready' ? 'SoW Generated' : 
             'Generate Scope of Work'}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SoWGenerationTab;
