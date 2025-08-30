import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  TextField,
  Select,
  MenuItem,
  LinearProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  Grid,
  Paper,
  Divider
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
  Build as BuildIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';

interface Question {
  id: string;
  type: 'select' | 'multiselect' | 'boolean' | 'textarea' | 'number';
  question: string;
  options?: string[];
  required: boolean;
  placeholder?: string;
}

interface QuestionnaireSection {
  id: string;
  title: string;
  questions: Question[];
}

interface Questionnaire {
  sections: QuestionnaireSection[];
}

interface SoWQuestionnaireProps {
  projectTypeId: string;
  projectTypeName: string;
  onComplete: (responses: Record<string, any>) => void;
  onBack: () => void;
  loading?: boolean;
}

const SoWQuestionnaire: React.FC<SoWQuestionnaireProps> = ({
  projectTypeId,
  projectTypeName,
  onComplete,
  onBack,
  loading = false
}) => {
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [currentSection, setCurrentSection] = useState(0);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isLoadingQuestionnaire, setIsLoadingQuestionnaire] = useState(true);

  // Load questionnaire for project type
  useEffect(() => {
    loadQuestionnaire();
  }, [projectTypeId]);

  const loadQuestionnaire = async () => {
    try {
      setIsLoadingQuestionnaire(true);
      
      // In a real implementation, this would fetch from the API
      // For now, we'll use mock data based on project type
      const mockQuestionnaire = getMockQuestionnaire(projectTypeId);
      setQuestionnaire(mockQuestionnaire);
    } catch (error) {
      console.error('Error loading questionnaire:', error);
    } finally {
      setIsLoadingQuestionnaire(false);
    }
  };

  const getMockQuestionnaire = (projectTypeId: string): Questionnaire => {
    // Mock questionnaires - in production, these would come from the backend
    const questionnaires: Record<string, Questionnaire> = {
      loft_conversion_dormer: {
        sections: [
          {
            id: 'property_details',
            title: 'Property Details',
            questions: [
              {
                id: 'roof_type',
                type: 'select',
                question: 'What type of roof do you have?',
                options: ['Pitched roof', 'Hip roof', 'Gable roof', 'Not sure'],
                required: true
              },
              {
                id: 'loft_access',
                type: 'select',
                question: 'How do you currently access your loft?',
                options: ['Loft ladder', 'Pull-down ladder', 'Fixed stairs', 'No access'],
                required: true
              },
              {
                id: 'loft_height',
                type: 'select',
                question: 'What is the height at the ridge of your loft?',
                options: ['Less than 2.2m', '2.2m - 2.5m', 'More than 2.5m', 'Not sure'],
                required: true
              }
            ]
          },
          {
            id: 'project_requirements',
            title: 'Project Requirements',
            questions: [
              {
                id: 'intended_use',
                type: 'select',
                question: 'What will you use the converted loft for?',
                options: ['Bedroom', 'Home office', 'Playroom', 'Storage', 'Multiple uses'],
                required: true
              },
              {
                id: 'dormer_type',
                type: 'select',
                question: 'What type of dormer do you prefer?',
                options: ['Flat roof dormer', 'Pitched roof dormer', 'Gable dormer', 'Not sure'],
                required: true
              },
              {
                id: 'bathroom_required',
                type: 'boolean',
                question: 'Do you need a bathroom in the loft?',
                required: true
              }
            ]
          },
          {
            id: 'specifications',
            title: 'Specifications',
            questions: [
              {
                id: 'insulation_preference',
                type: 'select',
                question: 'Insulation preference?',
                options: ['Standard insulation', 'High-performance insulation', 'Eco-friendly materials'],
                required: false
              },
              {
                id: 'window_style',
                type: 'select',
                question: 'Window style preference?',
                options: ['UPVC', 'Timber', 'Aluminium', 'Match existing'],
                required: false
              }
            ]
          }
        ]
      },
      kitchen_renovation_full: {
        sections: [
          {
            id: 'current_kitchen',
            title: 'Current Kitchen',
            questions: [
              {
                id: 'kitchen_size',
                type: 'select',
                question: 'What size is your kitchen?',
                options: ['Small (up to 10m²)', 'Medium (10-15m²)', 'Large (15-25m²)', 'Very large (25m²+)'],
                required: true
              },
              {
                id: 'kitchen_layout',
                type: 'select',
                question: 'Current kitchen layout?',
                options: ['Galley', 'L-shaped', 'U-shaped', 'Island', 'Peninsula', 'Open plan'],
                required: true
              },
              {
                id: 'structural_changes',
                type: 'boolean',
                question: 'Do you want to change the kitchen layout structurally?',
                required: true
              }
            ]
          },
          {
            id: 'new_kitchen_spec',
            title: 'New Kitchen Specification',
            questions: [
              {
                id: 'unit_style',
                type: 'select',
                question: 'Preferred kitchen unit style?',
                options: ['Modern handleless', 'Traditional shaker', 'Contemporary', 'Rustic/farmhouse'],
                required: true
              },
              {
                id: 'worktop_material',
                type: 'select',
                question: 'Preferred worktop material?',
                options: ['Quartz', 'Granite', 'Solid wood', 'Laminate', 'Corian', 'Stainless steel'],
                required: true
              },
              {
                id: 'appliances_included',
                type: 'multiselect',
                question: 'Which appliances do you need?',
                options: ['Oven', 'Hob', 'Extractor hood', 'Dishwasher', 'Fridge/freezer', 'Washing machine'],
                required: true
              }
            ]
          }
        ]
      },
      default: {
        sections: [
          {
            id: 'project_overview',
            title: 'Project Overview',
            questions: [
              {
                id: 'project_description',
                type: 'textarea',
                question: 'Please describe your project in detail',
                required: true,
                placeholder: 'Provide as much detail as possible about what you want to achieve...'
              },
              {
                id: 'budget_range',
                type: 'select',
                question: 'What is your budget range?',
                options: ['Under £5,000', '£5,000 - £15,000', '£15,000 - £30,000', '£30,000 - £50,000', 'Over £50,000'],
                required: true
              },
              {
                id: 'timeline',
                type: 'select',
                question: 'When would you like to start?',
                options: ['ASAP', 'Within 1 month', '1-3 months', '3-6 months', '6+ months'],
                required: true
              }
            ]
          }
        ]
      }
    };

    return questionnaires[projectTypeId] || questionnaires.default;
  };

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));

    // Clear validation error for this question
    if (validationErrors[questionId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const validateSection = (sectionIndex: number): boolean => {
    if (!questionnaire) return false;

    const section = questionnaire.sections[sectionIndex];
    const errors: Record<string, string> = {};
    let isValid = true;

    section.questions.forEach(question => {
      if (question.required && !responses[question.id]) {
        errors[question.id] = 'This field is required';
        isValid = false;
      }
    });

    setValidationErrors(errors);
    return isValid;
  };

  const handleNext = () => {
    if (validateSection(currentSection)) {
      if (questionnaire && currentSection < questionnaire.sections.length - 1) {
        setCurrentSection(currentSection + 1);
      } else {
        handleComplete();
      }
    }
  };

  const handleBack = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    } else {
      onBack();
    }
  };

  const handleComplete = () => {
    if (questionnaire && validateSection(currentSection)) {
      onComplete(responses);
    }
  };

  const renderQuestion = (question: Question) => {
    const value = responses[question.id];
    const error = validationErrors[question.id];

    switch (question.type) {
      case 'select':
        return (
          <FormControl fullWidth error={!!error}>
            <FormLabel>{question.question}</FormLabel>
            <Select
              value={value || ''}
              onChange={(e) => handleResponseChange(question.id, e.target.value)}
              displayEmpty
            >
              <MenuItem value="">
                <em>Please select...</em>
              </MenuItem>
              {question.options?.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            {error && <Typography variant="caption" color="error">{error}</Typography>}
          </FormControl>
        );

      case 'multiselect':
        return (
          <FormControl fullWidth error={!!error}>
            <FormLabel>{question.question}</FormLabel>
            <Box sx={{ mt: 1 }}>
              {question.options?.map((option) => (
                <FormControlLabel
                  key={option}
                  control={
                    <Checkbox
                      checked={value?.includes(option) || false}
                      onChange={(e) => {
                        const currentValues = value || [];
                        const newValues = e.target.checked
                          ? [...currentValues, option]
                          : currentValues.filter((v: string) => v !== option);
                        handleResponseChange(question.id, newValues);
                      }}
                    />
                  }
                  label={option}
                />
              ))}
            </Box>
            {error && <Typography variant="caption" color="error">{error}</Typography>}
          </FormControl>
        );

      case 'boolean':
        return (
          <FormControl error={!!error}>
            <FormLabel>{question.question}</FormLabel>
            <RadioGroup
              value={value || ''}
              onChange={(e) => handleResponseChange(question.id, e.target.value === 'true')}
            >
              <FormControlLabel value="true" control={<Radio />} label="Yes" />
              <FormControlLabel value="false" control={<Radio />} label="No" />
            </RadioGroup>
            {error && <Typography variant="caption" color="error">{error}</Typography>}
          </FormControl>
        );

      case 'textarea':
        return (
          <FormControl fullWidth error={!!error}>
            <FormLabel>{question.question}</FormLabel>
            <TextField
              multiline
              rows={4}
              value={value || ''}
              onChange={(e) => handleResponseChange(question.id, e.target.value)}
              placeholder={question.placeholder}
              sx={{ mt: 1 }}
            />
            {error && <Typography variant="caption" color="error">{error}</Typography>}
          </FormControl>
        );

      case 'number':
        return (
          <FormControl fullWidth error={!!error}>
            <FormLabel>{question.question}</FormLabel>
            <TextField
              type="number"
              value={value || ''}
              onChange={(e) => handleResponseChange(question.id, e.target.value)}
              sx={{ mt: 1 }}
            />
            {error && <Typography variant="caption" color="error">{error}</Typography>}
          </FormControl>
        );

      default:
        return null;
    }
  };

  if (isLoadingQuestionnaire) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <LinearProgress sx={{ mb: 2 }} />
        <Typography>Loading questionnaire...</Typography>
      </Box>
    );
  }

  if (!questionnaire) {
    return (
      <Alert severity="error">
        Failed to load questionnaire. Please try again.
      </Alert>
    );
  }

  const currentSectionData = questionnaire.sections[currentSection];
  const progress = ((currentSection + 1) / questionnaire.sections.length) * 100;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.main', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AssignmentIcon sx={{ mr: 2 }} />
          <Typography variant="h5">
            Project Requirements
          </Typography>
        </Box>
        <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
          {projectTypeName}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Section {currentSection + 1} of {questionnaire.sections.length}: {currentSectionData.title}
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.3)',
              '& .MuiLinearProgress-bar': {
                bgcolor: 'white'
              }
            }}
          />
        </Box>
      </Paper>

      {/* Progress Stepper */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={currentSection} orientation="horizontal">
            {questionnaire.sections.map((section, index) => (
              <Step key={section.id}>
                <StepLabel>
                  <Typography variant="caption">
                    {section.title}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Current Section */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {currentSectionData.title}
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            {currentSectionData.questions.map((question, index) => (
              <Grid item xs={12} key={question.id}>
                <Box sx={{ mb: 3 }}>
                  {renderQuestion(question)}
                  {question.required && (
                    <Chip 
                      label="Required" 
                      size="small" 
                      color="primary" 
                      sx={{ mt: 1 }} 
                    />
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="outlined"
          onClick={handleBack}
          startIcon={<BuildIcon />}
        >
          {currentSection === 0 ? 'Back to Project Type' : 'Previous Section'}
        </Button>

        <Button
          variant="contained"
          onClick={handleNext}
          disabled={loading}
          endIcon={currentSection === questionnaire.sections.length - 1 ? <CheckCircleIcon /> : <TimelineIcon />}
        >
          {loading ? 'Generating...' : 
           currentSection === questionnaire.sections.length - 1 ? 'Generate Scope of Work' : 'Next Section'}
        </Button>
      </Box>

      {/* Summary of responses */}
      {Object.keys(responses).length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Your Responses Summary
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(responses).map(([key, value]) => (
                <Grid item xs={12} sm={6} key={key}>
                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="caption" color="textSecondary">
                      {key.replace(/_/g, ' ').toUpperCase()}
                    </Typography>
                    <Typography variant="body2">
                      {Array.isArray(value) ? value.join(', ') : String(value)}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default SoWQuestionnaire;
