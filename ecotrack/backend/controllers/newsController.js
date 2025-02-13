const axios = require('axios');
const { AppError } = require('../middleware/errorHandler');
const { config } = require('../config/env');
const logger = require('../utils/logger');

const axiosInstance = axios.create({
    baseURL: 'https://newsapi.org/v2',
    timeout: 10000,
    headers: {
        'Authorization': `Bearer ${config.NEWS_API_KEY}`
    }
});

const searchNews = async (req, res, next) => {
    try {
        const { q = 'climate change', category, page = 1, pageSize = 10 } = req.query;
        logger.info(`Searching news with query: ${q}, category: ${category}`);

        const response = await axiosInstance.get('/everything', {
            params: {
                q: category ? `${q} ${category}` : q,
                pageSize,
                page,
                language: 'en',
                sortBy: 'publishedAt'
            }
        });

        if (!response.data.articles) {
            throw new AppError('No articles found', 404);
        }

        logger.info(`Found ${response.data.articles.length} articles`);
        res.json({
            status: 'success',
            data: {
                articles: response.data.articles,
                total: response.data.totalResults
            }
        });
    } catch (error) {
        logger.error('News search error:', error);
        if (error.response?.status === 429) {
            return next(new AppError('Rate limit exceeded. Please try again later.', 429));
        }
        if (error.response?.status === 401) {
            return next(new AppError('Invalid API key', 401));
        }
        next(new AppError(error.message || 'Failed to fetch news', error.response?.status || 500));
    }
};

const getLatestNews = async (req, res, next) => {
    try {
        const { limit = 10 } = req.query;
        logger.info(`Fetching latest news, limit: ${limit}`);
        
        const response = await axiosInstance.get('/top-headlines', {
            params: {
                category: 'science',
                pageSize: limit,
                language: 'en',
                country: 'us'
            }
        });

        if (!response.data.articles) {
            throw new AppError('No articles found', 404);
        }

        logger.info(`Found ${response.data.articles.length} latest articles`);
        res.json({
            status: 'success',
            data: {
                articles: response.data.articles,
                total: response.data.totalResults
            }
        });
    } catch (error) {
        logger.error('Latest news fetch error:', error);
        next(new AppError(error.message || 'Failed to fetch latest news', error.response?.status || 500));
    }
};

module.exports = {
    searchNews,
    getLatestNews
};