import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, Chip } from '@mui/material';
import { sowService, ScopeOfWork } from '../services/sowService';

interface SoWDisplayProps {
  projectId: string;
  sowId: string;
}

const SoWDisplay: React.FC<SoWDisplayProps> = ({ projectId, sowId }) => {
  const [sow, setSow] = useState<ScopeOfWork | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSoW = async () => {
      try {
        const sowData = await sowService.getSoW(projectId, sowId);
        setSow(sowData);
      } catch (error) {
        console.error('Failed to load SoW:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSoW();
  }, [projectId, sowId]);

  if (loading) return <Typography>Loading SoW...</Typography>;
  if (!sow) return <Typography>SoW not found</Typography>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Scope of Work
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Project Scope</Typography>
              <Typography variant="body2">
                {sow.scope?.description || 'Scope details will be displayed here'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Cost Estimate</Typography>
              <Typography variant="h4" color="primary">
                {sowService.formatCurrency(sow.costs?.total || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Timeline</Typography>
              <Typography variant="body2">
                Estimated Duration: {sow.timeline?.totalDuration || 'TBD'} days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SoWDisplay;
