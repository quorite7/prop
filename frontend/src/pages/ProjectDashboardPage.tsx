import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Alert,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  Settings as SettingsIcon,
  Description as DescriptionIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { useAIAssistant } from '../contexts/AIAssistantContext';
import { projectService, Project } from '../services/projectService';
import ProjectOverviewTab from '../components/ProjectTabs/ProjectOverviewTab';
import ProjectDetailsTab from '../components/ProjectTabs/ProjectDetailsTab';
import SoWGenerationTab from '../components/ProjectTabs/SoWGenerationTab';
import BuilderInvitationTab from '../components/ProjectTabs/BuilderInvitationTab';

// Project status types
type ProjectStatus = 'details_collection' | 'sow_generation' | 'sow_ready' | 'builders_invited' | 'quotes_received' | 'in_progress' | 'completed';

const ProjectDashboardPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { getGuidance } = useAIAssistant();

  const [project, setProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [nextStepGuidance, setNextStepGuidance] = useState<string>('');
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (projectId) {
          // Load specific project
          const projectData = await projectService.getProject(projectId);
          setProject(projectData);
          
          // Get AI guidance for next steps
          const guidance = await getGuidance('project next steps', {
            project: projectData,
            currentStatus: projectData.status,
          });
          setNextStepGuidance(guidance);
        } else {
          // Load all user projects for dashboard view
          const userProjects = await projectService.getUserProjects();
          setProjects(userProjects);
        }
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId, getGuidance]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'primary';
      case 'sow_ready': return 'info';
      case 'details_collection': return 'warning';
      default: return 'default';
    }
  };

  const formatProjectType = (type: string | undefined) => {
    if (!type) return 'Unknown';
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatAddress = (address: Project['propertyAddress']) => {
    return [address?.line1, address?.line2, address?.city, address?.postcode]
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

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          {error}
        </Alert>
        <Button onClick={() => navigate('/app/dashboard')} sx={{ mt: 2 }}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  // If no projectId, show dashboard with all projects
  if (!projectId) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          My Projects
        </Typography>
        
        {projects.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No projects yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Start your home improvement journey by creating your first project
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => navigate('/app/projects/create')}
            >
              Create Your First Project
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {projects.map((proj) => (
              <Grid item xs={12} md={6} lg={4} key={proj.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {proj.requirements?.description || 'Untitled Project'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {formatProjectType(proj.projectType)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {formatAddress(proj.propertyAddress)}
                    </Typography>
                    <Chip 
                      label={(proj.status || 'draft').replace('_', ' ').toUpperCase()} 
                      color={getStatusColor(proj.status || 'draft') as any}
                      size="small"
                    />
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      onClick={() => navigate(`/app/projects/${proj.id}`)}
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        
        {projects.length > 0 && (
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button 
              variant="contained" 
              onClick={() => navigate('/app/projects/create')}
            >
              Create New Project
            </Button>
          </Box>
        )}
      </Container>
    );
  }

  // Single project view
  if (!project) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Project not found
        </Alert>
        <Button onClick={() => navigate('/app/dashboard')} sx={{ mt: 2 }}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  // Tabbed interface for individual project
  const tabs = [
    { label: 'Overview', icon: <TimelineIcon /> },
    { label: 'Details', icon: <SettingsIcon /> },
    { label: 'Scope of Work', icon: <DescriptionIcon /> },
    { label: 'Builders', icon: <PeopleIcon /> },
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <ProjectOverviewTab project={project} />;
      case 1:
        return <ProjectDetailsTab project={project} />;
      case 2:
        return <SoWGenerationTab project={project} />;
      case 3:
        return <BuilderInvitationTab project={project} />;
      default:
        return <ProjectOverviewTab project={project} />;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Project Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h3" component="h1" gutterBottom>
              {formatProjectType(project.projectType || 'unknown')} Project
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {formatAddress(project.propertyAddress || {})}
            </Typography>
          </Box>
          <Chip 
            label={(project.status || 'draft').replace('_', ' ').toUpperCase()} 
            color={getStatusColor(project.status || 'draft') as any}
            size="medium"
          />
        </Box>
      </Box>

      {/* AI Guidance */}
      {nextStepGuidance && (
        <Alert severity="info" sx={{ mb: 4 }} icon={false}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            💡 Next Steps Guidance:
          </Typography>
          <Typography variant="body2">
            {nextStepGuidance}
          </Typography>
        </Alert>
      )}

      {/* Tabbed Interface */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={isMobile ? 'scrollable' : 'fullWidth'}
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
              sx={{ minHeight: 64 }}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box sx={{ mt: 3 }}>
        {renderTabContent()}
      </Box>
    </Container>
  );
};

export default ProjectDashboardPage;
