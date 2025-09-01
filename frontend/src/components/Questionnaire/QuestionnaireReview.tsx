import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { questionnaireService } from '../../services/questionnaireService';
import { QuestionnaireResponse, QuestionnaireQuestion } from '../../types/questionnaire';
import QuestionRenderer from './QuestionRenderer';

interface QuestionnaireReviewProps {
  projectId: string;
  responses: QuestionnaireResponse[];
  onUpdate?: (responses: QuestionnaireResponse[]) => void;
}

const QuestionnaireReview: React.FC<QuestionnaireReviewProps> = ({ 
  projectId, 
  responses, 
  onUpdate 
}) => {
  const [editingResponse, setEditingResponse] = useState<QuestionnaireResponse | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<QuestionnaireQuestion | null>(null);
  const [editValue, setEditValue] = useState<string | number | boolean>('');
  const [saving, setSaving] = useState(false);

  const handleEdit = (response: QuestionnaireResponse) => {
    setEditingResponse(response);
    setEditValue(response.answer);
    // In a real implementation, you'd fetch the question details
    // For now, we'll create a basic question structure
    setEditingQuestion({
      id: response.questionId,
      text: `Question ${response.questionId}`,
      type: 'text',
      required: false
    });
  };

  const handleSave = async () => {
    if (!editingResponse) return;
    
    try {
      setSaving(true);
      await questionnaireService.updateResponse(
        projectId,
        'current-session', // In real implementation, get from session
        editingResponse.questionId,
        {
          questionId: editingResponse.questionId,
          answer: editValue
        }
      );
      
      if (onUpdate) {
        const updatedResponses = responses.map(r => 
          r.questionId === editingResponse.questionId 
            ? { ...r, answer: editValue }
            : r
        );
        onUpdate(updatedResponses);
      }
      
      setEditingResponse(null);
      setEditingQuestion(null);
    } catch (error) {
      console.error('Failed to update response:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingResponse(null);
    setEditingQuestion(null);
    setEditValue('');
  };

  const formatAnswer = (answer: string | number | boolean) => {
    if (typeof answer === 'boolean') {
      return answer ? 'Yes' : 'No';
    }
    return String(answer);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Your Responses ({responses.length})
      </Typography>
      
      <Card>
        <CardContent>
          <List>
            {responses.map((response, index) => (
              <ListItem key={response.questionId} divider={index < responses.length - 1}>
                <ListItemText
                  primary={`Question ${index + 1}`}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Answer: {formatAnswer(response.answer)}
                      </Typography>
                      <Chip 
                        label={new Date(response.timestamp).toLocaleDateString()}
                        size="small"
                        variant="outlined"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton 
                    edge="end" 
                    onClick={() => handleEdit(response)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog 
        open={!!editingResponse} 
        onClose={handleCancel}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Response</DialogTitle>
        <DialogContent>
          {editingQuestion && (
            <QuestionRenderer
              question={editingQuestion}
              value={editValue}
              onChange={setEditValue}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} startIcon={<CancelIcon />}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            disabled={saving}
            startIcon={<SaveIcon />}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuestionnaireReview;
