const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const { AppError } = require('./errorHandler');
const { config } = require('../config/env');
const logger = require('../utils/logger');
const User = require('../models/User');
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middleware/validator');

// Auth0 JWT validation middleware
const checkJwt = jwt({
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${config.AUTH0.DOMAIN}/.well-known/jwks.json`
    }),
    audience: config.AUTH0.AUDIENCE,
    issuer: `https://${config.AUTH0.DOMAIN}/`,
    algorithms: ['RS256']
});

// Extract user info and attach to request
const attachUser = async (req, res, next) => {
    try {
        if (!req.auth?.sub) {
            throw new AppError('No user identifier found', 401);
        }

        // Get or create user based on Auth0 sub
        let user = await User.findOne({ auth0Id: req.auth.sub });
        
        if (!user) {
            // Get user metadata from Auth0 token
            const auth0Roles = req.auth[`${config.AUTH0.AUDIENCE}/roles`] || [];
            const role = auth0Roles.includes('admin') ? 'admin' : 'user';
            
            user = await User.create({
                auth0Id: req.auth.sub,
                email: req.auth[`${config.AUTH0.AUDIENCE}/email`] || req.auth.email,
                username: req.auth[`${config.AUTH0.AUDIENCE}/nickname`] || req.auth.email?.split('@')[0],
                role
            });
        }

        // Update last login
        await user.updateLastLogin();

        req.user = user;
        next();
    } catch (error) {
        logger.error('User attachment error:', error);
        next(error);
    }
};

// Check if user has required role
const requireRole = (roles) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                throw new AppError('User not authenticated', 401);
            }

            const auth0Roles = req.auth[`${config.AUTH0.AUDIENCE}/roles`] || [];
            const hasRole = roles.some(role => 
                auth0Roles.includes(role) || req.user.role === role
            );

            if (!hasRole) {
                logger.warn(`User ${req.user._id} attempted to access restricted resource`);
                throw new AppError('Not authorized to access this resource', 403);
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

// Check if user has required permission
const requirePermission = (permissions) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                throw new AppError('User not authenticated', 401);
            }

            const userPermissions = req.auth[`${config.AUTH0.AUDIENCE}/permissions`] || [];
            const hasPermission = permissions.some(permission => 
                userPermissions.includes(permission)
            );

            if (!hasPermission) {
                logger.warn(`User ${req.user._id} attempted to access restricted resource`);
                throw new AppError('Not authorized to access this resource', 403);
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

// Rate limiting by user type
const userRateLimit = {
    free: { windowMs: 15 * 60 * 1000, max: 50 },    // 50 requests per 15 minutes
    premium: { windowMs: 15 * 60 * 1000, max: 500 } // 500 requests per 15 minutes
};

const checkUserRateLimit = (req, res, next) => {
    const userType = req.user?.role === 'premium' ? 'premium' : 'free';
    const limit = userRateLimit[userType];
    
    // Implementation can be extended with Redis for distributed rate limiting
    next();
};

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 */
router.post('/register',
    validate([
        body('username')
            .trim()
            .isLength({ min: 3 })
            .withMessage('Username must be at least 3 characters long'),
        body('email')
            .isEmail()
            .withMessage('Please provide a valid email'),
        body('password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long')
    ]),
    authController.register
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 */
router.post('/login',
    validate([
        body('email').isEmail().withMessage('Please provide a valid email'),
        body('password').notEmpty().withMessage('Password is required')
    ]),
    authController.login
);

/**
 * @swagger
 * /api/auth/preferences:
 *   put:
 *     summary: Update user preferences
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newsCategories:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [environment, climate, energy, sustainability]
 *               notifications:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: boolean
 *                   push:
 *                     type: boolean
 */
router.put('/preferences',
    checkJwt,
    attachUser,
    validate([
        body('newsCategories').isArray(),
        body('newsCategories.*').isIn(['environment', 'climate', 'energy', 'sustainability']),
        body('notifications').optional().isObject(),
        body('notifications.email').optional().isBoolean(),
        body('notifications.push').optional().isBoolean()
    ]),
    authController.updatePreferences
);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.get('/profile', checkJwt, attachUser, authController.getProfile);

// Export both the router and the middleware functions
module.exports = {
    router,
    checkJwt,
    attachUser,
    requireRole,
    requirePermission,
    checkUserRateLimit
};