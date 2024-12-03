import React, { useState } from 'react';
import { TextField, Button, Alert } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthFormLayout from '../components/AuthFormLayout';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/login/`, {
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
      console.error('Login failed:', error.response?.data);
      setError(error.response?.data?.detail || 'Invalid credentials. Please try again.');
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
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Login
        </Button>
      </form>
    </AuthFormLayout>
  );
}

export default Login;