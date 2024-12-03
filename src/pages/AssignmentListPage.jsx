import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Card,
  CardContent, 
  CardActions,
  Button,
  Chip,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import ChatIcon from '@mui/icons-material/Chat';
import axios from 'axios';



export default function AssignmentListPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('deadline');
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    fetchAssignments();
  }, [filter]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${BASE_URL}/api/assignments/assignments/`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { filter, search: searchQuery, sort: sortBy }
        }
      );
      setAssignments(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Error fetching assignments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (assignment) => {
    if (assignment.completed) return 'success';
    if (assignment.has_revisions) return 'warning';
    if (!assignment.has_deposit_been_paid) return 'error';
    return 'info';
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

  const getDeliveryStatus = (assignment) => {
    const expectedDelivery = new Date(assignment.expected_delivery_time);
    const now = new Date();
    const canDeliver = now >= expectedDelivery;
    
    return {
      canDeliver,
      timeLeft: canDeliver ? 'Ready for delivery' : getTimeRemaining(assignment.expected_delivery_time)
    };
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Assignments
        </Typography>

        {/* Search and Filter Section */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                placeholder="Search assignments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={() => fetchAssignments()}>
                      <SearchIcon />
                    </IconButton>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Filter</InputLabel>
                <Select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  label="Filter"
                >
                  <MenuItem value="all">All Assignments</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="revisions">Needs Revision</MenuItem>
                  <MenuItem value="unpaid">Deposit Unpaid</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort By"
                >
                  <MenuItem value="deadline">Deadline</MenuItem>
                  <MenuItem value="created">Date Created</MenuItem>
                  <MenuItem value="subject">Subject</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Assignments List */}
        <Grid container spacing={3}>
          {assignments.map((assignment) => {
            const deliveryStatus = getDeliveryStatus(assignment);
            return (
              <Grid item xs={12} key={assignment.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" component="div">
                        {assignment.subject}
                      </Typography>
                      <Box>
                        <Chip 
                          label={assignment.assignment_type_display}
                          color="primary"
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          label={assignment.completed ? 'Completed' : 'In Progress'}
                          color={getStatusColor(assignment)}
                          size="small"
                        />
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {assignment.description.substring(0, 200)}...
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <strong>Deadline:</strong> {new Date(assignment.completion_deadline).toLocaleString()}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Expected Delivery:</strong> {new Date(assignment.expected_delivery_time).toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <Chip
                            label={deliveryStatus.timeLeft}
                            color={deliveryStatus.canDeliver ? 'success' : 'warning'}
                            sx={{ mr: 1 }}
                          />
                          {!assignment.has_deposit_been_paid && (
                            <Chip
                              label="Deposit Pending"
                              color="error"
                              sx={{ mr: 1 }}
                            />
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                  
                  <Divider />
                  
                  <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ChatIcon />}
                      onClick={() => navigate(`/assignments/assignments/${assignment.id}/chat`)}
                    >
                      Chat
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => navigate(`/assignments/assignments/${assignment.id}`)}
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
          
          {/* Empty State */}
          {!loading && assignments.length === 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  No assignments found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {filter === 'all' 
                    ? "You don't have any assignments yet"
                    : "No assignments match the selected filter"}
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
    </Container>
  );
}