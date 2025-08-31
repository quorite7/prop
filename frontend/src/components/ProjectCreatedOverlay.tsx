import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  LinearProgress,
  Fade,
} from '@mui/material';
import { CheckCircle as CheckIcon } from '@mui/icons-material';

interface ProjectCreatedOverlayProps {
  projectId: string;
  onComplete: () => void;
}

const ProjectCreatedOverlay: React.FC<ProjectCreatedOverlayProps> = ({ projectId, onComplete }) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(5);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleNavigate();
          return 0;
        }
        return prev - 1;
      });
      setProgress((prev) => prev + 20);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleNavigate = () => {
    onComplete();
    navigate(`/app/projects/${projectId}`);
  };

  return (
    <Fade in={true}>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 4,
            maxWidth: 400,
            textAlign: 'center',
            borderRadius: 2,
          }}
        >
          <CheckIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
          
          <Typography variant="h6" gutterBottom>
            Project Created Successfully!
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Let's enhance the details to make it suited to your lovely home.
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ height: 6, borderRadius: 3, mb: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              Redirecting in {timeLeft} seconds...
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            size="large"
            onClick={handleNavigate}
            sx={{ minWidth: 120 }}
          >
            Go &gt;&gt;
          </Button>
        </Paper>
      </Box>
    </Fade>
  );
};

export default ProjectCreatedOverlay;
