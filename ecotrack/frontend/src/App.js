import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import HomePage from './pages/HomePage';
import News from './pages/News';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#4CAF50' }, // Green
    secondary: { main: '#FFC107' }, // Amber
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/news" element={<News />} />
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;