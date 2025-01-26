const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

// Enable CORS (for frontend-backend communication)
app.use(cors());
app.use(express.json());

// Carbon footprint calculation API
app.post('/api/calculate', (req, res) => {
  const { electricity, commute } = req.body;
  
  // Example formula (replace with real calculations)
  const footprint = (electricity * 0.85) + (commute * 0.2);
  
  res.json({ footprint: footprint.toFixed(2) });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});