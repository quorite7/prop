import React from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
} from '@mui/material';

interface ProjectVisionData {
  description: string;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  materials?: string[];
  timeline?: string;
  budget?: {
    min?: number;
    max?: number;
  };
  specialRequirements?: string[];
}

interface ProjectVisionStepProps {
  data?: ProjectVisionData;
  initialData?: ProjectVisionData;
  projectType: string;
  onChange?: (data: ProjectVisionData) => void;
  onComplete?: (data: ProjectVisionData) => void;
  propertyAssessment?: any;
}

const ProjectVisionStep: React.FC<ProjectVisionStepProps> = ({ 
  data, 
  initialData, 
  projectType, 
  onChange, 
  onComplete,
  propertyAssessment 
}) => {
  const currentData = data || initialData || { description: '' };
  
  const handleChange = (field: keyof ProjectVisionData, value: any) => {
    const newData = { ...currentData, [field]: value };
    if (onChange) onChange(newData);
    if (onComplete) onComplete(newData);
  };

  const handleBudgetChange = (type: 'min' | 'max', value: string) => {
    const numValue = value ? parseInt(value) : undefined;
    const newData = {
      ...currentData,
      budget: {
        min: 0, // Always set min to 0
        max: numValue,
      },
    };
    if (onChange) onChange(newData);
    if (onComplete) onComplete(newData);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Share Your Project Vision
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Tell us about your vision for this {projectType.replace('_', ' ')} project. 
        This high-level overview will help us understand your goals. 
        We'll gather detailed requirements later through our AI assistant.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        💡 Keep it simple! Just share your overall vision and goals. 
        Our AI will help collect specific details in the next phase.
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Project Vision & Goals"
            placeholder="Describe your vision for this project. What do you hope to achieve? What's your dream outcome?"
            value={currentData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            helperText="Share your overall vision, goals, and what success looks like for this project"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Preferred Timeline</InputLabel>
            <Select
              value={currentData.timeline || ''}
              onChange={(e) => handleChange('timeline', e.target.value)}
              label="Preferred Timeline"
            >
              <MenuItem value="asap">As soon as possible</MenuItem>
              <MenuItem value="1-3_months">1-3 months</MenuItem>
              <MenuItem value="3-6_months">3-6 months</MenuItem>
              <MenuItem value="6-12_months">6-12 months</MenuItem>
              <MenuItem value="flexible">Flexible timing</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Budget (£)"
            placeholder="e.g. 50000"
            value={currentData.budget?.max || ''}
            onChange={(e) => handleBudgetChange('max', e.target.value)}
            helperText="What's your total budget for this project?"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProjectVisionStep;
