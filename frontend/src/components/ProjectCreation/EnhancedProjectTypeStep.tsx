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
  Container,
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
import { projectService } from '../../services/projectService';

interface ProjectType {
  id: string;
  name: string;
  description: string;
  estimatedCost: string;
  estimatedDuration: string;
  complexity: 'low' | 'medium' | 'high';
  requiresPlanning: boolean;
  tags?: string[];
  categoryKey?: string;
  category?: string;
}

interface ProjectTypeCategory {
  key: string;
  name: string;
  description: string;
  icon: string;
  projectCount: number;
}

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

  const handleProjectSelect = (project: ProjectType) => {
    setSelectedProject(project);
    handleSelection(project.id);
  };

  const loadProjectTypes = async () => {
    try {
      setLoading(true);
      setError('');
      
      const projectTypes = await projectService.getProjectTypes();

      // Convert to the expected format and organize by categories
      const allProjects: ProjectType[] = projectTypes.map(pt => ({
        ...pt,
        tags: [],
        categoryKey: getCategoryKey(pt.id),
        category: getCategoryName(pt.id)
      }));
      
      setAllProjects(allProjects);
      setFilteredProjects(allProjects);
      setFeaturedProjects(allProjects.slice(0, 8)); // Show more featured projects
      
      // Create category structure based on project types
      const categoryMap = new Map();
      allProjects.forEach(project => {
        const key = project.categoryKey || 'general';
        const name = project.category || 'General';
        if (!categoryMap.has(key)) {
          categoryMap.set(key, {
            key,
            name,
            description: getCategoryDescription(key),
            icon: getCategoryIcon(key),
            projectCount: 0
          });
        }
        categoryMap.get(key).projectCount++;
      });
      
      setCategories(Array.from(categoryMap.values()));
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
        project.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        (project.category && project.category.toLowerCase().includes(query))
      );
    }

    setFilteredProjects(filtered);
  };

  const getCategoryKey = (projectId: string): string => {
    const categoryMapping: Record<string, string> = {
      'loft-conversion': 'extensions',
      'rear-extension': 'extensions',
      'side-extension': 'extensions',
      'basement-conversion': 'extensions',
      'garage-conversion': 'extensions',
      'conservatory': 'extensions',
      'kitchen-renovation': 'rooms',
      'bathroom-renovation': 'rooms',
      'bedroom-renovation': 'rooms',
      'living-room-renovation': 'rooms',
      'home-office': 'rooms',
      'roofing': 'external',
      'windows-doors': 'external',
      'driveway-patio': 'external',
      'central-heating': 'systems',
      'electrical-rewiring': 'systems',
      'plumbing-upgrades': 'systems',
      'insulation': 'systems',
      'solar-panels': 'systems',
      'hardwood-flooring': 'finishes',
      'tiling': 'finishes',
      'painting-decorating': 'finishes',
      'swimming-pool': 'specialist',
      'home-cinema': 'specialist',
      'wine-cellar': 'specialist',
      'accessibility-modifications': 'specialist'
    };
    return categoryMapping[projectId] || 'general';
  };
  
  const getCategoryName = (projectId: string): string => {
    const key = getCategoryKey(projectId);
    const nameMapping: Record<string, string> = {
      'extensions': 'Extensions & Conversions',
      'rooms': 'Room Renovations',
      'external': 'External & Structural',
      'systems': 'Systems & Infrastructure',
      'finishes': 'Flooring & Finishes',
      'specialist': 'Specialist Projects',
      'general': 'General'
    };
    return nameMapping[key] || 'General';
  };
  
  const getCategoryDescription = (key: string): string => {
    const descriptions: Record<string, string> = {
      'extensions': 'Expand your living space with extensions and conversions',
      'rooms': 'Transform individual rooms with complete renovations',
      'external': 'Improve your property\'s exterior and structural elements',
      'systems': 'Upgrade essential home systems and infrastructure',
      'finishes': 'Beautiful flooring and interior finishing touches',
      'specialist': 'Unique and luxury home improvement projects',
      'general': 'Various home improvement projects'
    };
    return descriptions[key] || 'Home improvement projects';
  };
  
  const getCategoryIcon = (key: string): string => {
    const icons: Record<string, string> = {
      'extensions': '🏗️',
      'rooms': '🏠',
      'external': '🏘️',
      'systems': '⚡',
      'finishes': '🎨',
      'specialist': '✨',
      'general': '🔧'
    };
    return icons[key] || '🔧';
  };

  const getProjectIcon = (projectId: string): string => {
    const icons: Record<string, string> = {
      'loft-conversion': '🏠',
      'rear-extension': '🏗️',
      'side-extension': '🏗️',
      'basement-conversion': '🏠',
      'garage-conversion': '🚗',
      'conservatory': '🌿',
      'kitchen-renovation': '👨‍🍳',
      'bathroom-renovation': '🛁',
      'bedroom-renovation': '🛏️',
      'living-room-renovation': '🛋️',
      'home-office': '💻',
      'roofing': '🏠',
      'windows-doors': '🚪',
      'driveway-patio': '🚗',
      'central-heating': '🔥',
      'electrical-rewiring': '⚡',
      'plumbing-upgrades': '🚿',
      'insulation': '🧱',
      'solar-panels': '☀️',
      'hardwood-flooring': '🪵',
      'tiling': '🔲',
      'painting-decorating': '🎨',
      'swimming-pool': '🏊',
      'home-cinema': '🎬',
      'wine-cellar': '🍷',
      'accessibility-modifications': '♿'
    };
    return icons[projectId] || '🔧';
  };

  const getProjectColor = (complexity: string): string => {
    const colors: Record<string, string> = {
      'low': '#4caf50',
      'medium': '#ff9800',
      'high': '#f44336'
    };
    return colors[complexity] || '#2196f3';
  };

  const getProjectColorSecondary = (complexity: string): string => {
    const colors: Record<string, string> = {
      'low': '#66bb6a',
      'medium': '#ffb74d',
      'high': '#ef5350'
    };
    return colors[complexity] || '#42a5f5';
  };

  const getComplexityColor = (complexity: string): string => {
    const colors: Record<string, string> = {
      'low': '#4caf50',
      'medium': '#ff9800',
      'high': '#f44336'
    };
    return colors[complexity] || '#2196f3';
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
      // const analysis = await projectTypesService.analyzeCustomProject(customDescription);
      
      // Create a custom project type based on analysis
      const customProject: ProjectType = {
        id: 'custom_project',
        name: 'Custom Project',
        description: customDescription,
        estimatedCost: 'Varies',
        estimatedDuration: 'Varies',
        complexity: 'medium',
        requiresPlanning: true,
        tags: ['custom', 'bespoke'],
        categoryKey: 'custom',
        category: 'Custom Project',
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
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
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
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setCustomProjectDialog(true)}
              startIcon={<CategoryIcon />}
              sx={{ 
                height: '56px',
                borderStyle: 'dashed',
                borderColor: '#ff9800',
                color: '#ff9800',
                '&:hover': {
                  borderColor: '#f57c00',
                  backgroundColor: 'rgba(255, 152, 0, 0.04)'
                }
              }}
            >
              Can't Find Your Project?
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 0.5 }}>
              Use this if none of the below match your needs
            </Typography>
          </Grid>
        </Grid>
        
        {/* Category Tabs */}
        <Box sx={{ mt: 3 }}>
          <Tabs
            value={selectedCategory}
            onChange={(_, value) => setSelectedCategory(value)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="All Projects" value="all" />
            {categories?.map((category) => (
              <Tab
                key={category.key}
                label={`${category.icon} ${category.name}`}
                value={category.key}
              />
            ))}
          </Tabs>
        </Box>
      </Box>

      {/* Featured Projects (when no search/filter) */}
      {!searchQuery && selectedCategory === 'all' && featuredProjects.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            🌟 Popular Projects
          </Typography>
          <Grid container spacing={2}>
            {featuredProjects?.map((project) => (
              <Grid item xs={12} sm={6} md={3} key={project.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    height: '100%',
                    transition: 'all 0.3s ease',
                    border: currentSelected === project.id ? '3px solid #1976d2' : '1px solid #e0e0e0',
                    boxShadow: currentSelected === project.id ? '0 8px 25px rgba(25, 118, 210, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                      borderColor: '#1976d2'
                    },
                    borderRadius: 3,
                    overflow: 'hidden'
                  }}
                  onClick={() => handleProjectSelect(project)}
                >
                  <CardMedia
                    component="div"
                    sx={{
                      height: 120,
                      background: `linear-gradient(135deg, ${getProjectColor(project.complexity)} 0%, ${getProjectColorSecondary(project.complexity)} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '3rem',
                      color: 'white',
                      position: 'relative'
                    }}
                  >
                    {getProjectIcon(project.id)}
                    {project.requiresPlanning && (
                      <Chip
                        label="Planning Required"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          color: '#d32f2f',
                          fontWeight: 'bold',
                          fontSize: '0.7rem'
                        }}
                      />
                    )}
                  </CardMedia>
                  <CardContent sx={{ p: 2, height: 'calc(100% - 120px)', display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#1976d2', fontSize: '1rem' }}>
                      {project.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1, lineHeight: 1.4, fontSize: '0.85rem' }}>
                      {project.description}
                    </Typography>
                    <Box sx={{ mt: 'auto' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <ScheduleIcon sx={{ fontSize: 14, color: '#666' }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          {project.estimatedDuration}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <MoneyIcon sx={{ fontSize: 14, color: '#666' }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>
                          {project.estimatedCost}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${project.complexity.charAt(0).toUpperCase() + project.complexity.slice(1)} Complexity`}
                        size="small"
                        sx={{
                          backgroundColor: getComplexityColor(project.complexity),
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '0.7rem',
                          height: 20
                        }}
                      />
                    </Box>
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
            {filteredProjects?.map((project) => (
              <Grid item xs={12} sm={6} md={4} key={project.id}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: currentSelected === project.id ? '3px solid #1976d2' : '1px solid #e0e0e0',
                    boxShadow: currentSelected === project.id ? '0 8px 25px rgba(25, 118, 210, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                      borderColor: '#1976d2'
                    },
                    borderRadius: 3,
                    overflow: 'hidden'
                  }}
                  onClick={() => handleProjectSelect(project)}
                >
                  <CardMedia
                    component="div"
                    sx={{
                      height: 140,
                      background: `linear-gradient(135deg, ${getProjectColor(project.complexity)} 0%, ${getProjectColorSecondary(project.complexity)} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '3rem',
                      color: 'white',
                      position: 'relative',
                    }}
                  >
                    {getProjectIcon(project.id)}
                    {project.requiresPlanning && (
                      <Chip
                        label="Planning Required"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          color: '#d32f2f',
                          fontWeight: 'bold',
                          fontSize: '0.7rem'
                        }}
                      />
                    )}
                    <IconButton
                      size="small"
                      sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        right: 8,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.3)'
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(project);
                      }}
                    >
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </CardMedia>
                  <CardContent sx={{ flexGrow: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" component="h3" gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1976d2' }}>
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
          {selectedProject?.category} - {selectedProject?.name}
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
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>Tags</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedProject.tags?.map((tag) => (
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

      {/* Sticky Action Bar */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'white',
          borderTop: '1px solid #e0e0e0',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
          p: 2,
          zIndex: 1000
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              {currentSelected && (
                <Typography variant="body2" color="text.secondary">
                  Selected: <strong>{allProjects.find(p => p.id === currentSelected)?.name}</strong>
                </Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {currentSelected && (
                <Button
                  variant="contained"
                  onClick={() => {
                    const project = allProjects.find(p => p.id === currentSelected);
                    if (project) {
                      handleProjectSelect(project);
                      if (onNext) onNext();
                    }
                  }}
                  sx={{ minWidth: 200 }}
                >
                  Continue with Selected Project
                </Button>
              )}
              {!currentSelected && (
                <Button
                  variant="outlined"
                  disabled
                  sx={{ minWidth: 200 }}
                >
                  Select a Project Type
                </Button>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Add bottom padding to prevent content from being hidden behind sticky bar */}
      <Box sx={{ height: 80 }} />

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
