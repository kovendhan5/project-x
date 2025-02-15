const express = require('express');
const { query } = require('express-validator');
const router = express.Router();
const { checkJwt, attachUser } = require('../middleware/auth');
const validate = require('../middleware/validator');
const { cacheMiddleware } = require('../middleware/cache');
const { getAirQuality, getCityRankings } = require('../controllers/dataController');

/**
 * @swagger
 * /api/data/air-quality:
 *   get:
 *     summary: Get air quality data for a specific location
 *     tags: [Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: location
 *         required: true
 *         schema:
 *           type: string
 *         description: Location name or address to get air quality data for
 *       - in: query
 *         name: radius
 *         schema:
 *           type: integer
 *           minimum: 1000
 *           maximum: 100000
 *         description: Search radius in meters (default 10000)
 *     responses:
 *       200:
 *         description: Air quality data for the specified location
 *       400:
 *         description: Invalid parameters
 *       404:
 *         description: Location not found or no data available
 */
router.get('/air-quality',
    checkJwt,
    attachUser,
    validate([
        query('location').notEmpty().withMessage('Location is required'),
        query('radius').optional().isInt({ min: 1000, max: 100000 })
    ]),
    cacheMiddleware(300),
    getAirQuality
);

/**
 * @swagger
 * /api/data/city-rankings:
 *   get:
 *     summary: Get city rankings by air quality parameter
 *     tags: [Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: parameter
 *         schema:
 *           type: string
 *           enum: [pm25, pm10, no2, so2, o3, co]
 *         description: Air quality parameter to rank by (default pm25)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 5
 *           maximum: 100
 *         description: Number of cities to return (default 10)
 */
router.get('/city-rankings',
    checkJwt,
    attachUser,
    validate([
        query('parameter').optional().isIn(['pm25', 'pm10', 'no2', 'so2', 'o3', 'co']),
        query('limit').optional().isInt({ min: 5, max: 100 })
    ]),
    cacheMiddleware(900),
    getCityRankings
);

module.exports = router;