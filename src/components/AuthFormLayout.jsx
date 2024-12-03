import React from 'react';
import { Paper, Box, Typography, Container } from '@mui/material';

const AuthFormLayout = ({ title, children }) => {
  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          {title}
        </Typography>
        {children}
      </Paper>
    </Container>
  );
};

export default AuthFormLayout;