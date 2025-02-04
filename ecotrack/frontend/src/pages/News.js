import { Box, CircularProgress, List, ListItem, ListItemText, Paper, Typography } from '@mui/material';
import axios from 'axios';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/news')
      .then(response => {
        setNews(response.data.articles);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching news:', error);
        setLoading(false);
      });
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Latest Environmental News
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <Paper sx={{ p: 2 }}>
          <List>
            {news.map((article, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ListItem divider>
                  <ListItemText
                    primary={article.title}
                    secondary={article.description}
                  />
                  <a href={article.url} target="_blank" rel="noopener noreferrer">
                    Read More
                  </a>
                </ListItem>
              </motion.div>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default News;