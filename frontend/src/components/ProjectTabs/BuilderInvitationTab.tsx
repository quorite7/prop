import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
} from '@mui/material';
import { People as PeopleIcon } from '@mui/icons-material';
import { Project } from '../../services/projectService';

interface BuilderInvitationTabProps {
  project: Project;
}

const BuilderInvitationTab: React.FC<BuilderInvitationTabProps> = ({ project }) => {
  const handleInviteBuilders = () => {
    // TODO: Implement builder invitation
    console.log('Inviting builders...');
  };

  const canInviteBuilders = project.status === 'sow_ready';

  return (
    <Box>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PeopleIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">
              Builder Invitation
            </Typography>
          </Box>
          
          {!canInviteBuilders ? (
            <Alert severity="warning" sx={{ mb: 3 }}>
              Generate your Scope of Work first before inviting builders.
            </Alert>
          ) : (
            <>
              <Typography variant="body1" paragraph>
                Share your project with qualified builders to receive competitive quotes.
              </Typography>
              
              <Alert severity="info" sx={{ mb: 3 }}>
                We'll match your project with builders who specialize in your type of work and are available in your area.
              </Alert>
            </>
          )}
          
          <Button
            variant="contained"
            size="large"
            onClick={handleInviteBuilders}
            disabled={!canInviteBuilders}
            startIcon={<PeopleIcon />}
          >
            Invite Builders
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default BuilderInvitationTab;
