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
  Alert,
  CircularProgress,
  Link,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import ChatIcon from '@mui/icons-material/Chat';
import GitHubIcon from '@mui/icons-material/GitHub';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import axios from 'axios';
import GenerationProgress from '../components/GenerationProgress';

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Assignments' },
  { value: 'completed', label: 'Completed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'revisions', label: 'Needs Revision' },
  { value: 'unpaid', label: 'Deposit Unpaid' },
  { value: 'generating', label: 'Generation In Progress' },
];

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
    if (!assignment.has_deposit_been_paid && !assignment.is_manual) return 'error';
    if (assignment.generation_status === 'in_progress') return 'info';
    return 'default';
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

  const renderDeliveryStatus = (assignment) => {
    if (assignment.is_manual) return null;

    return (
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
          <AccessTimeIcon sx={{ fontSize: 20, mr: 0.5 }} />
          <Typography variant="body2" color="text.secondary">
            Expected Delivery: {new Date(assignment.expected_delivery_time).toLocaleString()}
          </Typography>
        </Box>
        <Chip
          label={assignment.delivery_status?.timeLeft || getTimeRemaining(assignment.expected_delivery_time)}
          color={assignment.delivery_status?.canDeliver ? 'success' : 'warning'}
          size="small"
        />
        {!assignment.has_deposit_been_paid && (
          <Chip
            label="Deposit Pending"
            color="error"
            size="small"
            sx={{ ml: 1 }}
          />
        )}
      </Box>
    );
  };

  const renderAssignmentCard = (assignment) => (
    <Card>
      <CardContent>
        {/* Header Section */}
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
              label={assignment.completed ? 'Completed' : 
                     assignment.generation_status === 'in_progress' ? 'Generating' : 
                     'In Progress'}
              color={getStatusColor(assignment)}
              size="small"
            />
          </Box>
        </Box>
        
        {/* Description */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {assignment.description.substring(0, 200)}...
        </Typography>
        
        {/* Generation Progress */}
        {assignment.generation_status === 'in_progress' && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Generation Progress
            </Typography>
            <GenerationProgress 
              id={assignment.id}
              baseUrl={BASE_URL}
              onComplete={fetchAssignments}
              onError={(error) => {
                setError(error);
                fetchAssignments();
              }}
            />
          </Box>
        )}
        
        {/* Assignment Details */}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2">
              <strong>Deadline:</strong> {new Date(assignment.completion_deadline).toLocaleString()}
            </Typography>
            {!assignment.is_manual && (
              <Typography variant="body2">
                <strong>Platform:</strong> {assignment.original_platform?.platform_name || 'N/A'}
              </Typography>
            )}
            {assignment.github_repository && (
              <Link
                href={assignment.github_repository}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  mt: 1,
                  color: 'primary.main'
                }}
              >
                <GitHubIcon sx={{ fontSize: 16 }} />
                View Repository
              </Link>
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            {renderDeliveryStatus(assignment)}
          </Grid>
        </Grid>
      </CardContent>
      
      <Divider />
      
      <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<ChatIcon />}
          onClick={() => navigate(`/assignments/${assignment.id}/chat`)}
        >
          Chat
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={() => navigate(`/assignments/${assignment.id}`)}
        >
          View Details
        </Button>
      </CardActions>
    </Card>
  );

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
                  {FILTER_OPTIONS.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
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

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Assignments List */}
        <Grid container spacing={3}>
          {assignments.map((assignment) => (
            <Grid item xs={12} key={assignment.id}>
              {renderAssignmentCard(assignment)}
            </Grid>
          ))}
          
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