const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const { checkJwt, attachUser } = require('../middleware/auth');
const validate = require('../middleware/validator');

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

module.exports = router;