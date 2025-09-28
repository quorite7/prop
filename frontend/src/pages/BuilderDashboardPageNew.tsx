import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  TextField,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
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
} from '@mui/material';
import {
  Work as WorkIcon,
  Assignment as AssignmentIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { builderInvitationService } from '../services/builderInvitationService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`builder-tabpanel-${index}`}
      aria-labelledby={`builder-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const BuilderDashboardPageNew: React.FC = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Invitation code dialog
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [invitationCode, setInvitationCode] = useState('');
  const [validatingCode, setValidatingCode] = useState(false);
  const [codeError, setCodeError] = useState('');

  useEffect(() => {
    loadBuilderProjects();
  }, []);

  const loadBuilderProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const projectsData = await builderInvitationService.getBuilderProjects();
      setProjects(projectsData);
    } catch (err: any) {
      setError('Failed to load projects. Please try again.');
      console.error('Projects load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAddInvitationCode = async () => {
    if (!invitationCode.trim() || invitationCode.length !== 8) {
      setCodeError('Please enter a valid 8-character invitation code');
      return;
    }

    setValidatingCode(true);
    setCodeError('');

    try {
      // First validate the code
      const validation = await builderInvitationService.validateInvitation(invitationCode.trim().toUpperCase());
      
      if (!validation.valid) {
        setCodeError('Invalid or expired invitation code');
        return;
      }

      // Accept the invitation
      await builderInvitationService.acceptInvitation(invitationCode.trim().toUpperCase());
      
      // Refresh projects list
      await loadBuilderProjects();
      
      // Close dialog and reset
      setInviteDialogOpen(false);
      setInvitationCode('');
      setCodeError('');
      
    } catch (err: any) {
      setCodeError(err.response?.data?.error || 'Failed to add project invitation');
    } finally {
      setValidatingCode(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sow_ready': return 'success';
      case 'in_progress': return 'primary';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  if (loading && projects.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Builder Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setInviteDialogOpen(true)}
        >
          Add Project Invitation
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="builder dashboard tabs">
          <Tab 
            icon={<WorkIcon />} 
            label={`My Projects (${projects.length})`}
            id="builder-tab-0"
            aria-controls="builder-tabpanel-0"
          />
          <Tab 
            icon={<AssignmentIcon />} 
            label="Quotes" 
            id="builder-tab-1"
            aria-controls="builder-tabpanel-1"
          />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {projects.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No projects yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Add a project invitation code to get started
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setInviteDialogOpen(true)}
            >
              Add Project Invitation
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {projects.map((project) => (
              <Grid item xs={12} md={6} lg={4} key={project.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Typography variant="h6" component="h3">
                        {project.projectType?.replace('_', ' ').toUpperCase() || 'General'} - {project.propertyAddress?.line1}
                      </Typography>
                      <Chip 
                        label={project.status?.replace('_', ' ').toUpperCase() || 'ACTIVE'} 
                        color={getStatusColor(project.status || 'active') as any}
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {project.requirements?.description || 'Home Improvement Project'}
                    </Typography>
                    
                    <Typography variant="body2" gutterBottom>
                      {project.propertyAddress?.line1}, {project.propertyAddress?.city}
                    </Typography>
                    
                    {project.requirements?.budget && (
                      <Typography variant="body2" gutterBottom>
                        <strong>Budget:</strong> {formatCurrency(project.requirements.budget.min || 0)} - {formatCurrency(project.requirements.budget.max || 50000)}
                      </Typography>
                    )}
                    
                    <Typography variant="body2" gutterBottom>
                      <strong>Created:</strong> {formatDate(project.createdAt)}
                    </Typography>
                  </CardContent>
                  
                  <CardActions>
                    <Button 
                      size="small" 
                      variant="outlined"
                      onClick={() => navigate(`/app/builder/projects/${project.id}`)}
                    >
                      View Details
                    </Button>
                    <Button 
                      size="small" 
                      variant="contained"
                      onClick={() => navigate(`/app/builder/projects/${project.id}/quote`)}
                    >
                      Submit Quote
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            Quotes functionality coming soon
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage your submitted quotes
          </Typography>
        </Box>
      </TabPanel>

      {/* Add Invitation Code Dialog */}
      <Dialog open={inviteDialogOpen} onClose={() => setInviteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Project Invitation</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Enter the invitation code you received from a homeowner to access their project.
          </Typography>
          
          <TextField
            fullWidth
            label="Invitation Code"
            value={invitationCode}
            onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
            placeholder="Enter 8-character code"
            error={!!codeError}
            helperText={codeError || 'Example: ABC12345'}
            inputProps={{ 
              style: { textTransform: 'uppercase' },
              maxLength: 8 
            }}
            sx={{ mb: 2 }}
          />
          
          <Alert severity="info">
            The invitation code gives you access to view the project details and submit a quote.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setInviteDialogOpen(false);
            setInvitationCode('');
            setCodeError('');
          }}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddInvitationCode} 
            variant="contained"
            disabled={validatingCode || !invitationCode.trim() || invitationCode.length !== 8}
          >
            {validatingCode ? 'Adding...' : 'Add Project'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BuilderDashboardPageNew;
