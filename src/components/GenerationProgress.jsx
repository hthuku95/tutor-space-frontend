import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress,
  Stepper,
  Step,
  StepLabel
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
    default:
      return 0;
  }
};

export default function GenerationProgress({ id, baseUrl, onComplete, onError }) {
  const [activeStep, setActiveStep] = useState(0);
  const [message, setMessage] = useState('Starting generation process...');
  const [ws, setWs] = useState(null);

  useEffect(() => {
    setupWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [id, baseUrl]); // Reconnect if id or baseUrl changes

  const setupWebSocket = () => {
    // Close existing connection if any
    if (ws) {
      ws.close();
    }

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsBaseUrl = baseUrl.replace('https://', '').replace('http://', '');
    const wsUrl = `${wsProtocol}//${wsBaseUrl}/assignments/${id}/generation`;

    const newWs = new WebSocket(wsUrl);

    newWs.onopen = () => {
      console.log('Generation WebSocket connected');
    };

    newWs.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Generation status update:', data);

        setActiveStep(getStepFromStatus(data.status));
        setMessage(data.message || 'Processing...');

        if (data.status === 'completed') {
          onComplete?.(data);
          newWs.close();
        } else if (data.status === 'error') {
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
      if (!event.wasClean) {
        onError?.('Connection to generation process lost');
      }
    };

    newWs.onerror = (error) => {
      console.error('Generation WebSocket error:', error);
      onError?.('Error connecting to generation process');
    };

    setWs(newWs);
  };

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
        <CircularProgress />
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