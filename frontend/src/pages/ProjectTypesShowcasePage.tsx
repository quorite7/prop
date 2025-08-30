import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  TextField,
  InputAdornment,
  Chip,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  // Build as BuildIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { projectTypesService, ProjectType, ProjectTypeCategory } from '../services/projectTypesService';

const ProjectTypesShowcasePage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<ProjectTypeCategory[]>([]);
  const [allProjects, setAllProjects] = useState<ProjectType[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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

  const getComplexityColor = (complexity: string) => {
    switch (complexity.toLowerCase()) {
      case 'low': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'high': return '#f44336';
      default: return '#757575';
    }
  };

  const handleGetStarted = () => {
    navigate('/register');
  };

  if (loading) {
    return (
      <Box>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => navigate('/')}
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              UK Home Improvement Platform
            </Typography>
          </Toolbar>
        </AppBar>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading project types...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            UK Home Improvement Platform
          </Typography>
          <Button color="inherit" onClick={() => navigate('/login')}>
            Login
          </Button>
          <Button 
            variant="outlined" 
            color="inherit" 
            onClick={handleGetStarted}
            sx={{ ml: 1, borderColor: 'white' }}
          >
            Get Started
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box sx={{ py: 6, bgcolor: 'primary.main', color: 'white' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h1" align="center" gutterBottom>
            Comprehensive Project Types
          </Typography>
          <Typography variant="h6" align="center" sx={{ mb: 4, opacity: 0.9 }}>
            Explore all types of home improvement projects we support across the UK
          </Typography>
          
          {/* Search and Filter */}
          <Box sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
            <TextField
              fullWidth
              placeholder="Search project types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'white' }} />
                  </InputAdornment>
                ),
                sx: {
                  bgcolor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                },
              }}
              sx={{
                '& .MuiInputBase-input::placeholder': {
                  color: 'rgba(255,255,255,0.7)',
                  opacity: 1,
                },
              }}
            />
          </Box>

          {/* Category Tabs */}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Tabs
              value={selectedCategory}
              onChange={(_, value) => setSelectedCategory(value)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  color: 'rgba(255,255,255,0.7)',
                  '&.Mui-selected': {
                    color: 'white',
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: 'white',
                },
              }}
            >
              <Tab label="All Projects" value="all" />
              {categories.map((category) => (
                <Tab
                  key={category.key}
                  label={`${category.icon} ${category.name.split(' ')[0]}`}
                  value={category.key}
                />
              ))}
            </Tabs>
          </Box>
        </Container>
      </Box>

      {/* Project Results */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
            <Button onClick={loadProjectTypes} sx={{ ml: 2 }}>
              Retry
            </Button>
          </Alert>
        )}

        <Typography variant="h5" gutterBottom>
          {searchQuery ? `Search Results (${filteredProjects.length})` : 
           selectedCategory !== 'all' ? 
           `${categories.find(c => c.key === selectedCategory)?.name} (${filteredProjects.length})` :
           `All Project Types (${filteredProjects.length})`}
        </Typography>

        {filteredProjects.length === 0 ? (
          <Alert severity="info" sx={{ mt: 4 }}>
            No project types found matching your criteria. Try adjusting your search or category filter.
          </Alert>
        ) : (
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {filteredProjects.map((project) => (
              <Grid item xs={12} sm={6} md={4} key={project.id}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'translateY(-4px)',
                    },
                    transition: 'all 0.3s',
                  }}
                  onClick={handleGetStarted}
                >
                  <CardMedia
                    sx={{
                      height: 140,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '3rem',
                      bgcolor: 'primary.light',
                      color: 'white',
                      position: 'relative',
                    }}
                  >
                    {project.categoryIcon}
                    <Chip
                      label={project.complexity}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: getComplexityColor(project.complexity),
                        color: 'white',
                        fontWeight: 'bold',
                      }}
                    />
                  </CardMedia>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      {project.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {project.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <MoneyIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="bold" color="primary.main">
                        {project.estimatedCost}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="bold">
                        {project.estimatedDuration}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {project.tags.slice(0, 3).map((tag) => (
                        <Chip key={tag} label={tag} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Call to Action */}
        <Box sx={{ textAlign: 'center', mt: 6, py: 4, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom>
            Ready to Start Your Project?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Get professional guidance, detailed specifications, and connect with verified builders.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleGetStarted}
            sx={{ px: 4, py: 1.5 }}
          >
            Get Started Free
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default ProjectTypesShowcasePage;
