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
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ASSIGNMENT_TYPES = [
  { value: 'P', label: 'Programming Assignment' },
  { value: 'A', label: 'Academic Writing Assignment' },
];

const GENERATION_STEPS = [
  'Analyzing Requirements',
  'Generating Plan',
  'Creating Project',
  'Reviewing',
  'Final Verification',
  'Pushing to GitHub'
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
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(null);
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
        // Create WebSocket connection for progress updates
        const ws = new WebSocket(
          `${BASE_URL.replace('http://', 'ws://')}/assignments/${response.data.assignment_id}/generation/`
        );

        ws.onopen = () => {
          console.log('WebSocket Connected');
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log('WebSocket message:', data);
          setProgress(data);
          
          // Update stepper based on status
          switch (data.status) {
            case 'analyzing':
              setActiveStep(0);
              break;
            case 'planning':
              setActiveStep(1);
              break;
            case 'generating':
              setActiveStep(2);
              break;
            case 'reviewing':
              setActiveStep(3);
              break;
            case 'final_review':
              setActiveStep(4);
              break;
            case 'completed':
              setActiveStep(5);
              // Navigate to assignment details when complete
              ws.close();
              navigate(`/assignments/${response.data.assignment_id}`);
              break;
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setError('Error connecting to real-time updates');
        };

        ws.onclose = () => {
          console.log('WebSocket connection closed');
        };

      } else {
        setError(response.data.error || 'Failed to create assignment');
        setLoading(false);
      }
    } catch (err) {
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

        {loading ? (
          <Box sx={{ mt: 4 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {GENERATION_STEPS.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            
            {progress && (
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  {progress.message || 'Processing...'}
                </Typography>
                <CircularProgress />
              </Box>
            )}
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