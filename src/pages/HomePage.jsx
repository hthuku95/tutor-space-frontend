import React from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box,
  Grid,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Assignment,
  Chat,
  CheckCircle,
  Schedule,
  Security,
  Person,
  Dashboard,
  Update
} from '@mui/icons-material';

export default function HomePage() {
  return (
    <Box sx={{ py: 6 }}>
      {/* Hero Section */}
      <Container maxWidth="lg">
        <Paper elevation={0} sx={{ p: 4, mb: 6, bgcolor: 'primary.main', color: 'white', borderRadius: 2 }}>
          <Typography variant="h2" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
            Welcome to TutorSpace
          </Typography>
          <Typography variant="h5" align="center" sx={{ mb: 4 }}>
            Your AI-powered platform for managing freelance assignments efficiently
          </Typography>
        </Paper>

        {/* How It Works Section */}
        <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
          How It Works
        </Typography>
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                  <Assignment color="primary" sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    1. Assignment Bidding
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary">
                  Our AI system automatically finds and bids on suitable assignments from freelancing platforms, matching your expertise and preferences.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                  <Chat color="primary" sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    2. AI-Assisted Communication
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary">
                  Work with our AI assistant to craft professional responses and manage client communications effectively through our integrated chat system.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                  <CheckCircle color="primary" sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    3. Assignment Completion
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary">
                  Monitor assignment progress, review AI-generated solutions, and ensure quality delivery within the specified timeframe.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Key Features */}
        <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
          Key Features
        </Typography>
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Dashboard color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Unified Dashboard" 
                    secondary="View and manage all your assignments in one place"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Security color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Secure Communication" 
                    secondary="End-to-end encrypted chat with clients"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Schedule color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Smart Delivery Timer" 
                    secondary="60% time rule implementation for optimal delivery scheduling"
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Person color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="AI Chat Assistant" 
                    secondary="Get suggestions and improvements for client communications"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Assignment color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Automated Bidding" 
                    secondary="AI-powered bidding on suitable assignments"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Update color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Revision Management" 
                    secondary="Streamlined handling of revision requests"
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>

        {/* Important Notes */}
        <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
          Important Guidelines
        </Typography>
        <Paper sx={{ p: 4, bgcolor: 'grey.50' }}>
          <List>
            <ListItem>
              <ListItemIcon>
                <Schedule color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="60% Time Rule" 
                secondary="To maintain quality and professionalism, assignments are only delivered after 60% of the client's deadline has passed, even if completed earlier."
              />
            </ListItem>
            <Divider sx={{ my: 2 }} />
            <ListItem>
              <ListItemIcon>
                <Chat color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Communication Protocol" 
                secondary="All client communications are enhanced by our AI assistant to ensure professional and effective responses. You can review and modify suggestions before sending."
              />
            </ListItem>
            <Divider sx={{ my: 2 }} />
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Quality Assurance" 
                secondary="All assignments go through multiple AI agents for quality checks and improvements before delivery."
              />
            </ListItem>
          </List>
        </Paper>
      </Container>
    </Box>
  );
}