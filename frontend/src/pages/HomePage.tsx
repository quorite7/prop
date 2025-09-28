import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  Rating,
  Chip,
  Paper,
  Stack,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Gavel as GavelIcon,
  TrendingUp as TrendingUpIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const handleGetStarted = () => {
    if (!isAuthenticated) {
      navigate('/register');
    } else if (user?.userType === 'builder') {
      navigate('/app/builder/dashboard');
    } else {
      navigate('/app/projects/create');
    }
  };

  const handleLearnMore = () => {
    navigate('/app/onboarding');
  };

  const benefits = [
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Professional Standards',
      description: 'AI-generated Scopes of Work that comply with UK building regulations, RICS guidelines, and industry standards.',
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Save Time & Money',
      description: 'Skip weeks of research. Get detailed project specifications and compare quotes from verified builders instantly.',
    },
    {
      icon: <GavelIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Transparent Process',
      description: 'Clear pricing, detailed specifications, and professional contracts. No hidden costs or surprises.',
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Quality Assurance',
      description: 'All builders are verified with insurance checks, Companies House validation, and customer reviews.',
    },
  ];

  const popularProjects = [
    {
      id: 'loft_conversion_dormer',
      title: 'Loft Conversion - Dormer',
      description: 'Transform your loft into a beautiful bedroom with dormer windows',
      image: '🏠',
      estimatedCost: '£15,000 - £35,000',
      duration: '4-8 weeks',
      popularity: 'Most Popular',
    },
    {
      id: 'kitchen_renovation_full',
      title: 'Kitchen Renovation',
      description: 'Complete kitchen transformation with modern units and appliances',
      image: '🍳',
      estimatedCost: '£15,000 - £40,000',
      duration: '4-8 weeks',
      popularity: 'Trending',
    },
    {
      id: 'rear_extension_single_storey',
      title: 'Single Storey Extension',
      description: 'Extend your living space with a beautiful rear extension',
      image: '🏗️',
      estimatedCost: '£20,000 - £50,000',
      duration: '8-12 weeks',
      popularity: 'High Demand',
    },
    {
      id: 'bathroom_renovation_full',
      title: 'Bathroom Renovation',
      description: 'Create your dream bathroom with modern fixtures and finishes',
      image: '🛁',
      estimatedCost: '£8,000 - £25,000',
      duration: '3-6 weeks',
      popularity: 'Popular',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah M.',
      location: 'London',
      rating: 5,
      text: 'This platform saved me weeks of research and gave me confidence in my loft conversion project. The AI guidance was incredibly helpful!',
      project: 'Loft Conversion',
      avatar: 'S',
    },
    {
      name: 'James T.',
      location: 'Manchester',
      rating: 5,
      text: 'As a builder, the professional quote generation tool has transformed how I present proposals to clients. Highly recommended!',
      project: 'Builder Services',
      avatar: 'J',
    },
    {
      name: 'Michael R.',
      location: 'Birmingham',
      rating: 5,
      text: 'The transparent comparison of quotes helped me save £3,000 on my kitchen extension while finding a fantastic builder.',
      project: 'Kitchen Extension',
      avatar: 'M',
    },
  ];

  const stats = [
    { number: '500+', label: 'Projects Completed' },
    { number: '200+', label: 'Verified Builders' },
    { number: '4.8/5', label: 'Average Rating' },
    { number: '£2.5M+', label: 'Projects Value' },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 'bold',
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  lineHeight: 1.2,
                }}
              >
                Transform Your Home with Confidence
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  opacity: 0.9,
                  fontSize: { xs: '1.2rem', md: '1.5rem' },
                  lineHeight: 1.4,
                }}
              >
                Get professional Scopes of Work, compare verified builder quotes, and manage your UK home improvement project from start to finish.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleGetStarted}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    '&:hover': {
                      bgcolor: 'grey.100',
                    },
                  }}
                  endIcon={<ArrowForwardIcon />}
                >
                  {isAuthenticated ? 'Start New Project' : 'Start Your Project'}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleLearnMore}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  Learn More
                </Button>
              </Stack>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  ✓ Free to start
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  ✓ UK Building Regulations compliant
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  ✓ Verified builders only
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: { xs: 300, md: 400 },
                }}
              >
                <Paper
                  elevation={8}
                  sx={{
                    p: 0,
                    borderRadius: 4,
                    bgcolor: 'rgba(255,255,255,0.95)',
                    color: 'text.primary',
                    maxWidth: 400,
                    width: '100%',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      background: '#f8f9fa',
                      padding: '1rem',
                      borderBottom: '1px solid #e9ecef',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        gap: '0.5rem',
                        '& span': {
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: '#dee2e6',
                        },
                        '& span:first-of-type': {
                          background: '#ff5f56',
                        },
                        '& span:nth-of-type(2)': {
                          background: '#ffbd2e',
                        },
                        '& span:last-of-type': {
                          background: '#27ca3f',
                        },
                      }}
                    >
                      <Box component="span" />
                      <Box component="span" />
                      <Box component="span" />
                    </Box>
                  </Box>
                  <Box sx={{ p: 4 }}>
                    <Typography variant="h6" gutterBottom color="primary.main" fontWeight="bold">
                      🏠 Project Dashboard Preview
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Current Project
                      </Typography>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Loft Conversion - Dormer
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Status
                      </Typography>
                      <Chip label="Quotes Received" color="success" size="small" />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Estimated Cost
                      </Typography>
                      <Typography variant="h6" color="primary.main">
                        £15,000 - £35,000
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      fullWidth
                      size="small"
                      sx={{ mt: 2 }}
                    >
                      View 3 Builder Quotes
                    </Button>
                  </Box>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 6, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="h3"
                    component="div"
                    sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}
                  >
                    {stat.number}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Why Choose Our Platform Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            align="center"
            gutterBottom
            sx={{ fontWeight: 'bold', mb: 2 }}
          >
            Why Choose Our Platform?
          </Typography>
          <Typography
            variant="h6"
            align="center"
            color="text.secondary"
            sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}
          >
            Remove information asymmetry - Homeowners don't know what they don't know - we are solving that specific pain point
          </Typography>
          <Grid container spacing={4}>
            {benefits.map((benefit, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    p: 3,
                    border: '1px solid',
                    borderColor: 'grey.200',
                    '&:hover': {
                      boxShadow: 4,
                      borderColor: 'primary.main',
                    },
                    transition: 'all 0.3s',
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box sx={{ flexShrink: 0 }}>{benefit.icon}</Box>
                      <Box>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                          {benefit.title}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          {benefit.description}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Popular Project Types Section */}
      <Box sx={{ py: 8, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            align="center"
            gutterBottom
            sx={{ fontWeight: 'bold', mb: 2 }}
          >
            Popular Project Types
          </Typography>
          <Typography
            variant="h6"
            align="center"
            color="text.secondary"
            sx={{ mb: 6 }}
          >
            Explore our most requested home improvement projects
          </Typography>
          <Grid container spacing={4}>
            {popularProjects.map((project, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
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
                      height: 120,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '3rem',
                      bgcolor: 'primary.light',
                      color: 'white',
                      position: 'relative',
                    }}
                  >
                    {project.image}
                    <Chip
                      label={project.popularity}
                      size="small"
                      color="secondary"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        fontWeight: 'bold',
                      }}
                    />
                  </CardMedia>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      {project.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {project.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Cost:
                      </Typography>
                      <Typography variant="body2" fontWeight="bold" color="primary.main">
                        {project.estimatedCost}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Duration:
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {project.duration}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/projects/types')}
              sx={{ px: 4 }}
            >
              View All Project Types
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Customer Testimonials Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            align="center"
            gutterBottom
            sx={{ fontWeight: 'bold', mb: 2 }}
          >
            What Our Customers Say
          </Typography>
          <Typography
            variant="h6"
            align="center"
            color="text.secondary"
            sx={{ mb: 6 }}
          >
            Real experiences from homeowners and builders across the UK
          </Typography>
          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    p: 3,
                    position: 'relative',
                    '&:before': {
                      content: '"""',
                      position: 'absolute',
                      top: -10,
                      left: 20,
                      fontSize: '4rem',
                      color: 'primary.main',
                      opacity: 0.3,
                    },
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Rating
                      value={testimonial.rating}
                      readOnly
                      sx={{ mb: 2 }}
                    />
                    <Typography
                      variant="body1"
                      sx={{ mb: 3, fontStyle: 'italic', lineHeight: 1.6 }}
                    >
                      {testimonial.text}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {testimonial.avatar}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {testimonial.location} • {testimonial.project}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Call to Action Section */}
      <Box
        sx={{
          py: 8,
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h3"
              component="h2"
              gutterBottom
              sx={{ fontWeight: 'bold', mb: 2 }}
            >
              Ready to Start Your Project?
            </Typography>
            <Typography
              variant="h6"
              sx={{ mb: 4, opacity: 0.9 }}
            >
              Join hundreds of homeowners who have successfully completed their home improvement projects with our platform.
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
              sx={{ mb: 4 }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={handleGetStarted}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  '&:hover': {
                    bgcolor: 'grey.100',
                  },
                }}
                endIcon={<ArrowForwardIcon />}
              >
                {isAuthenticated ? 'Start New Project' : 'Get Started Free'}
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/login')}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                Sign In
              </Button>
            </Stack>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              No credit card required • Free to start • Cancel anytime
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
