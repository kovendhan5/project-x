const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/User');
const nock = require('nock');

let mongoServer;
let authToken;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Create test user and get auth token
    const testUser = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!'
    });

    const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
            email: 'test@example.com',
            password: 'Password123!'
        });

    authToken = loginRes.body.data.token;
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(() => {
    nock.cleanAll();
});

describe('Data API Endpoints', () => {
    describe('GET /api/data/air-quality', () => {
        it('should get air quality data for valid location', async () => {
            // Mock geocoding response
            nock('https://nominatim.openstreetmap.org')
                .get('/search')
                .query(true)
                .reply(200, [{
                    lat: '40.7128',
                    lon: '-74.0060',
                    display_name: 'New York, USA'
                }]);

            // Mock OpenAQ response
            nock('https://api.openaq.org/v2')
                .get('/measurements')
                .query(true)
                .reply(200, {
                    results: [{
                        parameter: 'pm25',
                        value: 10,
                        unit: 'µg/m³',
                        date: { utc: new Date().toISOString() },
                        location: 'Testing Station'
                    }]
                });

            const res = await request(app)
                .get('/api/data/air-quality')
                .query({ location: 'New York' })
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data).toHaveProperty('measurements');
            expect(res.body.data.measurements).toBeInstanceOf(Array);
        });

        it('should return 400 for missing location', async () => {
            const res = await request(app)
                .get('/api/data/air-quality')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toBe(400);
        });

        it('should return 401 without auth token', async () => {
            const res = await request(app)
                .get('/api/data/air-quality')
                .query({ location: 'New York' });

            expect(res.statusCode).toBe(401);
        });
    });

    describe('GET /api/data/city-rankings', () => {
        it('should get city rankings with default parameters', async () => {
            nock('https://api.openaq.org/v2')
                .get('/locations')
                .query(true)
                .reply(200, {
                    results: [{
                        city: 'Test City',
                        country: 'Test Country',
                        parameters: [{
                            parameter: 'pm25',
                            average: 15,
                            unit: 'µg/m³'
                        }],
                        lastUpdated: new Date().toISOString()
                    }]
                });

            const res = await request(app)
                .get('/api/data/city-rankings')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data).toHaveProperty('rankings');
            expect(res.body.data.rankings).toBeInstanceOf(Array);
        });

        it('should validate parameter input', async () => {
            const res = await request(app)
                .get('/api/data/city-rankings')
                .query({ parameter: 'invalid' })
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toBe(400);
        });
    });
});