import React from 'react';
import { Box, Typography } from '@mui/material';

interface PropertyAssessmentStepProps {
  onComplete?: (assessment: any) => void;
  projectType?: any;
  onBack?: () => void;
}

const PropertyAssessmentStep: React.FC<PropertyAssessmentStepProps> = ({ onComplete, projectType, onBack }) => {
  return (
    <Box>
      <Typography variant="h6">Property Assessment</Typography>
      <Typography variant="body2" color="text.secondary">
        This component is under development.
      </Typography>
    </Box>
  );
};

export default PropertyAssessmentStep;
