import React from 'react';
import { AppBar, Toolbar, Button, IconButton, Box, Badge } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import GavelIcon from '@mui/icons-material/Gavel';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../context/AuthContext';

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

        {isAuthenticated && (
          <>
            <IconButton
              color="inherit"
              component={RouterLink}
              to="/assignments"
              aria-label="assignments"
            >
              <AssignmentIcon />
            </IconButton>

            <IconButton
              color="inherit"
              component={RouterLink}
              to="/assignments/create"
              aria-label="create assignment"
            >
              <AddIcon />
            </IconButton>

            <IconButton
              color="inherit"
              component={RouterLink}
              to="/bidding"
              aria-label="bidding"
            >
              <GavelIcon />
            </IconButton>
          </>
        )}

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