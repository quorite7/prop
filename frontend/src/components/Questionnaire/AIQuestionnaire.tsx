import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Alert,
  CircularProgress,
  Chip,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { 
  NavigateNext as NextIcon,
  NavigateBefore as BackIcon,
  Check as CompleteIcon 
} from '@mui/icons-material';
import { Project } from '../../services/projectService';
import { questionnaireService } from '../../services/questionnaireService';
import { QuestionnaireSession, QuestionnaireResponse, QuestionnaireQuestion, AIQuestionnaireResponse } from '../../types/questionnaire';
import QuestionRenderer from './QuestionRenderer';

interface AIQuestionnaireProps {
  project: Project;
  onComplete?: (responses: QuestionnaireResponse[]) => void;
}

const AIQuestionnaire: React.FC<AIQuestionnaireProps> = ({ project, onComplete }) => {
  const [session, setSession] = useState<QuestionnaireSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<AIQuestionnaireResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [currentAnswer, setCurrentAnswer] = useState<string | number | boolean>('');

  useEffect(() => {
    initializeQuestionnaire();
  }, [project.id]);

  const initializeQuestionnaire = async () => {
    try {
      setLoading(true);
      let questionnaireSession: QuestionnaireSession;
      
      const existingSession = await questionnaireService.getQuestionnaireSession(project.id);
      if (existingSession) {
        questionnaireSession = existingSession;
      } else {
        // No existing session, create a new one
        questionnaireSession = await questionnaireService.startQuestionnaire(project.id);
      }
      
      setSession(questionnaireSession);
      
      if (!questionnaireSession.isComplete) {
        await loadNextQuestion(questionnaireSession.id);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to initialize questionnaire');
    } finally {
      setLoading(false);
    }
  };

  const loadNextQuestion = async (sessionId: string) => {
    try {
      const response = await questionnaireService.getNextQuestion(project.id, sessionId);
      setCurrentQuestion(response);
      
      // Load existing answer if available
      const existingResponse = session?.responses.find(r => r.questionId === response.question.id);
      if (existingResponse) {
        setCurrentAnswer(existingResponse.answer);
      } else {
        setCurrentAnswer('');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load question');
    }
  };

  const handleAnswerChange = (answer: string | number | boolean) => {
    setCurrentAnswer(answer);
  };

  const handleNext = async () => {
    if (!session || !currentQuestion) return;
    
    try {
      setSubmitting(true);
      
      const response = {
        questionId: currentQuestion.question.id,
        answer: currentAnswer
      };
      
      const updatedSession = await questionnaireService.submitResponse(
        project.id, 
        session.id, 
        response
      );
      
      setSession(updatedSession);
      
      if (updatedSession.isComplete) {
        if (onComplete) {
          onComplete(updatedSession.responses);
        }
      } else {
        await loadNextQuestion(updatedSession.id);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async () => {
    if (!session) return;
    
    try {
      setSubmitting(true);
      const completedSession = await questionnaireService.completeQuestionnaire(project.id, session.id);
      setSession(completedSession);
      
      if (onComplete) {
        onComplete(completedSession.responses);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to complete questionnaire');
    } finally {
      setSubmitting(false);
    }
  };

  const canProceed = () => {
    if (!currentQuestion) return false;
    if (currentQuestion.question.required && (currentAnswer === '' || currentAnswer === null || currentAnswer === undefined)) {
      return false;
    }
    return true;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        <Button onClick={initializeQuestionnaire} sx={{ ml: 2 }}>
          Retry
        </Button>
      </Alert>
    );
  }

  if (!session) {
    return (
      <Alert severity="warning">
        Unable to load questionnaire session
      </Alert>
    );
  }

  if (session.isComplete) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <CompleteIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Questionnaire Complete!
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Thank you for providing detailed information about your project. 
            We'll use these details to create a comprehensive scope of work.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Responses collected: {session.responses.length}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {/* Progress Indicator */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Progress: {Math.round(session.completionPercentage)}%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Question {session.currentQuestionIndex + 1}
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={session.completionPercentage} 
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>

      {/* Current Question */}
      {currentQuestion && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Question {(session?.currentQuestionIndex || 0) + 1}
              </Typography>
              {currentQuestion.question.isAIGenerated === false && (
                <Chip 
                  label="Standard Questions" 
                  size="small" 
                  color="warning"
                  sx={{ ml: 1 }}
                />
              )}
              {currentQuestion.question.isAIGenerated === true && (
                <Chip 
                  label="AI Generated" 
                  size="small" 
                  color="success"
                  sx={{ ml: 1 }}
                />
              )}
            </Box>
            
            <QuestionRenderer
              question={currentQuestion.question}
              value={currentAnswer}
              onChange={handleAnswerChange}
            />
            
            {currentQuestion.reasoning && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
                💡 {currentQuestion.reasoning}
              </Typography>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                variant="outlined"
                disabled={session.currentQuestionIndex === 0}
                startIcon={<BackIcon />}
              >
                Previous
              </Button>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                {session.completionPercentage >= 80 && (
                  <Button
                    variant="outlined"
                    onClick={handleComplete}
                    disabled={submitting}
                    startIcon={<CompleteIcon />}
                  >
                    Complete Now
                  </Button>
                )}
                
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!canProceed() || submitting}
                  endIcon={submitting ? <CircularProgress size={20} /> : <NextIcon />}
                >
                  {submitting ? 'Submitting...' : 'Next'}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default AIQuestionnaire;
