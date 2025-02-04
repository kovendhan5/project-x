import { Box, Grid, Paper, Typography } from '@mui/material';
import React from 'react';
import AirQualityMap from '../components/AirQualityMap';

const Dashboard = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Your Carbon Footprint Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Real-Time Air Quality Map
            </Typography>
            <AirQualityMap />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;