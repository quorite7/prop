import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  QuestionAnswer as QuestionIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { sowService, ScopeOfWork } from '../services/sowService';
import SoWDisplay from '../components/SoWDisplay';

const SoWReviewPage: React.FC = () => {
  const { projectId, sowId } = useParams<{ projectId: string; sowId: string }>();
  const navigate = useNavigate();
  
  const [sow, setSow] = useState<ScopeOfWork | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectId && sowId) {
      loadSoW();
    }
  }, [projectId, sowId]);

  const loadSoW = async () => {
    try {
      setLoading(true);
      setError(null);
      const sowData = await sowService.getSoW(projectId!, sowId!);
      setSow(sowData);
    } catch (err) {
      setError('Failed to load SoW details. Please try again.');
      console.error('SoW load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !sow) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          {error || 'SoW not found'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Scope of Work Review
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<QuestionIcon />}
            onClick={() => {/* TODO: Implement question dialog */}}
          >
            Ask Question
          </Button>
          <Button
            variant="contained"
            startIcon={<AssignmentIcon />}
            onClick={() => navigate(`/builder/quote/${projectId}/${sowId}`)}
          >
            Submit Quote
          </Button>
        </Box>
      </Box>

      <SoWDisplay 
        projectId={projectId!} 
        sowId={sowId}
      />
    </Container>
  );
};

export default SoWReviewPage;
