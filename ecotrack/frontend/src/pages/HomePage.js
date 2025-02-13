import { KeyboardArrowRight } from '@mui/icons-material';
import ComputerIcon from '@mui/icons-material/Computer';
import InsightsIcon from '@mui/icons-material/Insights';
import PeopleIcon from '@mui/icons-material/People';
import { Box, Button, Container, Grid, Paper, Typography, useTheme } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';

function FeatureCard({ icon, title, description }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: '100%',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        },
      }}
    >
      <Box sx={{ color: 'primary.main', mb: 2 }}>{icon}</Box>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <Typography variant="body2" color="text.secondary">{description}</Typography>
    </Paper>
  );
}

function HomePage() {
  const theme = useTheme();

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
          color: 'white',
          pt: { xs: 8, md: 12 },
          pb: { xs: 8, md: 12 },
          borderRadius: { xs: '0 0 24px 24px', md: '0 0 48px 48px' },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                }}
              >
                Track Your
                <Box component="span" sx={{ color: '#A5D6A7' }}> Environmental </Box>
                Impact
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, fontWeight: 400 }}>
                Join our community in making the world a better place. Monitor, analyze, and improve your ecological footprint.
              </Typography>
              <Button
                component={Link}
                to="/dashboard"
                variant="contained"
                size="large"
                endIcon={<KeyboardArrowRight />}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.9)',
                  },
                }}
              >
                Get Started
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="https://raw.githubusercontent.com/public-apis/public-apis/master/assets/environment.svg"
                alt="Eco Illustration"
                sx={{
                  width: '100%',
                  maxWidth: 500,
                  display: 'block',
                  margin: 'auto',
                  filter: 'brightness(1.1)',
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <FeatureCard
              icon={<ComputerIcon sx={{ fontSize: 40 }} />}
              title="Environmental Monitoring"
              description="Track real-time environmental data and get insights about your local ecosystem."
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FeatureCard
              icon={<InsightsIcon sx={{ fontSize: 40 }} />}
              title="Data Analytics"
              description="Visualize your environmental impact with interactive charts and detailed reports."
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FeatureCard
              icon={<PeopleIcon sx={{ fontSize: 40 }} />}
              title="Community Impact"
              description="Connect with eco-conscious individuals and participate in local environmental initiatives."
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default HomePage;