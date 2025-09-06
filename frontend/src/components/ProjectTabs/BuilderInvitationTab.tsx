import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Grid,
} from '@mui/material';
import {
  People as PeopleIcon,
  Add as AddIcon,
  ContentCopy as CopyIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { Project } from '../../services/projectService';
import { builderInvitationService, BuilderInvitation, ProjectQuote } from '../../services/builderInvitationService';

interface BuilderInvitationTabProps {
  project: Project;
}

const BuilderInvitationTab: React.FC<BuilderInvitationTabProps> = ({ project }) => {
  const [invitations, setInvitations] = useState<BuilderInvitation[]>([]);
  const [quotes, setQuotes] = useState<ProjectQuote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [builderEmail, setBuilderEmail] = useState('');
  const [generatedCode, setGeneratedCode] = useState<{ code: string; expiresAt: string } | null>(null);

  const canInviteBuilders = project.status === 'sow_ready';

  useEffect(() => {
    if (canInviteBuilders) {
      loadInvitations();
      loadQuotes();
    }
  }, [project.id, canInviteBuilders]);

  const loadInvitations = async () => {
    try {
      const data = await builderInvitationService.getProjectInvitations(project.id);
      setInvitations(data);
    } catch (err: any) {
      setError('Failed to load invitations');
    }
  };

  const loadQuotes = async () => {
    try {
      const data = await builderInvitationService.getProjectQuotes(project.id);
      setQuotes(data);
    } catch (err: any) {
      console.error('Failed to load quotes:', err);
    }
  };

  const handleInviteBuilder = async () => {
    if (!builderEmail.trim()) return;

    setLoading(true);
    setError('');

    try {
      const result = await builderInvitationService.generateInvitation(project.id, builderEmail.trim());
      setGeneratedCode({ code: result.invitationCode, expiresAt: result.expiresAt });
      setBuilderEmail('');
      await loadInvitations();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate invitation');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'success';
      case 'pending': return 'warning';
      case 'expired': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  return (
    <Box>
      {/* Invitation Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PeopleIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Builder Invitations</Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setInviteDialogOpen(true)}
              disabled={!canInviteBuilders}
            >
              Invite Builder
            </Button>
          </Box>
          
          {!canInviteBuilders ? (
            <Alert severity="warning" sx={{ mb: 3 }}>
              Generate your Scope of Work first before inviting builders.
            </Alert>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Invite qualified builders to submit quotes for your project. Each invitation includes a secure access code.
            </Typography>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Invitations Table */}
          {invitations.length > 0 && (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Builder Email</TableCell>
                    <TableCell>Invitation Code</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Expires</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invitations.map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell>{invitation.builderEmail}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" fontFamily="monospace">
                            {invitation.invitationCode}
                          </Typography>
                          <Tooltip title="Copy code">
                            <IconButton size="small" onClick={() => copyToClipboard(invitation.invitationCode)}>
                              <CopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={invitation.status} 
                          color={getStatusColor(invitation.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(invitation.createdAt)}</TableCell>
                      <TableCell>{formatDate(invitation.expiresAt)}</TableCell>
                      <TableCell>
                        <Tooltip title="Send email reminder">
                          <IconButton size="small">
                            <EmailIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Quotes Section */}
      {quotes.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Received Quotes ({quotes.length})
            </Typography>
            
            <Grid container spacing={2}>
              {quotes.map((quote) => (
                <Grid item xs={12} md={6} key={quote.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6">
                          {formatCurrency(quote.totalCost)}
                        </Typography>
                        <Chip 
                          label={quote.status} 
                          color={quote.status === 'submitted' ? 'primary' : 'default'}
                          size="small"
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Timeline: {quote.timeline}
                      </Typography>
                      
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {quote.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Labor:</Typography>
                        <Typography variant="body2">{formatCurrency(quote.laborCost)}</Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2">Materials:</Typography>
                        <Typography variant="body2">{formatCurrency(quote.materialsCost)}</Typography>
                      </Box>
                      
                      <Typography variant="caption" color="text.secondary">
                        Submitted: {formatDate(quote.submittedAt)}
                      </Typography>
                      
                      <Box sx={{ mt: 2 }}>
                        <Button variant="outlined" size="small" sx={{ mr: 1 }}>
                          View Details
                        </Button>
                        <Button variant="contained" size="small">
                          Accept Quote
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Invite Builder Dialog */}
      <Dialog open={inviteDialogOpen} onClose={() => setInviteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Invite Builder</DialogTitle>
        <DialogContent>
          {generatedCode ? (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Alert severity="success" sx={{ mb: 3 }}>
                Invitation code generated successfully!
              </Alert>
              
              <Typography variant="h4" sx={{ mb: 2, fontFamily: 'monospace' }}>
                {generatedCode.code}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Share this code with the builder. It expires on {formatDate(generatedCode.expiresAt)}
              </Typography>
              
              <Button
                variant="outlined"
                startIcon={<CopyIcon />}
                onClick={() => copyToClipboard(generatedCode.code)}
                sx={{ mr: 2 }}
              >
                Copy Code
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<EmailIcon />}
                onClick={() => {
                  const subject = 'Project Invitation - Home Improvement Quote Request';
                  const body = `You've been invited to quote on a home improvement project.\n\nInvitation Code: ${generatedCode.code}\n\nThis code expires on ${formatDate(generatedCode.expiresAt)}`;
                  window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                }}
              >
                Send Email
              </Button>
            </Box>
          ) : (
            <>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Enter the builder's email address to generate a secure invitation code.
              </Typography>
              
              <TextField
                fullWidth
                label="Builder Email"
                type="email"
                value={builderEmail}
                onChange={(e) => setBuilderEmail(e.target.value)}
                placeholder="builder@example.com"
                sx={{ mb: 2 }}
              />
              
              <Alert severity="info">
                The builder will receive a unique access code that allows them to view your project and submit a quote.
              </Alert>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setInviteDialogOpen(false);
            setGeneratedCode(null);
            setBuilderEmail('');
          }}>
            {generatedCode ? 'Close' : 'Cancel'}
          </Button>
          {!generatedCode && (
            <Button 
              onClick={handleInviteBuilder} 
              variant="contained"
              disabled={loading || !builderEmail.trim()}
            >
              {loading ? 'Generating...' : 'Generate Invitation'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BuilderInvitationTab;
