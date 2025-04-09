import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import axios from 'axios';

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.timeout = 15000; // Increased default timeout to 15 seconds
axios.defaults.timeoutErrorMessage = 'Request timed out. The server might be busy, please try again later.';

// Detect development environment
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Handle protocol mismatch and other development-specific settings
const originalCreate = axios.create;
axios.create = function(...args) {
  const instance = originalCreate.apply(this, args);
  
  // Add request interceptor for development
  instance.interceptors.request.use(config => {
    // When accessing local server, ensure we're using HTTP not HTTPS
    if (config.url?.includes('127.0.0.1:8000') || config.url?.includes('localhost:8000')) {
      config.url = config.url.replace('https://', 'http://');
    }
    
    // In development, don't follow redirects for auth endpoints
    if (isDevelopment && config.url?.includes('/api/auth/')) {
      config.maxRedirects = 0;
    }
    
    return config;
  });
  
  return instance;
};

// Create root and render app
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
