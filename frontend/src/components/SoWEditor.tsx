import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Divider,
  Chip
} from '@mui/material';
import {
  DragIndicator,
  Add,
  Delete,
  Edit,
  Save,
  AutoFixHigh,
  CheckCircle
} from '@mui/icons-material';
import { sowService, ScopeOfWork } from '../services/sowService';
import { apiService } from '../services/api';

interface SoWItem {
  id: string;
  type: 'scope' | 'material' | 'labor' | 'timeline' | 'cost' | 'permit' | 'standard';
  title: string;
  description: string;
  quantity?: number;
  unit?: string;
  cost?: number;
  duration?: number;
  editable?: boolean;
}

interface SoWEditorProps {
  projectId: string;
  sowId: string;
  onComplete: () => void;
}

const SoWEditor: React.FC<SoWEditorProps> = ({ projectId, sowId, onComplete }) => {
  const [items, setItems] = useState<SoWItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [editDialog, setEditDialog] = useState<{ open: boolean; item?: SoWItem }>({ open: false });
  const [addDialog, setAddDialog] = useState<{ open: boolean; afterIndex?: number }>({ open: false });
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadSoW();
  }, [projectId, sowId]);

  const loadSoW = async () => {
    try {
      const sow = await sowService.getSoW(projectId, sowId);
      const sowItems = convertSoWToItems(sow);
      setItems(sowItems);
    } catch (error) {
      setError('Failed to load SoW');
    } finally {
      setLoading(false);
    }
  };

  const convertSoWToItems = (sow: ScopeOfWork): SoWItem[] => {
    const items: SoWItem[] = [];
    
    // Convert sections to items
    sow.sections.forEach((section, index) => {
      items.push({
        id: `section-${index}`,
        type: 'scope',
        title: section.title,
        description: section.content,
        editable: true
      });
    });

    return items;
  };

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (!draggedItem) return;

    const draggedIndex = items.findIndex(item => item.id === draggedItem);
    if (draggedIndex === -1) return;

    const newItems = [...items];
    const [draggedItemObj] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, draggedItemObj);
    
    setItems(newItems);
    setDraggedItem(null);
  };

  const handleAddItem = (afterIndex?: number) => {
    setAddDialog({ open: true, afterIndex });
  };

  const handleSaveNewItem = (newItem: Omit<SoWItem, 'id'>) => {
    const item: SoWItem = {
      ...newItem,
      id: `custom-${Date.now()}`,
      editable: true
    };

    const newItems = [...items];
    const insertIndex = addDialog.afterIndex !== undefined ? addDialog.afterIndex + 1 : newItems.length;
    newItems.splice(insertIndex, 0, item);
    
    setItems(newItems);
    setAddDialog({ open: false });
  };

  const handleEditItem = (item: SoWItem) => {
    setEditDialog({ open: true, item });
  };

  const handleSaveEdit = (updatedItem: SoWItem) => {
    setItems(items.map(item => item.id === updatedItem.id ? updatedItem : item));
    setEditDialog({ open: false });
  };

  const handleDeleteItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const handleUpdateSoW = async () => {
    try {
      setSaving(true);
      await apiService.put(`/projects/${projectId}/sow/${sowId}`, { items });
      setError('');
    } catch (error) {
      setError('Failed to update SoW');
    } finally {
      setSaving(false);
    }
  };

  const handleProcessWithAI = async () => {
    try {
      setProcessing(true);
      const response = await apiService.post(`/projects/${projectId}/sow/${sowId}/process`, { items }) as any;
      const processedItems = response.items;
      setItems(processedItems);
      setError('');
    } catch (error) {
      setError('Failed to process SoW with AI');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Edit Scope of Work</Typography>
        <Box>
          <Button
            variant="outlined"
            onClick={handleUpdateSoW}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : <Save />}
            sx={{ mr: 1 }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            variant="contained"
            onClick={handleProcessWithAI}
            disabled={processing}
            startIcon={processing ? <CircularProgress size={20} /> : <AutoFixHigh />}
            sx={{ mr: 1 }}
          >
            {processing ? 'Processing...' : 'Process with AI'}
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={onComplete}
            startIcon={<CheckCircle />}
          >
            Complete & Invite Builders
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        variant="outlined"
        startIcon={<Add />}
        onClick={() => handleAddItem()}
        sx={{ mb: 2 }}
      >
        Add Item at Top
      </Button>

      {items.map((item, index) => (
        <Box key={item.id}>
          <Card
            sx={{ 
              mb: 2, 
              cursor: 'move',
              opacity: draggedItem === item.id ? 0.5 : 1,
              '&:hover': { boxShadow: 3 }
            }}
            draggable
            onDragStart={(e) => handleDragStart(e, item.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
          >
            <CardContent>
              <Box display="flex" alignItems="flex-start">
                <DragIndicator sx={{ mr: 1, mt: 0.5, color: 'text.secondary' }} />
                <Box flex={1}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Chip 
                      label={item.type} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="h6" component="div" flex={1}>
                      {item.title}
                    </Typography>
                    <IconButton size="small" onClick={() => handleEditItem(item)}>
                      <Edit />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteItem(item.id)}>
                      <Delete />
                    </IconButton>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {item.description}
                  </Typography>
                  <Box display="flex" gap={2}>
                    {item.quantity && (
                      <Typography variant="caption">
                        Qty: {item.quantity} {item.unit}
                      </Typography>
                    )}
                    {item.cost && (
                      <Typography variant="caption">
                        Cost: £{item.cost.toLocaleString()}
                      </Typography>
                    )}
                    {item.duration && (
                      <Typography variant="caption">
                        Duration: {item.duration} days
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
          
          <Button
            variant="text"
            size="small"
            startIcon={<Add />}
            onClick={() => handleAddItem(index)}
            sx={{ mb: 1, ml: 2 }}
          >
            Add item here
          </Button>
        </Box>
      ))}

      <ItemDialog
        open={editDialog.open}
        item={editDialog.item}
        onSave={handleSaveEdit}
        onClose={() => setEditDialog({ open: false })}
        title="Edit Item"
      />

      <ItemDialog
        open={addDialog.open}
        onSave={handleSaveNewItem}
        onClose={() => setAddDialog({ open: false })}
        title="Add New Item"
      />
    </Box>
  );
};

interface ItemDialogProps {
  open: boolean;
  item?: SoWItem;
  onSave: (item: SoWItem) => void;
  onClose: () => void;
  title: string;
}

const ItemDialog: React.FC<ItemDialogProps> = ({ open, item, onSave, onClose, title }) => {
  const [formData, setFormData] = useState<Partial<SoWItem>>({
    type: 'scope',
    title: '',
    description: '',
    quantity: 1,
    unit: 'item',
    cost: 0,
    duration: 1
  });

  useEffect(() => {
    if (item) {
      setFormData(item);
    } else {
      setFormData({
        type: 'scope',
        title: '',
        description: '',
        quantity: 1,
        unit: 'item',
        cost: 0,
        duration: 1
      });
    }
  }, [item, open]);

  const handleSave = () => {
    if (formData.title && formData.description) {
      onSave(formData as SoWItem);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <TextField
            select
            label="Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            SelectProps={{ native: true }}
            fullWidth
            margin="normal"
          >
            <option value="scope">Scope</option>
            <option value="material">Material</option>
            <option value="labor">Labor</option>
            <option value="timeline">Timeline</option>
            <option value="cost">Cost</option>
            <option value="permit">Permit</option>
            <option value="standard">Standard</option>
          </TextField>
          
          <TextField
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            fullWidth
            margin="normal"
          />
          
          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            multiline
            rows={3}
            fullWidth
            margin="normal"
          />
          
          {formData.type === 'material' && (
            <>
              <TextField
                label="Quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                margin="normal"
                sx={{ mr: 1, width: '48%' }}
              />
              <TextField
                label="Unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                margin="normal"
                sx={{ width: '48%' }}
              />
            </>
          )}
          
          {(formData.type === 'material' || formData.type === 'cost') && (
            <TextField
              label="Cost (£)"
              type="number"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
              fullWidth
              margin="normal"
            />
          )}
          
          {(formData.type === 'timeline' || formData.type === 'labor') && (
            <TextField
              label="Duration (days)"
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
              fullWidth
              margin="normal"
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SoWEditor;
