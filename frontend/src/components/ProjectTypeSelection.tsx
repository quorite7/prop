import React from 'react';
import { Box, Typography } from '@mui/material';

interface ProjectTypeSelectionProps {
  onSelect?: (type: string) => void;
  selectedType?: any;
}

const ProjectTypeSelection: React.FC<ProjectTypeSelectionProps> = ({ onSelect, selectedType }) => {
  return (
    <Box>
      <Typography variant="h6">Project Type Selection</Typography>
      <Typography variant="body2" color="text.secondary">
        This component is under development.
      </Typography>
    </Box>
  );
};

export default ProjectTypeSelection;
