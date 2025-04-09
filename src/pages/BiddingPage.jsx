// src/pages/BiddingPage.jsx

import React, { useState } from 'react';
import { Container, Typography, Button, Alert } from '@mui/material';
import axios from 'axios';

function BiddingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleTriggerBidding = async () => {
    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${BASE_URL}/api/assignments/trigger-bidding/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(response.data.message);
    } catch (error) {
      console.error('Bidding process failed:', error);
      setError(error.response?.data?.error || 'An error occurred during the bidding process');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" align="center" gutterBottom>
        Trigger Bidding Process
      </Typography>
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleTriggerBidding}
        disabled={isLoading}
      >
        {isLoading ? 'Processing...' : 'Start Bidding Process'}
      </Button>
      {message && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {message}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Container>
  );
}

export default BiddingPage;