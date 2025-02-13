import { Box, Button, Container, Fade, Paper, Typography } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <Container component="main" maxWidth="xs">
        <Box sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="xs">
      <Fade in={true}>
        <Box
          sx={{
            mt: 8,
            mb: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
            Welcome to EcoTrack
          </Typography>

          <Paper 
            elevation={3}
            sx={{ 
              width: '100%',
              p: 4,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <Typography variant="h6" sx={{ mb: 3 }}>
              Join our eco-conscious community
            </Typography>
            
            <Button
              onClick={() => loginWithRedirect()}
              variant="contained"
              fullWidth
              size="large"
              sx={{ 
                py: 1.5,
                textTransform: 'none',
                fontSize: '1.1rem',
              }}
            >
              Sign In / Sign Up
            </Button>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Typography>
          </Paper>
        </Box>
      </Fade>
    </Container>
  );
};

export default AuthPage;