const { AppError } = require('../middleware/errorHandler');
const User = require('../models/User');
const logger = require('../utils/logger');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { config } = require('../config/env');

const register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new AppError('User already exists with this email', 400);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create new user
        const user = await User.create({
            username,
            email,
            password: hashedPassword
        });

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, config.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({
            status: 'success',
            data: {
                user: {
                    username: user.username,
                    email: user.email
                },
                token
            }
        });
    } catch (error) {
        logger.error('Registration error:', error);
        next(error);
    }
};

const updatePreferences = async (req, res, next) => {
    try {
        const { newsCategories, notifications } = req.body;
        const userId = req.user._id;

        const user = await User.findByIdAndUpdate(
            userId,
            { 
                $set: { 
                    'preferences.newsCategories': newsCategories,
                    'preferences.notifications': notifications 
                }
            },
            { new: true }
        );

        if (!user) {
            throw new AppError('User not found', 404);
        }

        logger.info(`User preferences updated for: ${user.email}`);
        res.json({
            status: 'success',
            data: { user }
        });
    } catch (error) {
        logger.error('Preference update error:', error);
        next(error);
    }
};

const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        
        if (!user) {
            throw new AppError('User not found', 404);
        }

        res.json({
            status: 'success',
            data: { user }
        });
    } catch (error) {
        logger.error('Profile fetch error:', error);
        next(error);
    }
};

module.exports = {
    register,
    updatePreferences,
    getProfile
};