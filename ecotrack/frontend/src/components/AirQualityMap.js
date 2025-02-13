import { Box, CircularProgress, Typography } from '@mui/material';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import './Map.css';

const getMarkerColor = (value) => {
  if (value <= 12) return '#4CAF50'; // Good
  if (value <= 35.4) return '#FFC107'; // Moderate
  if (value <= 55.4) return '#FF9800'; // Unhealthy for Sensitive Groups
  if (value <= 150.4) return '#F44336'; // Unhealthy
  if (value <= 250.4) return '#9C27B0'; // Very Unhealthy
  return '#8B0000'; // Hazardous
};

const createCustomMarker = (value) => {
  const color = getMarkerColor(value);
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      border: 2px solid white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      transform: translate(-50%, -50%);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });
};

const AirQualityMap = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/data/air-quality`, {
          timeout: 10000,
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (response.data?.status === 'success' && Array.isArray(response.data.data)) {
          // Normalize the coordinates format
          const normalizedLocations = response.data.data.map(location => ({
            ...location,
            coordinates: {
              latitude: location.coordinates.lat || location.coordinates.latitude,
              longitude: location.coordinates.lon || location.coordinates.longitude
            }
          }));
          setLocations(normalizedLocations);
        } else {
          throw new Error('Invalid data format received');
        }
      } catch (err) {
        console.error('Error fetching air quality data:', err);
        setError(
          err.response?.status === 401 ? 'Please log in to view air quality data.' :
          err.response?.status === 429 ? 'Rate limit exceeded. Please try again later.' :
          'Failed to load air quality data. Please try again.'
        );
        
        if (err.response?.status === 429 && retryCount < 3) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 2000 * Math.pow(2, retryCount)); // Exponential backoff
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [retryCount]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        height="100%"
        gap={2}
      >
        <Typography color="error" align="center">
          {error}
        </Typography>
        {retryCount < 3 && (
          <Typography variant="body2" color="text.secondary">
            Retrying... ({retryCount + 1}/3)
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', height: '500px', borderRadius: 2, overflow: 'hidden' }}>
      <MapContainer 
        center={[20, 0]} 
        zoom={2} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {locations.map((location, index) => {
          const value = location.measurements?.[0]?.value;
          if (!value || !location.coordinates?.latitude || !location.coordinates?.longitude) {
            return null;
          }
          return (
            <Marker
              key={index}
              position={[location.coordinates.latitude, location.coordinates.longitude]}
              icon={createCustomMarker(value)}
            >
              <Popup>
                <Box sx={{ p: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    {location.location}
                  </Typography>
                  <Typography variant="body2">
                    PM2.5: <strong>{value} µg/m³</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Last updated: {new Date(location.measurements[0].lastUpdated).toLocaleString()}
                  </Typography>
                </Box>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 1,
          p: 1,
          boxShadow: 1,
          zIndex: 1000,
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Air Quality Index</Typography>
        {[
          { range: '0-12', label: 'Good', color: '#4CAF50' },
          { range: '12-35.4', label: 'Moderate', color: '#FFC107' },
          { range: '35.4-55.4', label: 'Sensitive', color: '#FF9800' },
          { range: '55.4-150.4', label: 'Unhealthy', color: '#F44336' },
          { range: '150.4-250.4', label: 'Very Unhealthy', color: '#9C27B0' },
          { range: '250.4+', label: 'Hazardous', color: '#8B0000' },
        ].map((item, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                backgroundColor: item.color,
                borderRadius: '50%',
              }}
            />
            <Typography variant="caption">
              {item.range} - {item.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default AirQualityMap;