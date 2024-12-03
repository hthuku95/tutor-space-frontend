import React from 'react';
import { AppBar, Toolbar, Button, IconButton, Box } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import CodeIcon from '@mui/icons-material/Code';
import { useAuth } from '../context/AuthContext';
import GavelIcon from '@mui/icons-material/Gavel';
import AppsIcon from '@mui/icons-material/Apps';
import AssignmentIcon from '@mui/icons-material/Assignment';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static" sx={{ width: '100%' }}>
      <Toolbar sx={{ justifyContent: 'space-between', width: '100%' }}>
        <IconButton
          edge="start"
          color="inherit"
          component={RouterLink}
          to="/"
          aria-label="home"
        >
          <HomeIcon />
        </IconButton>
        <IconButton
            color="inherit"
            component={RouterLink}
            to="/generate"
            aria-label="generate code"
          >
            <CodeIcon />
        </IconButton>
        <IconButton
          color="inherit"
          component={RouterLink}
          to="/generate-app"
          aria-label="generate app"
        >
          <AppsIcon />
        </IconButton>
        <IconButton
            color="inherit"
            component={RouterLink}
            to="/bidding"
            aria-label="generate code"
          >
            <GavelIcon/>
        </IconButton>
        <IconButton
          color="inherit"
          component={RouterLink}
          to="/assignments"
          aria-label="assignments"
        >
          <AssignmentIcon />
        </IconButton>
        <Box>
          {isAuthenticated ? (
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} to="/login">
                Login
              </Button>
              <Button color="inherit" component={RouterLink} to="/signup">
                Signup
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;