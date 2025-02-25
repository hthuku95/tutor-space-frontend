import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Button
} from '@mui/material';
import {
  Refresh,
  ErrorOutline,
  CheckCircle
} from '@mui/icons-material';
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
    'error': 'An error occurred during generation',
    'failed': 'Generation process failed',
    'analysis_failed': 'Analysis phase failed',
    'planning_failed': 'Planning phase failed',
    'implementation_failed': 'Implementation phase failed'
  };

  return message || statusMessages[detailedStatus] || 'Processing...';
};

export default function GenerationProgress({ id, baseUrl, onComplete, onError }) {
  const [activeStep, setActiveStep] = useState(0);
  const [message, setMessage] = useState('Starting generation process...');
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [ws, setWs] = useState(null);

  const connectWebSocket = () => {
    try {
      // Close existing connection if any
      if (ws) {
        ws.close();
      }

      // Reset state for reconnection
      setError(null);
      setErrorDetails(null);
      setConnectionStatus('connecting');
      setMessage('Reconnecting to generation service...');

      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsBaseUrl = baseUrl.replace(/^https?:\/\//, '');
      const wsUrl = `${wsProtocol}//${wsBaseUrl}/assignments/${id}/generation/`;
      
      console.log('Connecting to WebSocket:', wsUrl);
      const newWs = new WebSocket(wsUrl);

      newWs.onopen = () => {
        console.log('Generation WebSocket connected');
        setConnectionStatus('connected');
        setError(null);
        setMessage('Connected to generation service...');
      };

      newWs.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          
          if (data) {
            // Use DB status for step tracking 
            setActiveStep(getStepFromStatus(data.status));
            
            // Use detailed status and message for display
            const detailedMessage = getDetailedMessage(data.detailed_status, data.message);
            setMessage(detailedMessage);

            // Check for errors
            if (data.status === 'error' || 
                data.status === 'failed' || 
                data.status.includes('failed')) {
              setError(detailedMessage || 'Generation process failed');
              setErrorDetails(data.error_details || data.detailed_status || null);
              onError?.(data.message || 'Generation process failed');
            } 
            // Check for completion
            else if (data.status === 'completed') {
              setConnectionStatus('completed');
              onComplete?.(data);
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
      return newWs;
    } catch (err) {
      console.error('Error setting up WebSocket:', err);
      setError('Failed to connect to generation service');
      setConnectionStatus('error');
      return null;
    }
  };

  // Handle retrying generation
  const handleRetry = () => {
    connectWebSocket();
  };

  // Initial connection setup
  useEffect(() => {
    const newWs = connectWebSocket();
    
    // Cleanup function
    return () => {
      if (newWs) {
        newWs.close();
      }
    };
  }, [id, baseUrl]);

  return (
    <Box>
      {/* Stepper with appropriate error indicators */}
      <Stepper activeStep={activeStep} alternativeLabel>
        {GENERATION_STEPS.map((label, index) => {
          // Determine if this step has an error
          const hasError = error && (activeStep === -1 || index === activeStep);
          
          return (
            <Step key={label}>
              <StepLabel 
                error={hasError}
                icon={
                  hasError ? (
                    <ErrorOutline color="error" />
                  ) : (
                    index < activeStep && activeStep !== -1 ? (
                      <CheckCircle color="success" />
                    ) : null
                  )
                }
              >
                {label}
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
      
      {/* Error display */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mt: 3, mb: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={handleRetry}
              startIcon={<Refresh />}
            >
              Retry
            </Button>
          }
        >
          {error}
          {errorDetails && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              {errorDetails}
            </Typography>
          )}
        </Alert>
      )}
      
      {/* Status message and loading indicator */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography 
          variant="h6" 
          gutterBottom
          color={error ? "error.main" : "text.primary"}
        >
          {message}
        </Typography>
        
        {connectionStatus === 'connecting' && (
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Connecting to generation service...
          </Typography>
        )}
        
        {connectionStatus === 'disconnected' && !error && (
          <Typography color="warning.main" sx={{ mb: 2 }}>
            Disconnected from generation service
            <Button 
              variant="outlined" 
              size="small" 
              onClick={handleRetry}
              startIcon={<Refresh />}
              sx={{ ml: 2 }}
            >
              Reconnect
            </Button>
          </Typography>
        )}
        
        {/* Show loading spinner when connected and in progress */}
        {(connectionStatus === 'connected' && activeStep !== 5 && !error) && (
          <CircularProgress />
        )}
        
        {/* Show complete message */}
        {activeStep === 5 && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Generation completed successfully!
          </Alert>
        )}
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