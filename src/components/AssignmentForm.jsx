import React from 'react';
import {
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert
} from '@mui/material';
import { Send } from '@mui/icons-material';

const ASSIGNMENT_TYPES = [
  { value: 'P', label: 'Programming Assignment' },
  { value: 'A', label: 'Academic Writing Assignment' },
];

export default function AssignmentForm({
  onSubmit,
  loading = false,
  error = null,
  initialValues = {}
}) {
  const [formData, setFormData] = React.useState({
    subject: '',
    description: '',
    assignment_type: '',
    ...initialValues
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Paper sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Assignment Details
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please provide detailed requirements for your assignment.
          </Typography>
        </Box>

        <TextField
          name="subject"
          label="Title/Subject"
          value={formData.subject}
          onChange={handleInputChange}
          fullWidth
          required
          margin="normal"
          disabled={loading}
        />

        <TextField
          name="description"
          label="Description"
          value={formData.description}
          onChange={handleInputChange}
          fullWidth
          required
          margin="normal"
          multiline
          rows={4}
          placeholder="Provide detailed requirements and instructions for the assignment..."
          disabled={loading}
        />

        <FormControl fullWidth margin="normal" required>
          <InputLabel>Assignment Type</InputLabel>
          <Select
            name="assignment_type"
            value={formData.assignment_type}
            onChange={handleInputChange}
            label="Assignment Type"
            disabled={loading}
          >
            {ASSIGNMENT_TYPES.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {formData.assignment_type === 'P' && (
          <Alert severity="info" sx={{ mt: 2 }}>
            For programming assignments, please include:
            <ul>
              <li>Required technologies and frameworks</li>
              <li>Expected functionality</li>
              <li>Any specific architecture requirements</li>
              <li>Testing requirements (if any)</li>
            </ul>
          </Alert>
        )}

        {formData.assignment_type === 'A' && (
          <Alert severity="info" sx={{ mt: 2 }}>
            For academic writing assignments, please include:
            <ul>
              <li>Topic and scope</li>
              <li>Citation style (e.g., APA, MLA)</li>
              <li>Required number of sources</li>
              <li>Any specific formatting requirements</li>
            </ul>
          </Alert>
        )}

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={<Send />}
            size="large"
          >
            {loading ? 'Generating...' : 'Generate Assignment'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
}