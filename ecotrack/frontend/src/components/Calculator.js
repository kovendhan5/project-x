import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Calculator = () => {
  const [inputs, setInputs] = useState({
    electricity: 0,
    commute: 0,
    water: 0,
    diet: 'omnivore',
    waste: 0
  });
  const [footprint, setFootprint] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setInputs({...inputs, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/calculate', inputs);
      setFootprint(response.data.footprint);
      navigate('/#results');
    } catch (error) {
      console.error('Calculation error:', error);
    }
  };

  return (
    <div className="calculator-grid">
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Monthly Electricity (kWh):</label>
          <input
            type="number"
            name="electricity"
            value={inputs.electricity}
            onChange={handleChange}
            min="0"
            required
          />
        </div>

        <div className="input-group">
          <label>Daily Commute (km):</label>
          <input
            type="number"
            name="commute"
            value={inputs.commute}
            onChange={handleChange}
            min="0"
            required
          />
        </div>

        <div className="input-group">
          <label>Water Usage (m3/month):</label>
          <input
            type="number"
            name="water"
            value={inputs.water}
            onChange={handleChange}
            min="0"
            required
          />
        </div>

        <div className="input-group">
          <label>Diet Type:</label>
          <select name="diet" value={inputs.diet} onChange={handleChange}>
            <option value="vegan">Vegan</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="omnivore">Omnivore</option>
            <option value="pescatarian">Pescatarian</option>
          </select>
        </div>

        <div className="input-group">
          <label>Waste Production (kg/week):</label>
          <input
            type="number"
            name="waste"
            value={inputs.waste}
            onChange={handleChange}
            min="0"
            required
          />
        </div>

        <button type="submit">Calculate Footprint</button>
      </form>

      {footprint && (
        <div className="result-card">
          <h3>Your Carbon Footprint: {footprint} kg CO2/month</h3>
          <div className="chart-container">
            {/* Chart implementation would go here */}
          </div>
          <h4>Reduction Tips:</h4>
          <ul>
            <li>Switch to renewable energy sources</li>
            <li>Use public transportation or carpool</li>
            <li>Reduce meat consumption</li>
            <li>Improve home insulation</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Calculator;