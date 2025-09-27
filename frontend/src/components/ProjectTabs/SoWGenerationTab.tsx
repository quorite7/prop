import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  Grid,
} from '@mui/material';
import { Description as DescriptionIcon } from '@mui/icons-material';
import { Project } from '../../services/projectService';
import { sowService, ScopeOfWork } from '../../services/sowService';
import SoWDisplay from '../SoWDisplay';
import SoWEditor from '../SoWEditor';

interface SoWGenerationTabProps {
  project: Project;
  isQuestionnaireComplete?: boolean;
  onMoveToBuilderInvitation?: () => void;
  onProjectUpdate?: () => void;
}

const SoWGenerationTab: React.FC<SoWGenerationTabProps> = ({ 
  project, 
  isQuestionnaireComplete = false,
  onMoveToBuilderInvitation,
  onProjectUpdate
}) => {
  const [editMode, setEditMode] = useState(false);
  const [sow, setSow] = useState<ScopeOfWork | null>(null);
  const [accepting, setAccepting] = useState(false);

  const handleSoWGenerated = (generatedSow: ScopeOfWork) => {
    setSow(generatedSow);
  };

  const handleAcceptSoW = async () => {
    try {
      setAccepting(true);
      // Call API to accept SoW and update project status
      await sowService.acceptSoW(project.id, project.sowId || '');
      
      // Move to builder invitation tab
      if (onMoveToBuilderInvitation) {
        onMoveToBuilderInvitation();
      }
    } catch (error) {
      console.error('Failed to accept SoW:', error);
      // Handle error - could show an alert
    } finally {
      setAccepting(false);
    }
  };

  const handleEditSoW = () => {
    setEditMode(true);
  };

  const handleCompleteSoW = () => {
    setEditMode(false);
    if (onMoveToBuilderInvitation) {
      onMoveToBuilderInvitation();
    }
  };

  const handleGenerateNew = () => {
    setSow(null);
  };

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">
              Scope of Work Generation
            </Typography>
          </Box>
          
          {!isQuestionnaireComplete ? (
            <Alert severity="warning" sx={{ mb: 3 }}>
              Complete the project questionnaire first to generate your Scope of Work.
            </Alert>
          ) : project.status === 'sow_ready' ? (
            <Alert severity="success" sx={{ mb: 3 }}>
              Your Scope of Work is ready! You can now invite builders to quote on your project.
            </Alert>
          ) : (
            <>
              <Typography variant="body1" paragraph>
                Generate a comprehensive Scope of Work document based on your project requirements.
              </Typography>
              
              <Alert severity="info" sx={{ mb: 3 }}>
                Our AI will create a detailed specification document that builders can use to provide accurate quotes.
              </Alert>
            </>
          )}
        </CardContent>
      </Card>

      {editMode ? (
        <Card>
          <CardContent>
            <SoWEditor
              projectId={project.id}
              sowId={project.sowId || ''}
              onComplete={handleCompleteSoW}
            />
          </CardContent>
        </Card>
      ) : (
        <Box>
          <SoWDisplay
            projectId={project.id}
            sowId={project.sowId}
            onGenerateNew={handleGenerateNew}
            onAcceptSoW={project.status !== 'sow_ready' ? handleAcceptSoW : undefined}
            onProjectUpdate={onProjectUpdate}
          />
          
          {sow && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Grid container spacing={2} justifyContent="center">
                <Grid item>
                  <Button
                    variant="outlined"
                    onClick={handleEditSoW}
                    startIcon={<DescriptionIcon />}
                  >
                    Edit SoW
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    onClick={handleCompleteSoW}
                    disabled={!isQuestionnaireComplete}
                  >
                    Continue to Builder Invitation
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default SoWGenerationTab;
