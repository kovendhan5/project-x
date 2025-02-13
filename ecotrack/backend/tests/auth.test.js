const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/User');
const logger = require('../utils/logger');

let mongoServer;
let testUser;
let authToken;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    await User.deleteMany({});
});

describe('Auth Endpoints', () => {
    describe('POST /api/auth/register', () => {
        const newUser = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'Password123!'
        };

        it('should register a new user', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send(newUser);
            
            expect(res.statusCode).toBe(201);
            expect(res.body.status).toBe('success');
            expect(res.body.data.user).toHaveProperty('username', newUser.username);
            expect(res.body.data).toHaveProperty('token');
            expect(res.body.data.user).not.toHaveProperty('password');
        });

        it('should not register user with existing email', async () => {
            await User.create(newUser);
            
            const res = await request(app)
                .post('/api/auth/register')
                .send(newUser);
            
            expect(res.statusCode).toBe(400);
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            testUser = await User.create({
                username: 'testuser',
                email: 'test@example.com',
                password: 'Password123!'
            });
        });

        it('should login user with valid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'Password123!'
                });
            
            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data).toHaveProperty('token');
            authToken = res.body.data.token;
        });

        it('should not login with invalid password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                });
            
            expect(res.statusCode).toBe(401);
        });
    });

    describe('Protected Routes', () => {
        beforeEach(async () => {
            testUser = await User.create({
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

        describe('GET /api/auth/profile', () => {
            it('should get user profile with valid token', async () => {
                const res = await request(app)
                    .get('/api/auth/profile')
                    .set('Authorization', `Bearer ${authToken}`);
                
                expect(res.statusCode).toBe(200);
                expect(res.body.data.user).toHaveProperty('email', testUser.email);
            });

            it('should not get profile without token', async () => {
                const res = await request(app)
                    .get('/api/auth/profile');
                
                expect(res.statusCode).toBe(401);
            });
        });

        describe('PUT /api/auth/preferences', () => {
            it('should update user preferences', async () => {
                const preferences = {
                    newsCategories: ['climate', 'energy'],
                    notifications: {
                        email: true,
                        push: false
                    }
                };

                const res = await request(app)
                    .put('/api/auth/preferences')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(preferences);
                
                expect(res.statusCode).toBe(200);
                expect(res.body.data.user.preferences.newsCategories).toEqual(preferences.newsCategories);
                expect(res.body.data.user.preferences.notifications).toEqual(preferences.notifications);
            });
        });
    });
});