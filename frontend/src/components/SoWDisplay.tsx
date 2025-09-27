import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Chip,
  Button,
  Alert,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { sowService, ScopeOfWork } from '../services/sowService';
import SoWGenerationProgress from './SoWGenerationProgress';

const SoWCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
  },
}));

const CostDisplay = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontWeight: 'bold',
}));

interface SoWDisplayProps {
  projectId: string;
  sowId?: string;
  onGenerateNew?: () => void;
  onAcceptSoW?: () => void;
  onProjectUpdate?: () => void;
}

const SoWDisplay: React.FC<SoWDisplayProps> = ({ projectId, sowId, onGenerateNew, onAcceptSoW, onProjectUpdate }) => {
  const [sow, setSow] = useState<ScopeOfWork | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingSowId, setGeneratingSowId] = useState<string | null>(null);

  const handleGenerateSoW = async () => {
    try {
      setError(null);
      setIsGenerating(true);
      const result = await sowService.generateSoW(projectId);
      setGeneratingSowId(result.sowId);
    } catch (error) {
      console.error('Failed to generate SoW:', error);
      setError('Failed to start SoW generation. Please try again.');
      setIsGenerating(false);
    }
  };

  const handleGenerationComplete = (completedSow: ScopeOfWork) => {
    setSow(completedSow);
    setIsGenerating(false);
    setGeneratingSowId(null);
    // Refresh project data to update status
    if (onProjectUpdate) {
      onProjectUpdate();
    }
  };

  const handleGenerationError = (errorMessage: string) => {
    setError(errorMessage);
    setIsGenerating(false);
    setGeneratingSowId(null);
  };

  useEffect(() => {
    const loadSoW = async () => {
      if (!sowId) return;
      
      try {
        setLoading(true);
        setError(null);
        const sowData = await sowService.getSoW(projectId, sowId);
        setSow(sowData);
      } catch (error) {
        console.error('Failed to load SoW:', error);
        setError('Failed to load Statement of Work');
      } finally {
        setLoading(false);
      }
    };

    loadSoW();
  }, [projectId, sowId]);

  // Show generation progress
  if (isGenerating && generatingSowId) {
    return (
      <Box>
        <SoWGenerationProgress
          projectId={projectId}
          sowId={generatingSowId}
          onComplete={handleGenerationComplete}
          onError={handleGenerationError}
        />
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={handleGenerateSoW}
          disabled={isGenerating}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <Typography>Loading Statement of Work...</Typography>
      </Box>
    );
  }

  // Show generate button if no SoW exists
  if (!sow) {
    return (
      <Box textAlign="center" p={4}>
        <Typography variant="h5" gutterBottom>
          Generate Statement of Work
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Create a detailed Statement of Work for your project including scope, timeline, and cost estimates.
        </Typography>
        <Button 
          variant="contained" 
          size="large"
          onClick={handleGenerateSoW}
          disabled={isGenerating}
        >
          Generate SoW
        </Button>
      </Box>
    );
  }

  // Show completed SoW
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          {sow.title}
        </Typography>
        {onGenerateNew && (
          <Button 
            variant="outlined" 
            onClick={onGenerateNew}
            disabled={isGenerating}
          >
            Generate New SoW
          </Button>
        )}
      </Box>
      
      <Grid container spacing={3}>
        {sow.sections.map((section, index) => (
          <Grid item xs={12} key={index}>
            <SoWCard>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  {section.title}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography 
                  variant="body1" 
                  sx={{ 
                    lineHeight: 1.7,
                    whiteSpace: 'pre-line'
                  }}
                >
                  {section.content}
                </Typography>
              </CardContent>
            </SoWCard>
          </Grid>
        ))}

        {sow.generatedAt && (
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Generated on {sowService.formatDate(sow.generatedAt)}
            </Typography>
          </Grid>
        )}

        {onAcceptSoW && (
          <Grid item xs={12}>
            <Box textAlign="center" sx={{ mt: 2 }}>
              <Button 
                variant="contained" 
                size="large"
                color="success"
                onClick={onAcceptSoW}
                sx={{ mr: 2 }}
              >
                Accept This SoW & Invite Builders
              </Button>
              {onGenerateNew && (
                <Button 
                  variant="outlined" 
                  onClick={onGenerateNew}
                  disabled={isGenerating}
                >
                  Generate New SoW
                </Button>
              )}
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default SoWDisplay;
