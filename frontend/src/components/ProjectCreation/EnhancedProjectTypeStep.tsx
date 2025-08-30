import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  TextField,
  InputAdornment,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  // Accordion,
  // AccordionSummary,
  // AccordionDetails,
  IconButton,
  // Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  // ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  // Build as BuildIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  Gavel as GavelIcon,
  Security as SecurityIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { projectTypesService, ProjectType, ProjectTypeCategory } from '../../services/projectTypesService';

interface EnhancedProjectTypeStepProps {
  selectedType?: string;
  selectedProjectType?: string;
  onSelect?: (projectType: string) => void;
  onProjectTypeChange?: (projectType: string) => void;
  onNext?: () => void;
  onBack?: () => void;
  propertyAssessment?: any;
}

const EnhancedProjectTypeStep: React.FC<EnhancedProjectTypeStepProps> = ({
  selectedType,
  selectedProjectType,
  onSelect,
  onProjectTypeChange,
  onNext,
  onBack,
  propertyAssessment,
}) => {
  // Unified selected value and handler
  const currentSelected = selectedType || selectedProjectType || '';
  const handleSelection = (projectType: string) => {
    if (onSelect) onSelect(projectType);
    if (onProjectTypeChange) onProjectTypeChange(projectType);
  };

  const [categories, setCategories] = useState<ProjectTypeCategory[]>([]);
  const [allProjects, setAllProjects] = useState<ProjectType[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectType[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [customProjectDialog, setCustomProjectDialog] = useState(false);
  const [customDescription, setCustomDescription] = useState('');
  const [analyzingCustom, setAnalyzingCustom] = useState(false);

  useEffect(() => {
    loadProjectTypes();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [searchQuery, selectedCategory, allProjects]);

  const loadProjectTypes = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await projectTypesService.getAllProjectTypes();
      setCategories(response.categories);
      setFeaturedProjects(response.featuredProjects || []);
      
      // Flatten all projects from categories
      const projects: ProjectType[] = [];
      if (response.projectsByCategory) {
        Object.entries(response.projectsByCategory).forEach(([categoryKey, categoryData]) => {
          const categoryInfo = response.categories.find(c => c.key === categoryKey);
          categoryData.projects.forEach(project => {
            projects.push({
              ...project,
              categoryKey,
              category: categoryInfo?.name,
              categoryIcon: categoryInfo?.icon,
              categoryDescription: categoryInfo?.description,
            });
          });
        });
      }
      
      setAllProjects(projects);
      setFilteredProjects(projects);
    } catch (err: any) {
      setError(err.message || 'Failed to load project types');
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = allProjects;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(project => project.categoryKey === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.tags.some(tag => tag.toLowerCase().includes(query)) ||
        (project.category && project.category.toLowerCase().includes(query))
      );
    }

    setFilteredProjects(filtered);
  };

  const handleProjectSelect = (project: ProjectType) => {
    setSelectedProject(project);
    handleSelection(project.id);
  };

  const handleViewDetails = (project: ProjectType) => {
    setSelectedProject(project);
    setDetailsDialogOpen(true);
  };

  const handleCustomProject = async () => {
    if (!customDescription.trim()) {
      return;
    }

    try {
      setAnalyzingCustom(true);
      const analysis = await projectTypesService.analyzeCustomProject(customDescription);
      
      // Create a custom project type based on analysis
      const customProject: ProjectType = {
        id: 'custom_project',
        name: 'Custom Project',
        description: customDescription,
        estimatedCost: 'Varies',
        estimatedDuration: 'Varies',
        complexity: 'varies',
        requiresPlanning: 'depends',
        requiresBuildingControl: 'depends',
        tags: ['custom', 'bespoke'],
        categoryKey: analysis.suggestedCategory.key,
        category: analysis.suggestedCategory.name,
        categoryIcon: analysis.suggestedCategory.icon,
      };

      handleProjectSelect(customProject);
      setCustomProjectDialog(false);
      setCustomDescription('');
    } catch (err: any) {
      setError(err.message || 'Failed to analyze custom project');
    } finally {
      setAnalyzingCustom(false);
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity.toLowerCase()) {
      case 'low': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'high': return '#f44336';
      default: return '#757575';
    }
  };

  const getPlanningText = (requiresPlanning: ProjectType['requiresPlanning']) => {
    if (typeof requiresPlanning === 'boolean') {
      return requiresPlanning ? 'Usually required' : 'Not required';
    }
    return requiresPlanning === 'usually' ? 'Usually required' :
           requiresPlanning === 'sometimes' ? 'Sometimes required' :
           requiresPlanning === 'rarely' ? 'Rarely required' : 'Check requirements';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading comprehensive project types...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
        <Button onClick={loadProjectTypes} sx={{ ml: 2 }}>
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        What type of project are you planning?
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Choose from our comprehensive range of UK home improvement projects. Each project type includes detailed cost estimates, timelines, and regulatory requirements.
      </Typography>

      {/* Search and Filter Controls */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search project types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Tabs
              value={selectedCategory}
              onChange={(_, value) => setSelectedCategory(value)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="All" value="all" />
              {categories.map((category) => (
                <Tab
                  key={category.key}
                  label={`${category.icon} ${category.name.split(' ')[0]}`}
                  value={category.key}
                />
              ))}
            </Tabs>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setCustomProjectDialog(true)}
              startIcon={<CategoryIcon />}
            >
              Custom Project
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Featured Projects (when no search/filter) */}
      {!searchQuery && selectedCategory === 'all' && featuredProjects.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            🌟 Popular Projects
          </Typography>
          <Grid container spacing={2}>
            {featuredProjects.map((project) => (
              <Grid item xs={12} sm={6} md={3} key={project.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: currentSelected === project.id ? 2 : 1,
                    borderColor: currentSelected === project.id ? 'primary.main' : 'divider',
                    '&:hover': { boxShadow: 3 },
                  }}
                  onClick={() => handleProjectSelect(project)}
                >
                  <CardMedia
                    component="div"
                    sx={{
                      height: 120,
                      background: 'linear-gradient(45deg, #f5f5f5, #e0e0e0)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                    }}
                  >
                    {project.categoryIcon}
                  </CardMedia>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle2" noWrap>
                      {project.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      {project.estimatedCost}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Project Results */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {searchQuery ? `Search Results (${filteredProjects.length})` : 
           selectedCategory !== 'all' ? 
           `${categories.find(c => c.key === selectedCategory)?.name} (${filteredProjects.length})` :
           `All Project Types (${filteredProjects.length})`}
        </Typography>

        {filteredProjects.length === 0 ? (
          <Alert severity="info">
            No project types found matching your criteria. Try adjusting your search or use the "Custom Project" option.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {filteredProjects.map((project) => (
              <Grid item xs={12} sm={6} md={4} key={project.id}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    border: currentSelected === project.id ? 2 : 1,
                    borderColor: currentSelected === project.id ? 'primary.main' : 'divider',
                    '&:hover': { boxShadow: 4 },
                    transition: 'all 0.2s',
                  }}
                  onClick={() => handleProjectSelect(project)}
                >
                  <CardMedia
                    component="div"
                    sx={{
                      height: 140,
                      background: 'linear-gradient(45deg, #f5f5f5, #e0e0e0)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '3rem',
                      position: 'relative',
                    }}
                  >
                    {project.categoryIcon}
                    <IconButton
                      size="small"
                      sx={{ position: 'absolute', top: 8, right: 8 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(project);
                      }}
                    >
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </CardMedia>
                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Typography variant="h6" component="h3" gutterBottom sx={{ fontSize: '1rem' }}>
                      {project.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.85rem' }}>
                      {project.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                      <Chip
                        size="small"
                        label={project.complexity}
                        sx={{
                          backgroundColor: getComplexityColor(project.complexity),
                          color: 'white',
                          fontSize: '0.7rem',
                        }}
                      />
                      <Chip size="small" label={project.category} variant="outlined" sx={{ fontSize: '0.7rem' }} />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <MoneyIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                        {project.estimatedCost}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                        {project.estimatedDuration}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button variant="outlined" onClick={onBack}>
          Back
        </Button>
        <Button
          variant="contained"
          onClick={onNext}
          disabled={!currentSelected}
        >
          Continue with {selectedProject?.name || 'Selected Project'}
        </Button>
      </Box>

      {/* Project Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedProject?.categoryIcon} {selectedProject?.name}
        </DialogTitle>
        <DialogContent>
          {selectedProject && (
            <Box>
              <Typography variant="body1" paragraph>
                {selectedProject.description}
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <MoneyIcon color="primary" />
                    <Box>
                      <Typography variant="subtitle2">Estimated Cost</Typography>
                      <Typography variant="body2">{selectedProject.estimatedCost}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <ScheduleIcon color="primary" />
                    <Box>
                      <Typography variant="subtitle2">Duration</Typography>
                      <Typography variant="body2">{selectedProject.estimatedDuration}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <GavelIcon color="primary" />
                    <Box>
                      <Typography variant="subtitle2">Planning Permission</Typography>
                      <Typography variant="body2">{getPlanningText(selectedProject.requiresPlanning)}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <SecurityIcon color="primary" />
                    <Box>
                      <Typography variant="subtitle2">Building Control</Typography>
                      <Typography variant="body2">
                        {typeof selectedProject.requiresBuildingControl === 'boolean' 
                          ? (selectedProject.requiresBuildingControl ? 'Required' : 'Not required')
                          : 'Check requirements'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>Tags</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedProject.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" />
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (selectedProject) {
                handleProjectSelect(selectedProject);
              }
              setDetailsDialogOpen(false);
            }}
          >
            Select This Project
          </Button>
        </DialogActions>
      </Dialog>

      {/* Custom Project Dialog */}
      <Dialog
        open={customProjectDialog}
        onClose={() => setCustomProjectDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Describe Your Custom Project</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Describe your unique project requirements. Our AI will analyze your description and suggest the most appropriate category and similar projects.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="e.g., I want to convert my loft into a bedroom with an ensuite bathroom..."
            value={customDescription}
            onChange={(e) => setCustomDescription(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomProjectDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCustomProject}
            disabled={!customDescription.trim() || analyzingCustom}
            startIcon={analyzingCustom ? <CircularProgress size={20} /> : null}
          >
            {analyzingCustom ? 'Analyzing...' : 'Analyze Project'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnhancedProjectTypeStep;
