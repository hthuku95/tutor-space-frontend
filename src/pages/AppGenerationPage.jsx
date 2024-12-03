import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  IconButton,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const ROLES = ['frontend', 'backend', 'database', 'infrastructure', 'other'];

const TechnologyInput = ({ tech, onUpdate, onDelete }) => {
  return (
    <Paper elevation={1} sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center' }}>
      <FormControl sx={{ mr: 2, minWidth: 120 }}>
        <InputLabel>Role</InputLabel>
        <Select
          value={tech.role}
          label="Role"
          onChange={(e) => onUpdate({ ...tech, role: e.target.value })}
        >
          {ROLES.map(role => (
            <MenuItem key={role} value={role}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label="Technology Name"
        value={tech.name}
        onChange={(e) => onUpdate({ ...tech, name: e.target.value })}
        sx={{ flexGrow: 1, mr: 2 }}
        placeholder="Enter technology name (e.g., React, Python, PostgreSQL)"
      />
      <TextField
        label="Version (optional)"
        value={tech.version}
        onChange={(e) => onUpdate({ ...tech, version: e.target.value })}
        sx={{ width: 150, mr: 2 }}
        placeholder="e.g., 18, 3.11"
      />
      <IconButton onClick={onDelete} color="error">
        <DeleteIcon />
      </IconButton>
    </Paper>
  );
};

TechnologyInput.propTypes = {
  tech: PropTypes.shape({
    id: PropTypes.number.isRequired,
    role: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    version: PropTypes.string
  }).isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

function AppGenerationPage() {
  const [instructions, setInstructions] = useState('');
  const [technologies, setTechnologies] = useState([]);
  const [isAddingTech, setIsAddingTech] = useState(false);
  const [newTech, setNewTech] = useState({
    role: '',
    name: '',
    version: ''
  });
  const [generatedFiles, setGeneratedFiles] = useState(null);
  const [message, setMessage] = useState('');
  const [projectInfo, setProjectInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const handleAddTechnology = () => {
    if (newTech.role && newTech.name.trim()) {
      const techToAdd = {
        ...newTech,
        id: Date.now(),
        name: newTech.name.trim(),
        version: newTech.version || ''
      };
      setTechnologies([...technologies, techToAdd]);
      setNewTech({ role: '', name: '', version: '' });
      setIsAddingTech(false);
    }
  };

  const handleUpdateTechnology = (updatedTech) => {
    setTechnologies(technologies.map(tech => 
      tech.id === updatedTech.id ? updatedTech : tech
    ));
  };

  const handleDeleteTechnology = (techId) => {
    setTechnologies(technologies.filter(tech => tech.id !== techId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setGeneratedFiles(null);
    setMessage('');
    setProjectInfo(null);

    try {
      const token = localStorage.getItem('token');
      // Remove the id property from each technology before sending to backend
      const techsForBackend = technologies.map(({ id, ...rest }) => rest);

      const response = await axios.post(
        `${BASE_URL}/api/containers/generate-application`,
        { 
          instructions,
          technologies: techsForBackend
        },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setGeneratedFiles(response.data.files);
      setMessage(response.data.message);
      if (response.data.validation_errors) {
        setError(response.data.validation_errors.join('\n'));
      } else {
        setProjectInfo(response.data.services);
      }
    } catch (error) {
      console.error('App generation failed:', error);
      setError(error.response?.data?.error || 'An error occurred during app generation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" align="center" gutterBottom>
        AI App Generation
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          label="Project Requirements and Instructions"
          multiline
          rows={4}
          fullWidth
          margin="normal"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          required
          disabled={isLoading}
          placeholder="Describe your application requirements in detail. Include functionality, features, and any specific requirements for each technology."
        />

        <Box sx={{ my: 3 }}>
          <Typography variant="h6" gutterBottom>
            Technologies
          </Typography>
          
          {technologies.map(tech => (
            <TechnologyInput
              key={tech.id}
              tech={tech}
              onUpdate={handleUpdateTechnology}
              onDelete={() => handleDeleteTechnology(tech.id)}
            />
          ))}

          <Button
            startIcon={<AddIcon />}
            onClick={() => setIsAddingTech(true)}
            variant="outlined"
            sx={{ mt: 2 }}
          >
            Add Technology
          </Button>
        </Box>

        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          fullWidth 
          disabled={isLoading || !instructions || technologies.length === 0}
          sx={{ mt: 2, mb: 4 }}
        >
          {isLoading ? 'Generating Application...' : 'Generate App'}
        </Button>
      </form>

      <Dialog 
        open={isAddingTech} 
        onClose={() => setIsAddingTech(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Technology</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={newTech.role}
              label="Role"
              onChange={(e) => setNewTech({ ...newTech, role: e.target.value })}
            >
              {ROLES.map(role => (
                <MenuItem key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Technology Name"
            fullWidth
            margin="normal"
            value={newTech.name}
            onChange={(e) => setNewTech({ ...newTech, name: e.target.value })}
            placeholder="Enter technology name (e.g., React, Python, PostgreSQL)"
          />

          <TextField
            label="Version (optional)"
            fullWidth
            margin="normal"
            value={newTech.version}
            onChange={(e) => setNewTech({ ...newTech, version: e.target.value })}
            placeholder="e.g., 18, 3.11"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddingTech(false)}>Cancel</Button>
          <Button 
            onClick={handleAddTechnology} 
            variant="contained"
            disabled={!newTech.role || !newTech.name.trim()}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {error && (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 2, 
            mb: 3, 
            backgroundColor: 'error.light',
            color: 'error.contrastText'
          }}
        >
          <Typography variant="body1">
            {error}
          </Typography>
        </Paper>
      )}

      {generatedFiles && (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Generated Files:
          </Typography>
          {Object.entries(generatedFiles).map(([filename, content]) => (
            <Paper key={filename} elevation={1} sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                {filename}
              </Typography>
              <pre style={{ 
                whiteSpace: 'pre-wrap', 
                wordBreak: 'break-all',
                backgroundColor: '#f5f5f5',
                padding: '1rem',
                borderRadius: '4px',
                maxHeight: '300px',
                overflow: 'auto'
              }}>
                {content}
              </pre>
            </Paper>
          ))}
        </Paper>
      )}

      {projectInfo && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Application Services:
          </Typography>
          {Object.entries(projectInfo).map(([service, info]) => (
            <Box key={service} sx={{ mb: 2 }}>
              <Typography variant="subtitle1" component="div">
                {service.charAt(0).toUpperCase() + service.slice(1)}:
              </Typography>
              <Typography variant="body1" component="div">
                URL: <a href={info.url} target="_blank" rel="noopener noreferrer">{info.url}</a>
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: info.status === 'running' ? 'success.main' : 'warning.main',
                  mt: 1 
                }}
              >
                Status: {info.status}
              </Typography>
            </Box>
          ))}
        </Paper>
      )}
    </Container>
  );
}

export default AppGenerationPage;