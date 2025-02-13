import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import LocalDrinkIcon from '@mui/icons-material/LocalDrink';
import RecyclingIcon from '@mui/icons-material/Recycling';
import { Box, Card, CardContent, Grid, LinearProgress, Paper, Typography, Container } from '@mui/material';
import React from 'react';
import AirQualityMap from '../components/AirQualityMap';
import AirQualityDashboard from '../components/AirQualityDashboard';

const MetricCard = ({ icon, title, value, unit, progress }) => (
  <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ color: 'primary.main', mr: 2 }}>{icon}</Box>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" sx={{ mb: 1 }}>
        {value}
        <Typography variant="body2" component="span" sx={{ ml: 1 }}>
          {unit}
        </Typography>
      </Typography>
      <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const metrics = [
    {
      icon: <ElectricBoltIcon sx={{ fontSize: 32 }} />,
      title: 'Energy Usage',
      value: '245',
      unit: 'kWh',
      progress: 65,
    },
    {
      icon: <DirectionsCarIcon sx={{ fontSize: 32 }} />,
      title: 'Transport Emissions',
      value: '86',
      unit: 'kg CO₂',
      progress: 45,
    },
    {
      icon: <LocalDrinkIcon sx={{ fontSize: 32 }} />,
      title: 'Water Usage',
      value: '156',
      unit: 'L',
      progress: 78,
    },
    {
      icon: <RecyclingIcon sx={{ fontSize: 32 }} />,
      title: 'Waste Recycled',
      value: '34',
      unit: 'kg',
      progress: 89,
    },
  ];

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            mb: 4, 
            fontWeight: 600,
            background: 'linear-gradient(45deg, #2E7D32 30%, #4CAF50 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Environmental Dashboard
        </Typography>
        <Grid container spacing={3}>
          {metrics.map((metric, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <MetricCard {...metric} />
            </Grid>
          ))}

          <Grid item xs={12}>
            <Paper 
              sx={{ 
                p: 3,
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                height: '400px'
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Real-Time Air Quality Map
              </Typography>
              <AirQualityMap />
            </Paper>
          </Grid>
        </Grid>
        <AirQualityDashboard />
      </Box>
    </Container>
  );
};

export default Dashboard;