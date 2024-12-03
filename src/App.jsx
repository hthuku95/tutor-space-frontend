import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import Login from './pages/Login';
import Signup from './pages/Signup';
import HomePage from './pages/HomePage';
import Navbar from './components/Navbar';
import CodeGenerationPage from './pages/CodeGenerationPage';
import AppGenerationPage from './pages/AppGenerationPage';
import { AuthProvider } from './context/AuthContext';
import BiddingPage from './pages/BiddingPage';
import AssignmentDetails from './pages/AssignmentDetailsPage';
import AssignmentListPage from './pages/AssignmentListPage';
import ChatPage from './pages/ChatPage';
const theme = createTheme({
  typography: {
    h4: {
      fontWeight: 600,
    },
  },
});

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100vw' }}>
            <Navbar />
            <Box component="main" sx={{ flexGrow: 1, width: '100%' }}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/" element={<HomePage />} />
                <Route path="/generate" element={<CodeGenerationPage />} />
                <Route path="/generate-app" element={<AppGenerationPage />} />
                <Route path="/bidding" element={<BiddingPage />} />
                <Route path="/assignments" element={<AssignmentListPage />} />
                <Route path="/assignments/:id" element={<AssignmentDetails />} />
                <Route path="/assignments/:id/chat" element={<ChatPage />} />
              </Routes>
            </Box>
          </Box>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;




