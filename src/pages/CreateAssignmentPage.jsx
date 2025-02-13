import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Box,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import GenerationProgress from '../components/GenerationProgress';

const ASSIGNMENT_TYPES = [
  { value: 'P', label: 'Programming Assignment' },
  { value: 'A', label: 'Academic Writing Assignment' },
];

export default function CreateAssignmentPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    assignment_type: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [assignmentId, setAssignmentId] = useState(null);
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerationComplete = (data) => {
    if (data.status === 'completed') {
      navigate(`/assignments/${assignmentId}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${BASE_URL}/api/agents/generate/`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setAssignmentId(response.data.assignment_id);
      } else {
        setError(response.data.error || 'Failed to create assignment');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error creating assignment:', err);
      setError(err.response?.data?.error || 'Failed to create assignment');
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Create New Assignment
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading && assignmentId ? (
          <Box sx={{ mt: 4 }}>
            <GenerationProgress 
              id={assignmentId}
              baseUrl={BASE_URL}
              onComplete={handleGenerationComplete}
              onError={(error) => setError(error)}
            />
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <TextField
              name="subject"
              label="Subject/Title"
              value={formData.subject}
              onChange={handleInputChange}
              fullWidth
              required
              margin="normal"
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
              placeholder="Provide detailed requirements and instructions for your assignment..."
            />

            <FormControl fullWidth margin="normal" required>
              <InputLabel>Assignment Type</InputLabel>
              <Select
                name="assignment_type"
                value={formData.assignment_type}
                onChange={handleInputChange}
                label="Assignment Type"
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

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              sx={{ mt: 3 }}
              disabled={loading}
            >
              Generate Assignment
            </Button>
          </form>
        )}
      </Paper>
    </Container>
  );
}