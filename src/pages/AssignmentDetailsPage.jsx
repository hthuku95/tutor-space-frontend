import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography,
  Paper,
  Grid,
  Box,
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
  Warning
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';

export default function AssignmentDetails() {
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    fetchAssignmentDetails();
  }, [id]);

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
      {/* Header Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
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
              onClick={() => navigate(`/assignments/assignments/${id}/chat`)}
              sx={{ mb: 1 }}
              fullWidth
            >
              Open Chat
            </Button>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Time Status Section */}
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

        {!deliveryStatus.canDeliver && assignment.completed && (
          <Alert 
            severity="info"
            icon={<Error />}
            sx={{ mb: 2 }}
          >
            Assignment is completed but cannot be delivered until the 60% time mark is reached.
          </Alert>
        )}
      </Paper>

      {/* Files Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Assignment Files
            </Typography>
            <List>
              {assignment.assignment_files?.map((file) => (
                <ListItem
                  key={file.id}
                  button
                  onClick={() => setFilePreview(file)}
                >
                  <ListItemIcon>
                    <AttachFile />
                  </ListItemIcon>
                  <ListItemText 
                    primary={file.name}
                    secondary={new Date(file.uploaded_at).toLocaleString()}
                  />
                </ListItem>
              ))}
              {(!assignment.assignment_files || assignment.assignment_files.length === 0) && (
                <ListItem>
                  <ListItemText 
                    primary="No files attached"
                    secondary="No files have been uploaded for this assignment"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Submission History
            </Typography>
            <List>
              {assignment.submissions?.map((submission) => (
                <ListItem
                  key={submission.id}
                  button
                  onClick={() => navigate(`/assignments/${id}/submissions/${submission.id}`)}
                >
                  <ListItemIcon>
                    {submission.delivered ? <CheckCircle color="success" /> : <PendingActions />}
                  </ListItemIcon>
                  <ListItemText 
                    primary={`Version ${submission.version}`}
                    secondary={`Completed: ${new Date(submission.date_completed).toLocaleString()}`}
                  />
                </ListItem>
              ))}
              {(!assignment.submissions || assignment.submissions.length === 0) && (
                <ListItem>
                  <ListItemText 
                    primary="No submissions yet"
                    secondary="Work is still in progress"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* File Preview Dialog */}
      <Dialog
        open={!!filePreview}
        onClose={() => setFilePreview(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {filePreview?.name}
        </DialogTitle>
        <DialogContent>
          {/* Add file preview logic based on file type */}
          <Box sx={{ minHeight: 400 }}>
            {filePreview?.type?.startsWith('image/') ? (
              <img 
                src={filePreview.url} 
                alt={filePreview.name}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            ) : (
              <iframe
                src={filePreview?.url}
                width="100%"
                height="400"
                title={filePreview?.name}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilePreview(null)}>Close</Button>
          <Button 
            variant="contained" 
            href={filePreview?.url}
            download
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}