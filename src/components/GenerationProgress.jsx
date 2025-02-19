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
      return 0;  // Analyzing Requirements
    case 'planning':
      return 1;  // Generating Plan
    case 'implementing':
      return 2;  // Creating Project
    case 'reviewing':
      return 3;  // Reviewing
    case 'in_progress':
      return 4;  // Final Verification
    case 'completed':
      return 5;  // Pushing to GitHub
    case 'failed':
    case 'error':
    case 'analysis_failed':
    case 'planning_failed':
    case 'implementation_failed':
      return -1;  // Error state
    default:
      return 0;
  }
};

const getDetailedMessage = (detailedStatus, message) => {
  const statusMessages = {
    'initializing': 'Initializing project generation...',
    'generating_structure': 'Generating project structure...',
    'generating_code': 'Generating code implementation...',
    'writing_main_document': 'Writing main document...',
    'writing_supporting_document': 'Writing supporting documents...',
    'setting_up_repository': 'Setting up GitHub repository...',
    'processing_feedback': 'Processing review feedback...',
    'feedback_implemented': 'Implementing review changes...',
    'writing': 'Writing project content...',
    'implementation_completed': 'Implementation completed, preparing for review...',
    'writing_completed': 'Writing completed, preparing for review...',
  };

  return message || statusMessages[detailedStatus] || 'Processing...';
};

export default function GenerationProgress({ id, baseUrl, onComplete, onError }) {
  const [activeStep, setActiveStep] = useState(0);
  const [message, setMessage] = useState('Starting generation process...');
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsBaseUrl = baseUrl.replace(/^https?:\/\//, '');
    const wsUrl = `${wsProtocol}//${wsBaseUrl}/assignments/${id}/generation/`;
    
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
        
        if (data) {
          // Use DB status for step tracking 
          setActiveStep(getStepFromStatus(data.status));
          
          // Use detailed status and message for display
          const detailedMessage = getDetailedMessage(data.detailed_status, data.message);
          setMessage(detailedMessage);

          if (data.status === 'completed') {
            setConnectionStatus('completed');
            onComplete?.(data);
            newWs.close();
          } else if (data.status === 'failed' || data.status === 'error' || 
                    data.status.includes('failed')) {
            setError(data.message || 'An error occurred');
            onError?.(data.message);
            newWs.close();
          }
        }
      } catch (err) {
        console.error('Error processing WebSocket message:', err);
        setError('Error processing status update');
        onError?.('Error processing status update');
      }
    };

    newWs.onclose = (event) => {
      console.log('Generation WebSocket closed:', event);
      setConnectionStatus('disconnected');
      
      if (!event.wasClean && connectionStatus !== 'completed') {
        const errorMessage = 'Connection to generation process lost';
        setError(errorMessage);
        onError?.(errorMessage);
      }
    };

    newWs.onerror = (error) => {
      console.error('Generation WebSocket error:', error);
      const errorMessage = 'Error connecting to generation process';
      setConnectionStatus('error');
      setError(errorMessage);
      onError?.(errorMessage);
    };

    setWs(newWs);

    return () => {
      if (newWs) {
        newWs.close();
      }
    };
  }, [id, baseUrl]);

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