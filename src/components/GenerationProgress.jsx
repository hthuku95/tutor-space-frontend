import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Alert
} from '@mui/material';
import PropTypes from 'prop-types';

const GENERATION_STEPS = [
  'Analyzing Requirements',
  'Generating Plan',
  'Creating Project',
  'Reviewing',
  'Final Verification',
  'Pushing to GitHub'
];

const getStepFromStatus = (status) => {
  switch (status) {
    case 'analyzing':
      return 0;
    case 'planning':
      return 1;
    case 'generating':
      return 2;
    case 'reviewing':
      return 3;
    case 'final_review':
      return 4;
    case 'completed':
      return 5;
    case 'error':
    case 'analysis_failed':
    case 'planning_failed':
    case 'implementation_failed':
      return -1; // Indicates error state
    default:
      return 0;
  }
};

export default function GenerationProgress({ id, baseUrl, onComplete, onError }) {
  const [activeStep, setActiveStep] = useState(0);
  const [message, setMessage] = useState('Starting generation process...');
  const [ws, setWs] = useState(null);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  useEffect(() => {
    setupWebSocket();

    // Cleanup on unmount or id/baseUrl change
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [id, baseUrl]);

  const setupWebSocket = () => {
    // Close existing connection if any
    if (ws) {
      ws.close();
    }

    // Construct WebSocket URL
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsBaseUrl = baseUrl.replace('https://', '').replace('http://', '');
    const wsUrl = `${wsProtocol}//${wsBaseUrl}/assignments/${id}/generation/`; // Added trailing slash

    console.log('Connecting to WebSocket:', wsUrl);
    const newWs = new WebSocket(wsUrl);

    newWs.onopen = () => {
      console.log('Generation WebSocket connected');
      setConnectionStatus('connected');
      setError(null);
    };

    newWs.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Generation status update:', data);
    
        // Validate data before using it
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid message format');
        }
    
        // Update progress based on valid status
        const status = data.status || 'unknown';
        setActiveStep(getStepFromStatus(status));
        setMessage(data.message || 'Processing...');
    
        if (status === 'completed') {
          onComplete?.(data);
          newWs.close();
        } else if (status === 'error') {
          onError?.(data.message || 'An error occurred during generation');
          newWs.close();
        }
      } catch (err) {
        console.error('Error processing WebSocket message:', err);
        onError?.('Error processing status update');
      }
    };

    newWs.onclose = (event) => {
      console.log('Generation WebSocket closed:', event);
      setConnectionStatus('disconnected');
      
      if (!event.wasClean && connectionStatus !== 'completed') {
        const errorMsg = 'Connection to generation process lost';
        setError(errorMsg);
        onError?.(errorMsg);
      }
    };

    newWs.onerror = (error) => {
      console.error('Generation WebSocket error:', error);
      setConnectionStatus('error');
      const errorMsg = 'Error connecting to generation process';
      setError(errorMsg);
      onError?.(errorMsg);
    };

    setWs(newWs);
  };

  // Show error state
  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Stepper activeStep={activeStep} alternativeLabel>
          {GENERATION_STEPS.map((label) => (
            <Step key={label}>
              <StepLabel error={activeStep === -1}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
    );
  }

  return (
    <Box>
      <Stepper activeStep={activeStep} alternativeLabel>
        {GENERATION_STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          {message}
        </Typography>
        {connectionStatus === 'connecting' && (
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Connecting to generation service...
          </Typography>
        )}
        {(connectionStatus === 'connected' && activeStep !== 5) && <CircularProgress />}
      </Box>
    </Box>
  );
}

GenerationProgress.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  baseUrl: PropTypes.string.isRequired,
  onComplete: PropTypes.func,
  onError: PropTypes.func
};