import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Chip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';
import { documentService, ProjectDocument } from '../../services/documentService';

export interface LocalDocument {
  file: File;
  documentType: string;
  id: string;
}

interface DocumentsStepProps {
  data?: LocalDocument[];
  onChange?: (documents: LocalDocument[]) => void;
  onComplete?: (documents: LocalDocument[]) => void;
  initialDocuments?: LocalDocument[];
  projectId?: string;
}

const DocumentsStep: React.FC<DocumentsStepProps> = ({ 
  data, 
  onChange, 
  onComplete, 
  initialDocuments,
  projectId 
}) => {
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [localDocuments, setLocalDocuments] = useState<LocalDocument[]>(data || []);
  const [selectedDocType, setSelectedDocType] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (projectId) {
      loadDocuments();
    }
  }, [projectId]);

  const loadDocuments = async () => {
    if (!projectId) return;
    
    try {
      const docs = await documentService.getProjectDocuments(projectId);
      setDocuments(docs);
    } catch (err: any) {
      console.error('Failed to load documents:', err);
    }
  };

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0 || !selectedDocType) return;

    if (projectId) {
      // Project exists - upload directly to S3
      setUploading(true);
      setError('');

      try {
        for (const file of files) {
          await documentService.uploadDocument(projectId, file, selectedDocType);
        }
        
        await loadDocuments();
        setSelectedDocType('');
        event.target.value = '';
        
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'Failed to upload documents');
      } finally {
        setUploading(false);
      }
    } else {
      // Project creation mode - store files locally
      const newLocalDocs: LocalDocument[] = files.map(file => ({
        file,
        documentType: selectedDocType,
        id: Math.random().toString(36).substr(2, 9)
      }));

      const updatedLocalDocs = [...localDocuments, ...newLocalDocs];
      setLocalDocuments(updatedLocalDocs);
      
      // Update parent component with documents (including type info)
      onChange?.(updatedLocalDocs);
      
      setSelectedDocType('');
      event.target.value = '';
    }
  };

  const removeDocument = async (documentId: string) => {
    if (projectId) {
      // Remove from S3
      try {
        await documentService.deleteDocument(documentId);
        await loadDocuments();
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'Failed to delete document');
      }
    } else {
      // Remove from local storage
      const updatedLocalDocs = localDocuments.filter(doc => doc.id !== documentId);
      setLocalDocuments(updatedLocalDocs);
      
      onChange?.(updatedLocalDocs);
    }
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

  const totalDocuments = projectId ? documents.length : localDocuments.length;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Upload Project Documents
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Upload any relevant documents for your project. This is optional but can help builders understand your requirements better.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        📎 Supported formats: PDF, Word, PowerPoint, Images, CAD files (DWG, DXF), SketchUp, Revit
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Add Documents
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
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
                sx={{ mb: 2 }}
              >
                {uploading ? 'Uploading...' : 'Choose Files'}
                <input
                  type="file"
                  hidden
                  multiple
                  accept={acceptedFormats}
                  onChange={handleFileUpload}
                />
              </Button>

              <Typography variant="body2" color="text.secondary">
                {projectId 
                  ? 'Select document type first, then choose files to upload' 
                  : 'Select document type and files. They will be uploaded when you create the project.'
                }
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {projectId ? 'Uploaded Documents' : 'Selected Documents'} ({totalDocuments})
              </Typography>
              
              {totalDocuments === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  {projectId ? 'No documents uploaded yet' : 'No documents selected yet'}
                </Typography>
              ) : (
                <List dense>
                  {projectId ? (
                    // Show uploaded documents
                    documents.map((doc) => (
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
                        <IconButton
                          edge="end"
                          onClick={() => removeDocument(doc.id)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItem>
                    ))
                  ) : (
                    // Show local documents
                    localDocuments.map((doc) => (
                      <ListItem key={doc.id} sx={{ px: 0 }}>
                        <ListItemIcon>
                          {getFileIcon(doc.file.name)}
                        </ListItemIcon>
                        <ListItemText
                          primary={doc.file.name}
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <Chip label={doc.documentType} size="small" variant="outlined" />
                              <Typography variant="caption" color="text.secondary">
                                {formatFileSize(doc.file.size)}
                              </Typography>
                            </Box>
                          }
                        />
                        <IconButton
                          edge="end"
                          onClick={() => removeDocument(doc.id)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItem>
                    ))
                  )}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DocumentsStep;
