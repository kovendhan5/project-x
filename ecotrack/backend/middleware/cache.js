const Redis = require('ioredis');
const { config } = require('../config/env');
const logger = require('../utils/logger');

let redis = null;

const initializeRedis = () => {
    if (redis) return redis;

    redis = new Redis({
        host: config.REDIS.HOST,
        port: config.REDIS.PORT,
        password: config.REDIS.PASSWORD,
        retryStrategy: (times) => {
            if (times > 3) {
                logger.warn('Redis connection failed after 3 retries, falling back to no-cache mode');
                return null; // Stop retrying
            }
            const delay = Math.min(times * 1000, 3000);
            return delay;
        },
        maxRetriesPerRequest: 1
    });

    redis.on('error', (err) => {
        logger.error('Redis Client Error:', err);
        redis = null; // Allow fallback to no-cache mode
    });

    redis.on('connect', () => {
        logger.info('Redis Client Connected');
    });

    return redis;
};

const cacheMiddleware = (duration) => {
    return async (req, res, next) => {
        if (!redis) {
            // Try to initialize Redis connection
            redis = initializeRedis();
            // If still no Redis, proceed without caching
            if (!redis) {
                return next();
            }
        }

        const key = `cache:${req.originalUrl}`;
        try {
            const cachedData = await redis.get(key);
            if (cachedData) {
                return res.json(JSON.parse(cachedData));
            }
            
            res.originalJson = res.json;
            res.json = function(data) {
                if (redis) {
                    redis.setex(key, duration, JSON.stringify(data))
                        .catch(err => logger.error('Redis cache set error:', err));
                }
                res.originalJson(data);
            };
            next();
        } catch (error) {
            logger.error('Cache error:', error);
            next();
        }
    };
};

// Initialize Redis on module load
initializeRedis();

module.exports = { cacheMiddleware, redis };