import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  LinearProgress,
} from '@mui/material';
import { Project } from '../../services/projectService';

interface ProjectOverviewTabProps {
  project: Project;
}

const ProjectOverviewTab: React.FC<ProjectOverviewTabProps> = ({ project }) => {
  const formatProjectType = (type: string | undefined) => {
    if (!type) return 'Unknown';
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatAddress = (address: Project['propertyAddress']) => {
    return [address?.line1, address?.line2, address?.city, address?.postcode]
      .filter(Boolean)
      .join(', ');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'primary';
      case 'sow_ready': return 'info';
      case 'details_collection': return 'warning';
      default: return 'default';
    }
  };

  const getProgressPercentage = () => {
    const statusMap = {
      'details_collection': 20,
      'sow_generation': 40,
      'sow_ready': 60,
      'builders_invited': 80,
      'quotes_received': 90,
      'in_progress': 95,
      'completed': 100,
    };
    return statusMap[project.status as keyof typeof statusMap] || 10;
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Project Overview
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Progress: {getProgressPercentage()}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={getProgressPercentage()} 
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
            <List>
              <ListItem>
                <ListItemText
                  primary="Project Type"
                  secondary={formatProjectType(project.projectType || 'unknown')}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Property Address"
                  secondary={formatAddress(project.propertyAddress || {})}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Status"
                  secondary={
                    <Chip 
                      label={(project.status || 'draft').replace('_', ' ').toUpperCase()} 
                      color={getStatusColor(project.status || 'draft') as any}
                      size="small"
                    />
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Created"
                  secondary={new Date(project.createdAt || Date.now()).toLocaleDateString()}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Requirements Summary
            </Typography>
            <Typography variant="body2" paragraph>
              {project.requirements?.description || 'No description provided'}
            </Typography>
            {project.requirements?.timeline && (
              <Typography variant="body2" color="text.secondary">
                Timeline: {project.requirements.timeline}
              </Typography>
            )}
            {project.requirements?.budget && (
              <Typography variant="body2" color="text.secondary">
                Budget: £{project.requirements.budget.min?.toLocaleString()} - £{project.requirements.budget.max?.toLocaleString()}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default ProjectOverviewTab;
