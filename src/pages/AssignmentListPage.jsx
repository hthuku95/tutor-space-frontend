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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
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

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${BASE_URL}/api/assignments/assignments/?filter=${filter}&search=${searchQuery}&sort=${sortBy}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch assignments');
      const data = await response.json();
      setAssignments(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Error fetching assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [filter, sortBy]);

  const getStatusColor = (assignment) => {
    if (!assignment) return 'default';
    if (assignment.completed) return 'success';
    if (assignment.has_revisions) return 'warning';
    if (!assignment.is_manual && !assignment.has_deposit_been_paid) return 'error';
    if (assignment.generation_status === 'in_progress') return 'info';
    return 'default';
  };

  const shouldShowGenerationProgress = (assignment) => {
    if (!assignment) return false;
    if (!assignment.generation_status) return false;
    
    const status = assignment.generation_status;
    
    // First check for exact matches
    if (status === 'not_started' || status === 'completed') return false;
    
    // Then check for valid generation states
    return status === 'in_progress' || 
           status === 'analyzing' ||
           status === 'error' ||
           status === 'failed' ||
           status === 'analysis_failed' ||
           status === 'planning_failed' ||
           status === 'implementation_failed';
  };

  const renderPlatformInfo = (assignment) => {
    if (!assignment) return null;
    if (assignment.is_manual) return null;
    if (!assignment.original_platform) return null;
    if (!assignment.expected_delivery_time) return null;

    return (
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
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
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip 
              label={assignment.assignment_type_display}
              color="primary"
              size="small"
            />
            <Chip
              icon={assignment.completed ? <CheckCircleIcon /> : <PendingActionsIcon />}
              label={assignment.completed ? 'Completed' : 'In Progress'}
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
        {shouldShowGenerationProgress(assignment) && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Generation Progress
            </Typography>
            <GenerationProgress 
              id={assignment.id}
              baseUrl={BASE_URL}
              onComplete={() => {
                fetchAssignments();
                setError(null);
              }}
              onError={(error) => {
                console.error('Generation error:', error);
                setError(error);
                fetchAssignments();
              }}
            />
          </Box>
        )}
        
        {/* Assignment Details */}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="body2" gutterBottom>
                <strong>Deadline:</strong> {new Date(assignment.completion_deadline).toLocaleString()}
              </Typography>
              {assignment && !assignment.is_manual && assignment.original_platform && (
                <Typography variant="body2" gutterBottom>
                  <strong>Platform:</strong> {assignment.original_platform.platform_name}
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
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            {renderPlatformInfo(assignment)}
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
                onKeyPress={(e) => e.key === 'Enter' && fetchAssignments()}
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={fetchAssignments}>
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

        {/* Assignment List */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
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
        )}
      </Box>
    </Container>
  );
}