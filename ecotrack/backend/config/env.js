require('dotenv').config();

const config = {
    MONGODB_URI: process.env.MONGODB_URI,
    NEWS_API_KEY: process.env.NEWS_API_KEY,
    OPENAQ_API_KEY: process.env.OPENAQ_API_KEY || 'development',
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    AUTH0: {
        DOMAIN: process.env.AUTH0_DOMAIN,
        AUDIENCE: process.env.AUTH0_AUDIENCE,
        ISSUER: process.env.AUTH0_ISSUER
    },
    REDIS: {
        HOST: process.env.REDIS_HOST || 'localhost',
        PORT: parseInt(process.env.REDIS_PORT, 10) || 6379,
        PASSWORD: process.env.REDIS_PASSWORD
    },
    MONGODB: {
        OPTIONS: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10
        }
    },
    CORS: {
        ORIGIN: process.env.FRONTEND_URL || 'http://localhost:3000',
        CREDENTIALS: true
    },
    RATE_LIMIT: {
        WINDOW_MS: 15 * 60 * 1000, // 15 minutes
        MAX_REQUESTS: 100
    }
};

// Only validate critical environment variables
const requiredEnvVars = ['MONGODB_URI', 'AUTH0_DOMAIN', 'AUTH0_AUDIENCE'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

module.exports = { config };