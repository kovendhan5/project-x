import React from 'react';
import { Box } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import News from './pages/News';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2E7D32',
      light: '#4CAF50',
      dark: '#1B5E20',
    },
    secondary: {
      main: '#FF6B6B',
      light: '#FF8E8E',
      dark: '#FF4848',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              padding: { xs: 2, sm: 4 },
              backgroundColor: 'background.default',
            }}
          >
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/news" element={
                <ProtectedRoute requiredRole="user">
                  <News />
                </ProtectedRoute>
              } />
              <Route path="/auth" element={<AuthPage />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;