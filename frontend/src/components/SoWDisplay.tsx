import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Grid,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import {
  ExpandMore as ExpandMoreIcon,
  Assignment as AssignmentIcon,
  Build as BuildIcon,
  Schedule as ScheduleIcon,
  AttachMoney as AttachMoneyIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Edit as EditIcon,
  Gavel as GavelIcon,
  Security as SecurityIcon,
  VerifiedUser as VerifiedUserIcon
} from '@mui/icons-material';

interface Material {
  category: string;
  item: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  supplier: string;
  notes?: string;
}

interface CostBreakdown {
  materials: number;
  labour: number;
  additional: number;
  subtotal: number;
  contingency: number;
  total: number;
  breakdown: {
    materialsPercentage: string;
    labourPercentage: string;
    additionalPercentage: string;
    contingencyPercentage: string;
  };
}

interface TimelinePhase {
  phase: string;
  description: string;
  duration: number;
  startDate: string;
  endDate: string;
  dependencies: string[];
  trades: string[];
  milestones: string[];
}

interface ScopeOfWork {
  id: string;
  projectTypeId: string;
  generatedAt: string;
  version: string;
  overview: {
    title: string;
    description: string;
    location: string;
    estimatedValue: number;
    estimatedDuration: number;
  };
  scope: {
    workPackages: any[];
    specifications: any;
    exclusions: string[];
  };
  materials: {
    categories: Record<string, Material[]>;
    total: number;
    items: Material[];
  };
  costs: CostBreakdown;
  timeline: {
    phases: TimelinePhase[];
    totalDuration: number;
    startDate: string;
    endDate: string;
  };
  permits: {
    planningPermission: {
      required: boolean;
      reason: string;
      estimatedCost: number;
      estimatedTime: string;
    };
    buildingControl: {
      required: boolean;
      reason: string;
      estimatedCost: number;
      estimatedTime: string;
    };
  };
  standards: any;
  healthSafety: any;
  warranty: any;
}

interface SoWDisplayProps {
  sow: ScopeOfWork;
  onEdit: () => void;
  onProceedToBuilders: () => void;
  onDownload: () => void;
}

const SoWDisplay: React.FC<SoWDisplayProps> = ({
  sow,
  onEdit,
  onProceedToBuilders,
  onDownload
}) => {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getPhaseIcon = (phase: string) => {
    const icons: Record<string, React.ReactNode> = {
      'Planning': <AssignmentIcon />,
      'Structural': <BuildIcon />,
      'First Fix': <BuildIcon />,
      'Second Fix': <CheckCircleIcon />,
      'Finishing': <VerifiedUserIcon />
    };
    return icons[phase] || <BuildIcon />;
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.main', color: 'white' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h4" gutterBottom>
              {sow.overview.title}
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              {sow.overview.description}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
              Generated on {formatDate(sow.generatedAt)} • Version {sow.version}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Typography variant="h5" gutterBottom>
              {formatCurrency(sow.costs.total)}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Estimated total cost
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Duration: {sow.timeline.totalDuration} days
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          onClick={onProceedToBuilders}
          startIcon={<BuildIcon />}
          size="large"
        >
          Get Builder Quotes
        </Button>
        <Button
          variant="outlined"
          onClick={onEdit}
          startIcon={<EditIcon />}
        >
          Edit Requirements
        </Button>
        <Button
          variant="outlined"
          onClick={onDownload}
          startIcon={<DownloadIcon />}
        >
          Download PDF
        </Button>
        <Button
          variant="outlined"
          onClick={() => setShareDialogOpen(true)}
          startIcon={<ShareIcon />}
        >
          Share
        </Button>
      </Box>

      {/* Key Information Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AttachMoneyIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6">
                {formatCurrency(sow.costs.total)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Estimated Cost
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ScheduleIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6">
                {sow.timeline.totalDuration} days
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Estimated Duration
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <GavelIcon sx={{ fontSize: 40, color: sow.permits.planningPermission.required ? 'warning.main' : 'success.main', mb: 1 }} />
              <Typography variant="h6">
                {sow.permits.planningPermission.required ? 'Required' : 'Not Required'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Planning Permission
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <SecurityIcon sx={{ fontSize: 40, color: sow.permits.buildingControl.required ? 'warning.main' : 'success.main', mb: 1 }} />
              <Typography variant="h6">
                {sow.permits.buildingControl.required ? 'Required' : 'Not Required'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Building Control
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Sections */}
      <Box sx={{ mb: 3 }}>
        {/* Cost Breakdown */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <AttachMoneyIcon sx={{ mr: 2 }} />
            <Typography variant="h6">Cost Breakdown</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Category</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell align="right">Percentage</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Materials</TableCell>
                        <TableCell align="right">{formatCurrency(sow.costs.materials)}</TableCell>
                        <TableCell align="right">{sow.costs.breakdown.materialsPercentage}%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Labour</TableCell>
                        <TableCell align="right">{formatCurrency(sow.costs.labour)}</TableCell>
                        <TableCell align="right">{sow.costs.breakdown.labourPercentage}%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Additional Costs</TableCell>
                        <TableCell align="right">{formatCurrency(sow.costs.additional)}</TableCell>
                        <TableCell align="right">{sow.costs.breakdown.additionalPercentage}%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Contingency</TableCell>
                        <TableCell align="right">{formatCurrency(sow.costs.contingency)}</TableCell>
                        <TableCell align="right">{sow.costs.breakdown.contingencyPercentage}%</TableCell>
                      </TableRow>
                      <TableRow sx={{ bgcolor: 'primary.light' }}>
                        <TableCell><strong>Total</strong></TableCell>
                        <TableCell align="right"><strong>{formatCurrency(sow.costs.total)}</strong></TableCell>
                        <TableCell align="right"><strong>100%</strong></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid item xs={12} md={4}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    This is an estimated cost based on current market rates. Final costs may vary based on specific requirements and builder quotes.
                  </Typography>
                </Alert>
                <Alert severity="warning">
                  <Typography variant="body2">
                    A {sow.costs.breakdown.contingencyPercentage}% contingency has been included for unexpected costs.
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Materials List */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <BuildIcon sx={{ mr: 2 }} />
            <Typography variant="h6">Materials & Supplies</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {Object.entries(sow.materials.categories).map(([category, materials]) => (
              <Box key={category} sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  {category}
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell align="center">Quantity</TableCell>
                        <TableCell align="center">Unit</TableCell>
                        <TableCell align="right">Unit Cost</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell>Supplier</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {materials.map((material, index) => (
                        <TableRow key={index}>
                          <TableCell>{material.item}</TableCell>
                          <TableCell align="center">{material.quantity}</TableCell>
                          <TableCell align="center">{material.unit}</TableCell>
                          <TableCell align="right">{formatCurrency(material.unitCost)}</TableCell>
                          <TableCell align="right">{formatCurrency(material.totalCost)}</TableCell>
                          <TableCell>{material.supplier}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>

        {/* Project Timeline */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <ScheduleIcon sx={{ mr: 2 }} />
            <Typography variant="h6">Project Timeline</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Timeline>
                  {sow.timeline.phases.map((phase, index) => (
                    <TimelineItem key={index}>
                      <TimelineSeparator>
                        <TimelineDot color="primary">
                          {getPhaseIcon(phase.phase)}
                        </TimelineDot>
                        {index < sow.timeline.phases.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent>
                        <Paper sx={{ p: 2, mb: 2 }}>
                          <Typography variant="h6" gutterBottom>
                            {phase.phase}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            {phase.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, mb: 1, flexWrap: 'wrap' }}>
                            <Chip label={`${phase.duration} days`} size="small" />
                            <Chip label={`${formatDate(phase.startDate)} - ${formatDate(phase.endDate)}`} size="small" variant="outlined" />
                          </Box>
                          {phase.trades.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="caption" color="textSecondary">
                                Trades: {phase.trades.join(', ')}
                              </Typography>
                            </Box>
                          )}
                        </Paper>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Timeline Summary
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <ScheduleIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Total Duration"
                        secondary={`${sow.timeline.totalDuration} days`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Start Date"
                        secondary={formatDate(sow.timeline.startDate)}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <VerifiedUserIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Completion Date"
                        secondary={formatDate(sow.timeline.endDate)}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Permits & Approvals */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <GavelIcon sx={{ mr: 2 }} />
            <Typography variant="h6">Permits & Approvals</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Planning Permission
                  </Typography>
                  <Alert severity={sow.permits.planningPermission.required ? 'warning' : 'success'} sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      {sow.permits.planningPermission.required ? 'Required' : 'Not Required'}
                    </Typography>
                  </Alert>
                  <Typography variant="body2" gutterBottom>
                    {sow.permits.planningPermission.reason}
                  </Typography>
                  {sow.permits.planningPermission.required && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        <strong>Estimated Cost:</strong> {formatCurrency(sow.permits.planningPermission.estimatedCost)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Estimated Time:</strong> {sow.permits.planningPermission.estimatedTime}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Building Control
                  </Typography>
                  <Alert severity={sow.permits.buildingControl.required ? 'warning' : 'success'} sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      {sow.permits.buildingControl.required ? 'Required' : 'Not Required'}
                    </Typography>
                  </Alert>
                  <Typography variant="body2" gutterBottom>
                    {sow.permits.buildingControl.reason}
                  </Typography>
                  {sow.permits.buildingControl.required && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        <strong>Estimated Cost:</strong> {formatCurrency(sow.permits.buildingControl.estimatedCost)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Estimated Time:</strong> {sow.permits.buildingControl.estimatedTime}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Exclusions */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <WarningIcon sx={{ mr: 2 }} />
            <Typography variant="h6">Exclusions</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                The following items are NOT included in this scope of work:
              </Typography>
            </Alert>
            <List>
              {sow.scope.exclusions.map((exclusion, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <WarningIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText primary={exclusion} />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* Call to Action */}
      <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'primary.light' }}>
        <Typography variant="h6" gutterBottom>
          Ready to Get Started?
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Get quotes from verified builders in your area based on this detailed scope of work.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={onProceedToBuilders}
          startIcon={<BuildIcon />}
        >
          Get Builder Quotes
        </Button>
      </Paper>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
        <DialogTitle>Share Scope of Work</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Share this scope of work with builders, architects, or family members.
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            Sharing functionality will be implemented in the next phase.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SoWDisplay;
