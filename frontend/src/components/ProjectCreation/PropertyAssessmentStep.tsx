import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  Button,
  CircularProgress,
  Chip,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Home as HomeIcon,
  Security as SecurityIcon,
  Landscape as LandscapeIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Gavel as GavelIcon,
  Nature as NatureIcon,
  Water as WaterIcon,
} from '@mui/icons-material';
import {
  propertyAssessmentService,
  PropertyAssessment,
} from '../../services/propertyAssessmentService';

interface PropertyAssessmentStepProps {
  address: string;
  postcode: string;
  projectType: string;
  onAssessmentComplete: (assessment: PropertyAssessment) => void;
  onError: (error: string) => void;
}

const PropertyAssessmentStep: React.FC<PropertyAssessmentStepProps> = ({
  address,
  postcode,
  projectType,
  onAssessmentComplete,
  onError,
}) => {
  const [assessment, setAssessment] = useState<PropertyAssessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [userConfirmed, setUserConfirmed] = useState(false);

  useEffect(() => {
    if (address && postcode && !assessment) {
      performAssessment();
    }
  }, [address, postcode]);

  const performAssessment = async () => {
    if (!address || !postcode) {
      setError('Address and postcode are required for property assessment');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await propertyAssessmentService.assessProperty(address, postcode);
      setAssessment(result);
      onAssessmentComplete(result);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to assess property';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryAssessment = () => {
    setAssessment(null);
    setError('');
    performAssessment();
  };

  const handleUserConfirmation = (confirmed: boolean) => {
    setUserConfirmed(confirmed);
    if (assessment) {
      onAssessmentComplete(assessment);
    }
  };

  const getConstraintIcon = (constraint: string) => {
    switch (constraint.toLowerCase()) {
      case 'conservation': return <SecurityIcon color="warning" />;
      case 'listed': return <HomeIcon color="error" />;
      case 'greenbelt': return <NatureIcon color="success" />;
      case 'flood': return <WaterIcon color="info" />;
      default: return <WarningIcon color="warning" />;
    }
  };

  const getConstraintColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
          Assessing Property...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Checking conservation area status, listed building information, and planning constraints
        </Typography>
      </Box>
    );
  }

  if (error && !assessment) {
    return (
      <Box>
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={handleRetryAssessment}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
        <Typography variant="body2" color="text.secondary">
          We'll proceed with basic property information, but we recommend verifying planning requirements with your local council.
        </Typography>
      </Box>
    );
  }

  if (!assessment) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Button variant="contained" onClick={performAssessment}>
          Start Property Assessment
        </Button>
      </Box>
    );
  }

  const planningGuidance = propertyAssessmentService.getPlanningGuidance(assessment, projectType);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Property Assessment Results
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        We've analyzed your property for planning constraints and regulatory requirements.
      </Typography>

      {/* Property Overview */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <HomeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Property Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Address</Typography>
              <Typography variant="body1" fontWeight="bold">{assessment.property.address}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Postcode</Typography>
              <Typography variant="body1" fontWeight="bold">{assessment.property.postcode}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Council Area</Typography>
              <Typography variant="body1">{assessment.property.councilArea}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">Property Type</Typography>
              <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                {assessment.property.propertyType.replace('_', ' ')}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Key Alerts */}
      <Box sx={{ mb: 3 }}>
        {assessment.conservationArea.isInConservationArea && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Conservation Area Property
            </Typography>
            Your property is located in <strong>{assessment.conservationArea.conservationAreaName}</strong> Conservation Area. 
            Additional planning considerations apply for external alterations.
            {assessment.conservationArea.contactOfficer && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Contact Officer: {assessment.conservationArea.contactOfficer}
              </Typography>
            )}
          </Alert>
        )}

        {assessment.listedBuilding.isListedBuilding && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Listed Building
            </Typography>
            Your property is a <strong>Grade {assessment.listedBuilding.listingGrade}</strong> Listed Building. 
            Listed Building Consent may be required for internal and external alterations.
            {assessment.listedBuilding.heritageOfficer && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Heritage Officer: {assessment.listedBuilding.heritageOfficer}
              </Typography>
            )}
          </Alert>
        )}

        {assessment.planningConstraints.greenBelt && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Green Belt Location
            </Typography>
            Your property is in the Green Belt. Extensions and outbuildings have strict size limitations.
          </Alert>
        )}

        {assessment.planningConstraints.floodRisk === 'high' && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              High Flood Risk Area
            </Typography>
            Your property is in a high flood risk area. Flood resilience measures may be required.
          </Alert>
        )}
      </Box>

      {/* Detailed Assessment */}
      <Box sx={{ mb: 3 }}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Planning Constraints
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {assessment.planningConstraints.articleFourDirection && (
                <Grid item xs={12} sm={6}>
                  <Chip label="Article 4 Direction" color="warning" variant="outlined" />
                </Grid>
              )}
              {assessment.planningConstraints.treePreservationOrder && (
                <Grid item xs={12} sm={6}>
                  <Chip label="Tree Preservation Order" color="info" variant="outlined" />
                </Grid>
              )}
              {assessment.planningConstraints.floodRisk && (
                <Grid item xs={12} sm={6}>
                  <Chip 
                    label={`${assessment.planningConstraints.floodRisk.toUpperCase()} Flood Risk`}
                    color={getConstraintColor(assessment.planningConstraints.floodRisk)}
                    variant="outlined"
                  />
                </Grid>
              )}
              {assessment.planningConstraints.nationalPark && (
                <Grid item xs={12} sm={6}>
                  <Chip label="National Park" color="success" variant="outlined" />
                </Grid>
              )}
              {assessment.planningConstraints.areaOfOutstandingNaturalBeauty && (
                <Grid item xs={12} sm={6}>
                  <Chip label="AONB" color="success" variant="outlined" />
                </Grid>
              )}
              {assessment.planningConstraints.sitesOfSpecialScientificInterest && (
                <Grid item xs={12} sm={6}>
                  <Chip label="SSSI" color="info" variant="outlined" />
                </Grid>
              )}
            </Grid>
            
            {assessment.planningConstraints.additionalConstraints && 
             assessment.planningConstraints.additionalConstraints.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Additional Constraints:</Typography>
                <List dense>
                  {assessment.planningConstraints.additionalConstraints.map((constraint, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <WarningIcon color="warning" />
                      </ListItemIcon>
                      <ListItemText primary={constraint} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              <GavelIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Permit Requirements
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              <ListItem>
                <ListItemIcon>
                  {assessment.permitRequirements.planningPermissionLikely ? 
                    <WarningIcon color="warning" /> : 
                    <CheckCircleIcon color="success" />
                  }
                </ListItemIcon>
                <ListItemText 
                  primary="Planning Permission"
                  secondary={assessment.permitRequirements.planningPermissionLikely ? 
                    'Likely required for this project' : 
                    'May not be required (subject to Permitted Development Rights)'
                  }
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  {assessment.permitRequirements.buildingRegulationsRequired ? 
                    <InfoIcon color="info" /> : 
                    <CheckCircleIcon color="success" />
                  }
                </ListItemIcon>
                <ListItemText 
                  primary="Building Regulations"
                  secondary={assessment.permitRequirements.buildingRegulationsRequired ? 
                    'Required for this project' : 
                    'Not required for this project'
                  }
                />
              </ListItem>

              {assessment.permitRequirements.partyWallAgreement && (
                <ListItem>
                  <ListItemIcon>
                    <WarningIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Party Wall Agreement"
                    secondary="May be required if work affects shared walls with neighbors"
                  />
                </ListItem>
              )}

              {assessment.permitRequirements.additionalConsents && 
               assessment.permitRequirements.additionalConsents.length > 0 && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
                    Additional Consents Required:
                  </Typography>
                  {assessment.permitRequirements.additionalConsents.map((consent, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <InfoIcon color="info" />
                      </ListItemIcon>
                      <ListItemText primary={consent} />
                    </ListItem>
                  ))}
                </>
              )}
            </List>
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* Planning Guidance */}
      {planningGuidance.length > 0 && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <Typography variant="h6" gutterBottom>
            <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Planning Guidance for Your Project
          </Typography>
          <List>
            {planningGuidance.map((guidance, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemIcon>
                  <CheckCircleIcon sx={{ color: 'primary.contrastText' }} />
                </ListItemIcon>
                <ListItemText 
                  primary={guidance}
                  sx={{ color: 'primary.contrastText' }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Recommendations */}
      {assessment.recommendations.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Recommendations
            </Typography>
            <List>
              {assessment.recommendations.map((recommendation, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary={recommendation} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* User Confirmation */}
      {!userConfirmed && (
        <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
          <Typography variant="h6" gutterBottom>
            Confirm Property Assessment
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Please review the property assessment above. If you notice any inaccuracies, 
            please contact your local council to verify the information.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              onClick={() => handleUserConfirmation(true)}
            >
              Information is Correct
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => handleUserConfirmation(true)}
            >
              Proceed with Caution
            </Button>
          </Box>
        </Paper>
      )}

      {/* Data Source */}
      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
        Data source: {assessment.dataSource} | Last updated: {new Date(assessment.lastUpdated).toLocaleDateString()}
      </Typography>
    </Box>
  );
};

export default PropertyAssessmentStep;
