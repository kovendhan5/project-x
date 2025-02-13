import React, { useState, useEffect } from 'react';
import { Box, TextField, CircularProgress, Alert, Paper, Typography, Grid } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import './Map.css';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const AirQualityDashboard = () => {
  const [location, setLocation] = useState('');
  const [airQualityData, setAirQualityData] = useState(null);
  const [cityRankings, setCityRankings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAirQuality = async (searchLocation) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/data/air-quality`, {
        params: { location: searchLocation },
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.status === 'success' && response.data.data) {
        // Normalize coordinate format
        const normalizedData = {
          ...response.data.data,
          coordinates: {
            lat: response.data.data.coordinates.lat || response.data.data.coordinates.latitude,
            lon: response.data.data.coordinates.lon || response.data.data.coordinates.longitude
          }
        };
        setAirQualityData(normalizedData);
      } else {
        throw new Error('Invalid data format received');
      }
    } catch (err) {
      console.error('Error fetching air quality data:', err);
      setError(
        err.response?.status === 401 ? 'Please log in to view air quality data.' :
        err.response?.status === 429 ? 'Rate limit exceeded. Please try again later.' :
        err.response?.data?.message || 'Failed to fetch air quality data'
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCityRankings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/data/city-rankings`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.status === 'success' && Array.isArray(response.data.data?.rankings)) {
        setCityRankings(response.data.data.rankings);
      } else {
        console.error('Invalid rankings data format');
      }
    } catch (err) {
      console.error('Failed to fetch city rankings:', err);
      // Don't show error alert for rankings - non-critical feature
    }
  };

  useEffect(() => {
    fetchCityRankings();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (location) {
      fetchAirQuality(location);
    }
  };

  const getAQIColor = (value, parameter) => {
    // Simple AQI color scheme based on PM2.5 values
    if (parameter === 'pm25') {
      if (value <= 12) return '#00e400';
      if (value <= 35.4) return '#ffff00';
      if (value <= 55.4) return '#ff7e00';
      if (value <= 150.4) return '#ff0000';
      return '#7f0023';
    }
    return '#666666';
  };

  return (
    <Box sx={{ p: 3 }}>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Enter location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter city name, address, or coordinates"
          sx={{ mb: 2 }}
          disabled={loading}
        />
      </form>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : airQualityData && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6">Air Quality Map</Typography>
              {airQualityData.coordinates?.lat && airQualityData.coordinates?.lon ? (
                <MapContainer
                  center={[airQualityData.coordinates.lat, airQualityData.coordinates.lon]}
                  zoom={13}
                  style={{ height: '400px', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={[airQualityData.coordinates.lat, airQualityData.coordinates.lon]}>
                    <Popup>
                      <Typography variant="body2">{airQualityData.location}</Typography>
                    </Popup>
                  </Marker>
                </MapContainer>
              ) : (
                <Alert severity="warning">Map coordinates not available</Alert>
              )}
            </Paper>

            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Measurements</Typography>
              <Grid container spacing={2}>
                {airQualityData.measurements.map((measurement, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: getAQIColor(measurement.value, measurement.parameter),
                        color: 'white'
                      }}
                    >
                      <Typography variant="h6">{measurement.parameter.toUpperCase()}</Typography>
                      <Typography>{measurement.value} {measurement.unit}</Typography>
                      <Typography variant="caption">
                        Station: {measurement.station}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>City Rankings (PM2.5)</Typography>
              {cityRankings.map((city, index) => (
                <Paper
                  key={index}
                  sx={{
                    p: 1,
                    mb: 1,
                    bgcolor: getAQIColor(city.value, 'pm25'),
                    color: 'white'
                  }}
                >
                  <Typography variant="subtitle1">
                    {index + 1}. {city.city}, {city.country}
                  </Typography>
                  <Typography variant="body2">
                    {city.value} {city.unit}
                  </Typography>
                </Paper>
              ))}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default AirQualityDashboard;