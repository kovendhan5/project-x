const express = require('express');
const { body, query } = require('express-validator');
const router = express.Router();
const newsController = require('../controllers/newsController');
const validate = require('../middleware/validator');
const { cacheMiddleware } = require('../middleware/cache');
const { checkJwt, attachUser, requirePermission } = require('../middleware/auth');

/**
 * @swagger
 * /api/news/search:
 *   get:
 *     summary: Search for news articles
 *     tags: [News]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query (default "climate change")
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [environment, climate, energy, sustainability]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *     responses:
 *       200:
 *         description: List of news articles
 *       429:
 *         description: Rate limit exceeded
 *       500:
 *         description: Server error
 */
router.get('/search', 
    checkJwt,
    attachUser,
    requirePermission(['read:news']),
    validate([
        query('q').optional().trim().isString(),
        query('category').optional().isIn(['environment', 'climate', 'energy', 'sustainability']),
        query('page').optional().isInt({ min: 1 }),
        query('pageSize').optional().isInt({ min: 1, max: 100 })
    ]),
    cacheMiddleware(300),
    newsController.searchNews
);

/**
 * @swagger
 * /api/news/latest:
 *   get:
 *     summary: Get latest environmental news
 *     tags: [News]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *         description: Number of articles to return
 *     responses:
 *       200:
 *         description: Latest news articles
 *       500:
 *         description: Server error
 */
router.get('/latest',
    checkJwt,
    attachUser,
    requirePermission(['read:news']),
    validate([
        query('limit').optional().isInt({ min: 1, max: 50 })
    ]),
    cacheMiddleware(600),
    newsController.getLatestNews
);

module.exports = router;