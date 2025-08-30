import React from 'react';
import {
  Box,
  Typography,
  Paper,
} from '@mui/material';

interface DocumentsStepProps {
  data?: File[];
  onChange?: (documents: File[]) => void;
  onComplete?: (documents: File[]) => void;
  initialDocuments?: File[];
}

const DocumentsStep: React.FC<DocumentsStepProps> = ({ 
  data, 
  onChange, 
  onComplete, 
  initialDocuments 
}) => {
  const currentData = data || initialDocuments || [];

  React.useEffect(() => {
    // Auto-complete with empty documents for now
    if (onComplete) {
      onComplete(currentData);
    }
  }, []);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Documents & Files
      </Typography>
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Document upload feature coming soon.
          You can proceed without uploading documents.
        </Typography>
      </Paper>
    </Box>
  );
};

export default DocumentsStep;
