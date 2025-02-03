import axios from 'axios';
import React, { useState } from 'react';

const Calculator = () => {
  const [electricity, setElectricity] = useState(0);
  const [commute, setCommute] = useState(0);
  const [footprint, setFootprint] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/calculate', {
        electricity,
        commute,
      });
      setFootprint(response.data.footprint);
    } catch (error) {
      console.error('Error calculating footprint:', error);
    }
  };

  return (
    <div className="calculator">
      <form onSubmit={handleSubmit}>
        <div>
          <label>Monthly Electricity (kWh):</label>
          <input
            type="number"
            value={electricity}
            onChange={(e) => setElectricity(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Daily Commute (km):</label>
          <input
            type="number"
            value={commute}
            onChange={(e) => setCommute(e.target.value)}
            required
          />
        </div>
        <button type="submit">Calculate</button>
      </form>
      {footprint && (
        <div className="result">
          <h3>Your Carbon Footprint: {footprint} kg CO2/month</h3>
        </div>
      )}
    </div>
  );
};

export default Calculator;