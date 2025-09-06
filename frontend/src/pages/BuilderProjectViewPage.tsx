import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Grid,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Description as DescriptionIcon,
  Assignment as AssignmentIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
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
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const BuilderProjectViewPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<any>(null);
  const [sow, setSow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  
  // Quote submission
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [submittingQuote, setSubmittingQuote] = useState(false);
  const [quoteData, setQuoteData] = useState({
    totalCost: '',
    laborCost: '',
    materialsCost: '',
    timeline: '',
    description: '',
  });

  useEffect(() => {
    if (projectId) {
      loadProjectData();
    }
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      const data = await builderInvitationService.getBuilderProject(projectId!);
      setProject(data.project);
      setSow(data.sow);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleQuoteInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuoteData(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmitQuote = async () => {
    if (!quoteData.totalCost || !quoteData.timeline || !quoteData.description) {
      return;
    }

    setSubmittingQuote(true);
    try {
      await builderInvitationService.submitQuote(projectId!, {
        totalCost: parseFloat(quoteData.totalCost),
        laborCost: parseFloat(quoteData.laborCost) || 0,
        materialsCost: parseFloat(quoteData.materialsCost) || 0,
        timeline: quoteData.timeline,
        description: quoteData.description,
      });

      setQuoteDialogOpen(false);
      setQuoteData({
        totalCost: '',
        laborCost: '',
        materialsCost: '',
        timeline: '',
        description: '',
      });
      
      // Show success message or redirect
      navigate('/app/builder/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit quote');
    } finally {
      setSubmittingQuote(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const formatAddress = (address: any) => {
    if (!address) return 'Address not available';
    return [address.line1, address.line2, address.city, address.postcode]
      .filter(Boolean)
      .join(', ');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !project) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Project not found'}
        </Alert>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/app/builder/dashboard')}
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/app/builder/dashboard')}
          sx={{ mb: 2 }}
        >
          Back to Dashboard
        </Button>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {project.requirements?.description || 'Home Improvement Project'}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {formatAddress(project.propertyAddress)}
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<MoneyIcon />}
            onClick={() => setQuoteDialogOpen(true)}
          >
            Submit Quote
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            label="Project Details"
            icon={<DescriptionIcon />}
            iconPosition="start"
          />
          <Tab
            label="Scope of Work"
            icon={<AssignmentIcon />}
            iconPosition="start"
            disabled={!sow}
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Project Information
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Project Type
                  </Typography>
                  <Typography variant="body1">
                    {project.projectType?.replace('_', ' ').toUpperCase() || 'General'}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1">
                    {project.requirements?.description || 'No description provided'}
                  </Typography>
                </Box>
                
                {project.requirements?.budget && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Budget Range
                    </Typography>
                    <Typography variant="body1">
                      {formatCurrency(project.requirements.budget.min || 0)} - {formatCurrency(project.requirements.budget.max || 50000)}
                    </Typography>
                  </Box>
                )}
                
                {project.requirements?.timeline && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Preferred Timeline
                    </Typography>
                    <Typography variant="body1">
                      {project.requirements.timeline}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Property Details
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Address
                  </Typography>
                  <Typography variant="body1">
                    {formatAddress(project.propertyAddress)}
                  </Typography>
                </Box>
                
                {project.requirements?.dimensions && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Dimensions
                    </Typography>
                    <Typography variant="body1">
                      {project.requirements.dimensions.length}m × {project.requirements.dimensions.width}m
                      {project.requirements.dimensions.height && ` × ${project.requirements.dimensions.height}m`}
                    </Typography>
                  </Box>
                )}
                
                {project.requirements?.specialRequirements && project.requirements.specialRequirements.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Special Requirements
                    </Typography>
                    <Typography variant="body1">
                      {project.requirements.specialRequirements.join(', ')}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {sow ? (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Scope of Work
              </Typography>
              
              {sow.scope && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Project Scope
                  </Typography>
                  <Typography variant="body1">
                    {sow.scope.description || 'Scope details not available'}
                  </Typography>
                </Box>
              )}
              
              {sow.items && sow.items.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Work Items
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Item</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell align="right">Estimated Cost</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sow.items.map((item: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{item.name || `Item ${index + 1}`}</TableCell>
                            <TableCell>{item.description || 'No description'}</TableCell>
                            <TableCell align="right">
                              {item.cost ? formatCurrency(item.cost) : 'TBD'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
              
              {sow.timeline && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Timeline
                  </Typography>
                  <Typography variant="body1">
                    {sow.timeline.totalDuration} days estimated
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        ) : (
          <Alert severity="info">
            Scope of Work is not yet available for this project.
          </Alert>
        )}
      </TabPanel>

      {/* Quote Submission Dialog */}
      <Dialog open={quoteDialogOpen} onClose={() => setQuoteDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Submit Your Quote</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total Cost"
                type="number"
                value={quoteData.totalCost}
                onChange={handleQuoteInputChange('totalCost')}
                InputProps={{ startAdornment: '£' }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Timeline"
                value={quoteData.timeline}
                onChange={handleQuoteInputChange('timeline')}
                placeholder="e.g., 2-3 weeks"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Labor Cost"
                type="number"
                value={quoteData.laborCost}
                onChange={handleQuoteInputChange('laborCost')}
                InputProps={{ startAdornment: '£' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Materials Cost"
                type="number"
                value={quoteData.materialsCost}
                onChange={handleQuoteInputChange('materialsCost')}
                InputProps={{ startAdornment: '£' }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Quote Description"
                multiline
                rows={4}
                value={quoteData.description}
                onChange={handleQuoteInputChange('description')}
                placeholder="Describe your approach, materials, timeline, and any additional details..."
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuoteDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitQuote} 
            variant="contained"
            disabled={submittingQuote || !quoteData.totalCost || !quoteData.timeline || !quoteData.description}
          >
            {submittingQuote ? 'Submitting...' : 'Submit Quote'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BuilderProjectViewPage;
