import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const AirQualityMap = () => {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    // Fetch air quality data from OpenAQ API
    axios.get('https://api.openaq.org/v1/latest', {
      params: {
        limit: 100,
        parameter: 'pm25',
      },
    })
      .then(response => setLocations(response.data.results))
      .catch(error => console.error('Error fetching air quality data:', error));
  }, []);

  return (
    <MapContainer center={[20, 0]} zoom={2} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {locations.map((location, index) => (
        <Marker
          key={index}
          position={[location.coordinates.latitude, location.coordinates.longitude]}
        >
          <Popup>
            <strong>{location.location}</strong>
            <br />
            PM2.5: {location.measurements[0].value} µg/m³
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default AirQualityMap;