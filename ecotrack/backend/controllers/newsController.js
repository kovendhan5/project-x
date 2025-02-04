const axios = require('axios');

exports.getNews = async (req, res) => {
  try {
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: 'environment',
        apiKey: process.env.NEWS_API_KEY,
      },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
};