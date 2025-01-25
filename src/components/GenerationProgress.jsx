import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert
} from '@mui/material';
import { useWebSocket } from '../hooks/useWebSocket';

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

export default function GenerationProgress({ 
  type, 
  id,
  baseUrl,
  onComplete 
}) {
  const { data, error, status } = useWebSocket(type, id, baseUrl);

  React.useEffect(() => {
    if (data?.status === 'completed' && onComplete) {
      onComplete(data);
    }
  }, [data?.status, onComplete]);

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error tracking progress: {error.message}
      </Alert>
    );
  }

  if (!data) {
    return (
      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 1 }}>
          Connecting to progress tracker...
        </Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3, mt: 2 }}>
      <Stepper activeStep={getStepFromStatus(data.status)} alternativeLabel>
        {GENERATION_STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          {data.message || 'Processing...'}
        </Typography>
        
        {data.status !== 'completed' && <CircularProgress />}
        
        {data.details && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            {typeof data.details === 'string' 
              ? data.details 
              : JSON.stringify(data.details, null, 2)
            }
          </Typography>
        )}
      </Box>
    </Paper>
  );
}