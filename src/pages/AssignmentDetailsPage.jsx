import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box,
  Paper,
  Grid,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Link
} from '@mui/material';
import {
  AccessTime,
  Assignment,
  AttachFile,
  Chat,
  CheckCircle,
  Error,
  History,
  PendingActions,
  Warning,
  GitHub,
  PlayArrow
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const GENERATION_STEPS = [
  'Analyzing Requirements',
  'Generating Plan',
  'Creating Project',
  'Reviewing',
  'Final Verification',
  'Pushing to GitHub'
];

export default function AssignmentDetails() {
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [generationProgress, setGenerationProgress] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const { id } = useParams();
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const fetchAssignmentDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${BASE_URL}/api/assignments/assignments/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch assignment details');
      const data = await response.json();
      setAssignment(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignmentDetails();
  }, [id]);

  // WebSocket connection for generation progress
  useEffect(() => {
    let ws;

    const connectWebSocket = () => {
      // Close existing connection if any
      if (ws) {
        ws.close();
      }

      console.log('Connecting to WebSocket...');
      ws = new WebSocket(
        `${BASE_URL.replace('http', 'ws')}/ws/assignments/${id}/generation/`
      );

      ws.onopen = () => {
        console.log('WebSocket connected');
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('WebSocket message:', data);
        
        // Update progress state
        setGenerationProgress(data);
        
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
            fetchAssignmentDetails(); // Refresh assignment details
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
    };

    // Connect if assignment is being generated
    if (assignment?.generation_status === 'in_progress') {
      connectWebSocket();
    }

    return () => {
      if (ws) {
        console.log('Cleaning up WebSocket connection');
        ws.close();
      }
    };
  }, [assignment?.generation_status, id]);

  const handleStartGeneration = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${BASE_URL}/api/agents/assignments/${id}/process/`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      // Refresh assignment details to get updated generation status
      fetchAssignmentDetails();
    } catch (error) {
      setError('Failed to start generation process');
    }
  };

  const getDeliveryStatus = () => {
    if (!assignment) return {};
    const expectedDelivery = new Date(assignment.expected_delivery_time);
    const now = new Date();
    const totalTime = new Date(assignment.completion_deadline) - new Date(assignment.timestamp);
    const timeLeft = expectedDelivery - now;
    const progress = (1 - (timeLeft / totalTime)) * 100;

    return {
      canDeliver: now >= expectedDelivery,
      progress: Math.min(Math.max(progress, 0), 100),
      timeLeft: Math.max(timeLeft, 0),
      expectedDeliveryDate: expectedDelivery
    };
  };

  const formatTimeLeft = (ms) => {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days} days ${hours} hours`;
    if (hours > 0) return `${hours} hours ${minutes} minutes`;
    return `${minutes} minutes`;
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Alert severity="error">{error}</Alert>
    </Container>
  );

  if (!assignment) return null;

  const deliveryStatus = getDeliveryStatus();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        {/* Header Section */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8}>
            <Typography variant="h4" gutterBottom>
              {assignment.subject}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip
                label={assignment.assignment_type_display}
                color="primary"
                icon={<Assignment />}
              />
              <Chip
                label={assignment.completed ? 'Completed' : 'In Progress'}
                color={assignment.completed ? 'success' : 'warning'}
                icon={assignment.completed ? <CheckCircle /> : <PendingActions />}
              />
              {assignment.has_revisions && (
                <Chip
                  label="Has Revisions"
                  color="warning"
                  icon={<History />}
                />
              )}
            </Box>
          </Grid>
          <Grid item xs={12} sm={4} sx={{ textAlign: 'right' }}>
            <Button
              variant="contained"
              startIcon={<Chat />}
              onClick={() => navigate(`/assignments/${id}/chat`)}
              sx={{ mb: 1 }}
              fullWidth
            >
              Open Chat
            </Button>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Generation Progress Section */}
        {assignment.generation_status === 'in_progress' && (
          <Paper sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
            <Typography variant="h6" gutterBottom>
              Generation Progress
            </Typography>
            <Stepper activeStep={activeStep} alternativeLabel>
              {GENERATION_STEPS.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                {generationProgress?.message || 'Processing...'}
              </Typography>
              <CircularProgress />
            </Box>
          </Paper>
        )}

        {/* Delivery Status Section */}
        <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Delivery Status
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AccessTime sx={{ mr: 1 }} color="action" />
                  <Typography variant="body1">
                    {deliveryStatus.canDeliver 
                      ? 'Ready for delivery'
                      : `Time until 60% mark: ${formatTimeLeft(deliveryStatus.timeLeft)}`
                    }
                  </Typography>
                </Box>
                <Box sx={{ position: 'relative', pt: 1 }}>
                  <Box
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      bgcolor: 'grey.300',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        height: '100%',
                        borderRadius: 5,
                        bgcolor: deliveryStatus.canDeliver ? 'success.main' : 'primary.main',
                        width: `${deliveryStatus.progress}%`,
                        transition: 'width 0.5s ease-in-out',
                      }}
                    />
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" color="textSecondary">
                    Expected Delivery:
                  </Typography>
                  <Typography variant="body1">
                    {deliveryStatus.expectedDeliveryDate.toLocaleString()}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Description Section */}
        <Typography variant="h6" gutterBottom>
          Description
        </Typography>
        <Typography variant="body1" paragraph>
          {assignment.description}
        </Typography>

        {/* Status Alerts */}
        {!assignment.has_deposit_been_paid && (
          <Alert 
            severity="warning" 
            icon={<Warning />}
            sx={{ mb: 2 }}
          >
            Waiting for client deposit payment before starting the assignment.
          </Alert>
        )}

        {/* Start Generation Button - Only show for non-manual platform assignments */}
        {assignment.has_deposit_been_paid && 
         !assignment.completed && 
         !assignment.is_manual && 
         assignment.generation_status === 'not_started' && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleStartGeneration}
            startIcon={<PlayArrow />}
            sx={{ mt: 2 }}
          >
            Start Generation Process
          </Button>
        )}

        {/* GitHub Repository Section */}
        {assignment.github_repository && (
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <GitHub sx={{ mr: 1 }} />
              GitHub Repository
            </Typography>
            <Link
              href={assignment.github_repository}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ display: 'block', mt: 1 }}
            >
              View Repository
            </Link>
          </Paper>
        )}
      </Paper>
    </Container>
  );
}