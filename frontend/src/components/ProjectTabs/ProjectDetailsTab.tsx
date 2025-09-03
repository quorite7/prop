import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import { 
  Assignment as AssignmentIcon,
  Psychology as AIIcon,
  Reviews as ReviewsIcon,
} from '@mui/icons-material';
import { Project } from '../../services/projectService';
import { questionnaireService } from '../../services/questionnaireService';
import { QuestionnaireSession, QuestionnaireResponse } from '../../types/questionnaire';
import AIQuestionnaire from '../Questionnaire/AIQuestionnaire';
import QuestionnaireReview from '../Questionnaire/QuestionnaireReview';

interface ProjectDetailsTabProps {
  project: Project;
  onQuestionnaireComplete?: () => void;
}

const ProjectDetailsTab: React.FC<ProjectDetailsTabProps> = ({ project, onQuestionnaireComplete }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [session, setSession] = useState<QuestionnaireSession | null>(null);
  const [responses, setResponses] = useState<QuestionnaireResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuestionnaireData();
  }, [project.id]);

  const loadQuestionnaireData = async () => {
    try {
      setLoading(true);
      const questionnaireSession = await questionnaireService.getQuestionnaireSession(project.id);
      if (questionnaireSession) {
        setSession(questionnaireSession);
        setResponses(questionnaireSession.responses);
      } else {
        // No existing session - that's okay, user can start a new one
        console.log('No existing questionnaire session');
        setSession(null);
        setResponses([]);
      }
    } catch (error) {
      console.error('Error loading questionnaire data:', error);
      setSession(null);
      setResponses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionnaireComplete = (completedResponses: QuestionnaireResponse[]) => {
    setResponses(completedResponses);
    // Update session to mark as complete
    if (session) {
      setSession({ ...session, isComplete: true, responses: completedResponses });
    }
    // Notify parent component
    if (onQuestionnaireComplete) {
      onQuestionnaireComplete();
    }
    setActiveTab(1); // Switch to review tab
  };

  const handleResponseUpdate = (updatedResponses: QuestionnaireResponse[]) => {
    setResponses(updatedResponses);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const hasStartedQuestionnaire = session && session.responses.length > 0;
  const isQuestionnaireComplete = session?.isComplete;

  return (
    <Box>
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AIIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">
              AI-Guided Project Details Collection
            </Typography>
          </Box>
          
          <Typography variant="body1" paragraph>
            Our AI assistant will guide you through personalized questions to understand your specific requirements, preferences, and constraints.
          </Typography>
          
          {isQuestionnaireComplete ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              ✅ Questionnaire completed! You can review and edit your responses below.
            </Alert>
          ) : hasStartedQuestionnaire ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              📝 Continue where you left off - {session?.completionPercentage.toFixed(0)}% complete
            </Alert>
          ) : (
            <Alert severity="info" sx={{ mb: 2 }}>
              🚀 Ready to start collecting detailed project information
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab 
            label="Questionnaire" 
            icon={<AssignmentIcon />} 
            iconPosition="start"
          />
          <Tab 
            label={`Review Responses ${responses.length > 0 ? `(${responses.length})` : ''}`}
            icon={<ReviewsIcon />} 
            iconPosition="start"
            disabled={responses.length === 0}
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <AIQuestionnaire 
          project={project}
          onComplete={handleQuestionnaireComplete}
        />
      )}

      {activeTab === 1 && responses.length > 0 && (
        <QuestionnaireReview
          projectId={project.id}
          responses={responses}
          onUpdate={handleResponseUpdate}
        />
      )}
    </Box>
  );
};

export default ProjectDetailsTab;
