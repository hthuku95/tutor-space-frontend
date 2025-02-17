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
  Card,
  CardContent,
  Link
} from '@mui/material';
import {
  AccessTime,
  Assignment,
  Chat,
  CheckCircle,
  PendingActions,
  Warning,
  GitHub,
  PlayArrow,
  History,
  Language
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import GenerationProgress from '../components/GenerationProgress';

export default function AssignmentDetails() {
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      fetchAssignmentDetails();
    } catch (error) {
      setError('Failed to start generation process: ' + (error.response?.data?.error || error.message));
    }
  };

  const getTimeRemaining = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    return `${diffDays} days remaining`;
  };

  const renderDeliveryStatus = () => {
    if (!assignment || assignment.is_manual) {
      return null;
    }

    const expectedDelivery = new Date(assignment.expected_delivery_time);
    const now = new Date();
    const totalTime = new Date(assignment.completion_deadline) - new Date(assignment.timestamp);
    const timeLeft = expectedDelivery - now;
    const progress = (1 - (timeLeft / totalTime)) * 100;

    return (
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
                  {timeLeft <= 0 
                    ? 'Ready for delivery'
                    : `Time until 60% mark: ${getTimeRemaining(expectedDelivery)}`
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
                      bgcolor: timeLeft <= 0 ? 'success.main' : 'primary.main',
                      width: `${Math.min(Math.max(progress, 0), 100)}%`,
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
                  {expectedDelivery.toLocaleString()}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!assignment) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        {/* Header Section */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8}>
            <Typography variant="h4" gutterBottom>
              {assignment.subject}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
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
              {!assignment.is_manual && (
                <Chip
                  label={assignment.original_platform?.platform_name || 'External Platform'}
                  color="info"
                  icon={<Language />}
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
            <GenerationProgress 
              id={assignment.id}
              baseUrl={BASE_URL}
              onComplete={() => fetchAssignmentDetails()}
              onError={(error) => setError(error)}
            />
          </Paper>
        )}

        {/* Delivery Status Section - Only for non-manual assignments */}
        {renderDeliveryStatus()}

        {/* Description Section */}
        <Typography variant="h6" gutterBottom>
          Description
        </Typography>
        <Typography variant="body1" paragraph>
          {assignment.description}
        </Typography>

        {/* Status Alerts */}
        {!assignment.has_deposit_been_paid && !assignment.is_manual && (
          <Alert 
            severity="warning" 
            icon={<Warning />}
            sx={{ mb: 2 }}
          >
            Waiting for client deposit payment before starting the assignment.
          </Alert>
        )}

        {/* Start Generation Button - Only show for non-manual assignments with deposit paid */}
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