import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  LinearProgress,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  Download as DownloadIcon,
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Project } from '../../services/projectService';
import { documentService, ProjectDocument } from '../../services/documentService';

interface ProjectOverviewTabProps {
  project: Project;
}

const ProjectOverviewTab: React.FC<ProjectOverviewTabProps> = ({ project }) => {
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [selectedDocType, setSelectedDocType] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');

  const documentTypes = [
    'Planning Application',
    'Building Regulations',
    'Structural Calculations',
    'Architectural Drawings',
    'Site Survey',
    'Property Deeds',
    'Insurance Documents',
    'Existing Plans',
    'Photos/Images',
    'Other'
  ];

  const acceptedFormats = '.pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.dwg,.dxf,.skp,.3dm,.rvt';

  useEffect(() => {
    const loadDocuments = async () => {
      if (!project.id) return;
      
      try {
        const docs = await documentService.getProjectDocuments(project.id);
        setDocuments(docs);
      } catch (error) {
        console.error('Failed to load documents:', error);
      } finally {
        setLoadingDocs(false);
      }
    };

    loadDocuments();
  }, [project.id]);

  const loadDocuments = async () => {
    if (!project.id) return;
    
    try {
      const docs = await documentService.getProjectDocuments(project.id);
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0 || !selectedDocType || !project.id) return;

    setUploading(true);
    setError('');

    try {
      for (const file of files) {
        await documentService.uploadDocument(project.id, file, selectedDocType);
      }
      
      await loadDocuments();
      setSelectedDocType('');
      event.target.value = '';
      
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to upload documents');
    } finally {
      setUploading(false);
    }
  };

  const removeDocument = async (documentId: string) => {
    try {
      await documentService.deleteDocument(documentId);
      await loadDocuments();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to delete document');
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

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return <PdfIcon color="error" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <ImageIcon color="primary" />;
      default:
        return <FileIcon color="action" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Project Vision
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

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Project Documents ({documents.length})
            </Typography>
            
            {/* Upload Section */}
            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth sx={{ mb: 2 }} size="small">
                <InputLabel>Document Type</InputLabel>
                <Select
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value)}
                  label="Document Type"
                >
                  {documentTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                variant="outlined"
                component="label"
                startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
                fullWidth
                disabled={!selectedDocType || uploading}
                size="small"
              >
                {uploading ? 'Uploading...' : 'Upload Documents'}
                <input
                  type="file"
                  hidden
                  multiple
                  accept={acceptedFormats}
                  onChange={handleFileUpload}
                />
              </Button>
            </Box>

            {loadingDocs ? (
              <Typography variant="body2" color="text.secondary">
                Loading documents...
              </Typography>
            ) : documents.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No documents uploaded yet
              </Typography>
            ) : (
              <List dense>
                {documents.map((doc) => (
                  <ListItem key={doc.id} sx={{ px: 0 }}>
                    <ListItemIcon>
                      {getFileIcon(doc.fileName)}
                    </ListItemIcon>
                    <ListItemText
                      primary={doc.originalName}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Chip label={doc.documentType} size="small" variant="outlined" />
                          <Typography variant="caption" color="text.secondary">
                            {formatFileSize(doc.fileSize)}
                          </Typography>
                        </Box>
                      }
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton size="small">
                        <DownloadIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => removeDocument(doc.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default ProjectOverviewTab;
