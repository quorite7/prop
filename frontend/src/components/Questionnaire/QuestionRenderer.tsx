import React from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Checkbox,
  FormGroup,
  Slider,
  Switch,
} from '@mui/material';
import { QuestionnaireQuestion } from '../../types/questionnaire';

interface QuestionRendererProps {
  question: QuestionnaireQuestion;
  value: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
}

const QuestionRenderer: React.FC<QuestionRendererProps> = ({ question, value, onChange }) => {
  const renderQuestionInput = () => {
    switch (question.type) {
      case 'text':
        return (
          <TextField
            fullWidth
            multiline
            rows={3}
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Please provide your answer..."
            variant="outlined"
          />
        );

      case 'number':
        return (
          <TextField
            fullWidth
            type="number"
            value={value as number}
            onChange={(e) => onChange(Number(e.target.value))}
            variant="outlined"
          />
        );

      case 'multiple_choice':
        return (
          <FormControl component="fieldset">
            <RadioGroup
              value={value as string}
              onChange={(e) => onChange(e.target.value)}
            >
              {question.options?.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={option}
                  control={<Radio />}
                  label={option}
                />
              ))}
            </RadioGroup>
          </FormControl>
        );

      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={value as boolean}
                onChange={(e) => onChange(e.target.checked)}
              />
            }
            label={value ? 'Yes' : 'No'}
          />
        );

      case 'scale':
        return (
          <Box sx={{ px: 2 }}>
            <Slider
              value={value as number}
              onChange={(_, newValue) => onChange(newValue as number)}
              min={1}
              max={10}
              step={1}
              marks
              valueLabelDisplay="on"
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="caption">Not Important</Typography>
              <Typography variant="caption">Very Important</Typography>
            </Box>
          </Box>
        );

      default:
        return (
          <TextField
            fullWidth
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            variant="outlined"
          />
        );
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {question.text}
        {question.required && (
          <Typography component="span" color="error" sx={{ ml: 1 }}>
            *
          </Typography>
        )}
      </Typography>
      
      <Box sx={{ mt: 2 }}>
        {renderQuestionInput()}
      </Box>
    </Box>
  );
};

export default QuestionRenderer;
