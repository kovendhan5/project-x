const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const logger = require('../utils/logger');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('News API Endpoints', () => {
    describe('GET /api/news/search', () => {
        it('should search for news articles', async () => {
            const res = await request(app)
                .get('/api/news/search')
                .query({ q: 'climate change' });
            
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('status', 'success');
            expect(res.body.data).toHaveProperty('articles');
        });

        it('should handle invalid query parameters', async () => {
            const res = await request(app)
                .get('/api/news/search')
                .query({ pageSize: 'invalid' });
            
            expect(res.statusCode).toBe(400);
        });
    });

    describe('GET /api/news/latest', () => {
        it('should get latest news', async () => {
            const res = await request(app)
                .get('/api/news/latest')
                .query({ limit: 5 });
            
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('status', 'success');
            expect(res.body.data).toHaveProperty('articles');
        });

        it('should handle invalid limit parameter', async () => {
            const res = await request(app)
                .get('/api/news/latest')
                .query({ limit: 1000 });
            
            expect(res.statusCode).toBe(400);
        });
    });
});