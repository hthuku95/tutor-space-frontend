import React, { useState } from 'react';
import { TextField, Button, Alert } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthFormLayout from '../components/AuthFormLayout';
import { useAuth } from '../context/AuthContext';

// Configure axios for Django REST API
const api = axios.create({
  withCredentials: true,
  timeout: 30000, // 30 seconds
  maxRedirects: 5, // Handle Django redirects
});

function Signup() {
  const [email, setEmail] = useState('');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password1 !== password2) {
      setError("Passwords don't match");
      return;
    }
    
    setIsLoading(true);
    try {
      // Always use trailing slash for Django endpoints
      const registrationUrl = `${BASE_URL}/api/auth/registration/`;
      
      console.log(`Trying registration URL: ${registrationUrl}`);
      
      // Use our pre-configured axios instance with redirect handling
      const response = await api.post(registrationUrl, {
        email,
        password1,
        password2
      });
      
      if (response.data.access) {
        login(response.data.access);
        navigate('/');
      } else {
        setError('Registration successful but no token received. Please try logging in manually.');
      }
    } catch (error) {
      console.error('Signup failed:', error);
      if (error.code === 'ECONNABORTED') {
        setError('Registration request timed out. The server might be busy, please try again later.');
      } else if (error.message.includes('Network Error')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(error.response?.data?.detail || 'Signup failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthFormLayout title="Sign Up">
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={password1}
          onChange={(e) => setPassword1(e.target.value)}
          required
        />
        <TextField
          label="Confirm Password"
          type="password"
          fullWidth
          margin="normal"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          required
        />
        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          fullWidth 
          disabled={isLoading}
          sx={{ mt: 2 }}
        >
          {isLoading ? 'Signing up...' : 'Sign Up'}
        </Button>
      </form>
    </AuthFormLayout>
  );
}

export default Signup;