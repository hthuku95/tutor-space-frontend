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

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Use the trailing slash version (Django prefers this) with our pre-configured axios instance
      const loginUrl = `${BASE_URL}/api/auth/login/`;
      
      console.log(`Trying login URL: ${loginUrl}`);
      
      // Use our pre-configured axios instance with proper settings
      const response = await api.post(loginUrl, {
        email,
        password
      });
      
      if (response.data.access) {
        login(response.data.access);
        navigate('/');
      } else {
        setError('Login successful but no token received. Please try again.');
      }
    } catch (error) {
      console.error('Login failed:', error);
      if (error.code === 'ECONNABORTED') {
        setError('Login request timed out. The server might be busy, please try again later.');
      } else if (error.message.includes('Network Error')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(error.response?.data?.detail || 'Invalid credentials. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthFormLayout title="Login">
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
    </AuthFormLayout>
  );
}

export default Login;