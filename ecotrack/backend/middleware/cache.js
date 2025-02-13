const Redis = require('ioredis');
const { config } = require('../config/env');

const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    }
});

redis.on('error', (err) => console.error('Redis Client Error', err));
redis.on('connect', () => console.log('Redis Client Connected'));

const cacheMiddleware = (duration) => {
    return async (req, res, next) => {
        const key = `cache:${req.originalUrl}`;
        try {
            const cachedData = await redis.get(key);
            if (cachedData) {
                return res.json(JSON.parse(cachedData));
            }
            
            res.originalJson = res.json;
            res.json = function(data) {
                redis.setex(key, duration, JSON.stringify(data));
                res.originalJson(data);
            };
            next();
        } catch (error) {
            console.error('Cache error:', error);
            next();
        }
    };
};

module.exports = { cacheMiddleware, redis };