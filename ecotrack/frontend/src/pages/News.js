import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ShareIcon from '@mui/icons-material/Share';
import { Box, Card, CardActions, CardContent, CardMedia, Chip, Container, Grid, IconButton, Skeleton, Typography, Zoom } from '@mui/material';
import React, { useEffect, useState } from 'react';

const NewsCard = ({ article, index }) => {
  return (
    <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
      <Card 
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          }
        }}
      >
        <CardMedia
          component="img"
          height="200"
          image={article.urlToImage || 'https://via.placeholder.com/400x200?text=Environmental+News'}
          alt={article.title}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ mb: 2 }}>
            <Chip 
              label={article.category || 'Environment'}
              size="small"
              sx={{ 
                backgroundColor: 'primary.light',
                color: 'white',
                fontWeight: 500
              }}
            />
          </Box>
          <Typography 
            variant="h6" 
            component="h2"
            sx={{ 
              mb: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {article.title}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {article.description}
          </Typography>
        </CardContent>
        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
          <Box>
            <IconButton size="small" aria-label="bookmark">
              <BookmarkBorderIcon />
            </IconButton>
            <IconButton size="small" aria-label="share">
              <ShareIcon />
            </IconButton>
          </Box>
          <Typography 
            component="a" 
            href={article.url} 
            target="_blank" 
            rel="noopener noreferrer"
            sx={{
              color: 'primary.main',
              textDecoration: 'none',
              fontWeight: 500,
              '&:hover': {
                textDecoration: 'underline',
              }
            }}
          >
            Read More →
          </Typography>
        </CardActions>
      </Card>
    </Zoom>
  );
};

const LoadingSkeleton = () => (
  <Card sx={{ height: '100%' }}>
    <Skeleton variant="rectangular" height={200} />
    <CardContent>
      <Skeleton variant="text" width={100} height={32} sx={{ mb: 2 }} />
      <Skeleton variant="text" height={32} sx={{ mb: 1 }} />
      <Skeleton variant="text" height={32} sx={{ mb: 2 }} />
      <Skeleton variant="text" height={20} />
      <Skeleton variant="text" height={20} />
      <Skeleton variant="text" height={20} width="80%" />
    </CardContent>
  </Card>
);

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('https://newsapi.org/v2/everything', {
          headers: {
            'X-API-KEY': process.env.REACT_APP_NEWS_API_KEY,
            'Content-Type': 'application/json',
          },
          params: {
            q: 'environment',
            category: 'environment',
            pageSize: 10,
          }
        });
        const data = await response.json();
        if (data.articles) {
          setNews(data.articles);
        } else {
          setError('No news articles found');
        }
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch news. Please try again later.');
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography 
        variant="h4" 
        sx={{ 
          mb: 4,
          fontWeight: 600,
          textAlign: 'center',
          background: 'linear-gradient(45deg, #2E7D32 30%, #4CAF50 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        Environmental News & Updates
      </Typography>
      {error && (
        <Typography variant="h6" color="error.main" sx={{ mb: 4, textAlign: 'center' }}>
          {error}
        </Typography>
      )}
      <Grid container spacing={3}>
        {loading
          ? Array.from(new Array(6)).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <LoadingSkeleton />
              </Grid>
            ))
          : news.map((article, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <NewsCard article={article} index={index} />
              </Grid>
            ))}
      </Grid>
    </Container>
  );
};

export default News;