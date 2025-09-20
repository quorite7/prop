import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Card,
  CardContent,
  Chip,
  Alert
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { sowService } from '../services/sowService';

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
`;

const PulseDot = styled('div')(({ theme }) => ({
  width: 8,
  height: 8,
  backgroundColor: theme.palette.primary.main,
  borderRadius: '50%',
  animation: `${pulse} 2s infinite`,
  marginRight: theme.spacing(1),
}));

const ProgressContainer = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  border: `1px solid ${theme.palette.primary.light}`,
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
}));

const StageMessage = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  color: theme.palette.text.primary,
  animation: 'fadeIn 0.3s ease-in',
  '@keyframes fadeIn': {
    from: { opacity: 0, transform: 'translateY(10px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
}));

interface SoWGenerationProgressProps {
  projectId: string;
  sowId: string;
  onComplete: (sow: any) => void;
  onError: (error: string) => void;
}

const sowStages = [
  { progress: 0, message: "Initializing project analysis...", icon: "🔍" },
  { progress: 25, message: "Reviewing property details and documents...", icon: "📋" },
  { progress: 50, message: "Generating detailed work breakdown...", icon: "⚙️" },
  { progress: 75, message: "Calculating costs and materials...", icon: "💰" },
  { progress: 100, message: "Finalizing Statement of Work...", icon: "✅" }
];

const SoWGenerationProgress: React.FC<SoWGenerationProgressProps> = ({
  projectId,
  sowId,
  onComplete,
  onError
}) => {
  const [status, setStatus] = useState<any>(null);
  const [currentStage, setCurrentStage] = useState(sowStages[0]);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);

  const getCurrentStage = (progress: number) => {
    return sowStages.reverse().find(stage => progress >= stage.progress) || sowStages[0];
  };

  const getTimeRemaining = (estimatedCompletion: string) => {
    const now = new Date().getTime();
    const completion = new Date(estimatedCompletion).getTime();
    const diff = completion - now;
    
    if (diff <= 0) return 'Almost ready...';
    
    const minutes = Math.ceil(diff / 60000);
    return minutes <= 1 ? 'Less than a minute' : `~${minutes} minutes`;
  };

  const pollStatus = async () => {
    try {
      const statusData = await sowService.getSoWStatus(projectId, sowId);
      setStatus(statusData);
      setCurrentStage(getCurrentStage(statusData.progress));
      setTimeRemaining(getTimeRemaining(statusData.estimatedCompletion));
      setRetryCount(0);

      if (statusData.status === 'completed') {
        try {
          const sow = await sowService.getSoW(projectId, sowId);
          onComplete(sow);
        } catch (error) {
          console.error('Failed to fetch completed SoW:', error);
          onError('Failed to load completed Statement of Work');
        }
      } else if (statusData.status === 'failed') {
        onError('SoW generation failed. Please try again.');
      }
    } catch (error) {
      console.error('Failed to poll status:', error);
      if (retryCount < 3) {
        setRetryCount(prev => prev + 1);
      } else {
        onError('Unable to check progress. Please refresh the page.');
      }
    }
  };

  useEffect(() => {
    if (!status || status.status === 'generating') {
      const interval = setInterval(pollStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [projectId, sowId, status, retryCount]);

  useEffect(() => {
    pollStatus(); // Initial poll
  }, []);

  if (!status) {
    return (
      <ProgressContainer>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <PulseDot />
            <Typography variant="h6">Starting SoW generation...</Typography>
          </Box>
          <LinearProgress />
        </CardContent>
      </ProgressContainer>
    );
  }

  return (
    <ProgressContainer>
      <CardContent>
        <Box mb={3}>
          <Typography variant="h5" gutterBottom color="primary">
            Generating Your Statement of Work
          </Typography>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Chip 
              label={`${status.progress}% Complete`} 
              color="primary" 
              variant="outlined"
            />
            <Typography variant="body2" color="text.secondary">
              {timeRemaining}
            </Typography>
          </Box>
        </Box>

        <Box mb={3}>
          <LinearProgress 
            variant="determinate" 
            value={status.progress} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(90deg, #4CAF50, #45a049)',
                borderRadius: 4,
              }
            }}
          />
        </Box>

        <Box display="flex" alignItems="center" mb={2}>
          <Typography variant="h4" sx={{ mr: 1 }}>
            {currentStage.icon}
          </Typography>
          <StageMessage variant="body1">
            {currentStage.message}
          </StageMessage>
        </Box>

        <Box display="flex" alignItems="center" mt={2}>
          <PulseDot />
          <Typography variant="body2" color="text.secondary">
            Working in the background...
          </Typography>
        </Box>

        {retryCount > 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Reconnecting... (Attempt {retryCount}/3)
          </Alert>
        )}
      </CardContent>
    </ProgressContainer>
  );
};

export default SoWGenerationProgress;
