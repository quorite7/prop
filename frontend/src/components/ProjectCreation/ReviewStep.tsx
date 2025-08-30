import React from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
} from '@mui/material';
import { ProjectFormData } from '../../types/project';

interface ReviewStepProps {
  data?: ProjectFormData;
  onChange?: (data: Partial<ProjectFormData>) => void;
  onSubmit?: () => Promise<void>;
  loading?: boolean;
  formData?: ProjectFormData;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ 
  data, 
  formData, 
  onSubmit, 
  loading 
}) => {
  const currentData = data || formData || {} as ProjectFormData;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Review Your Project
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Project Summary
        </Typography>
        <Typography variant="body2">
          Type: {currentData.projectType || 'Not specified'}<br />
          Address: {currentData.propertyAddress?.line1 || 'Not specified'}<br />
          Description: {currentData.requirements?.description || 'Not specified'}
        </Typography>
      </Alert>

      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          What happens next?
        </Typography>
        <Typography variant="body2">
          1. Our AI will analyze your requirements and create a detailed Scope of Work<br />
          2. You'll be able to review and refine the generated scope<br />
          3. Once approved, you can share it with qualified builders to get quotes<br />
          4. Compare quotes and select the best builder for your project
        </Typography>
      </Alert>

      {onSubmit && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={onSubmit}
            disabled={loading}
            sx={{ minWidth: 200 }}
          >
            {loading ? 'Creating Project...' : 'Create Project'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ReviewStep;
