const { AppError } = require('../middleware/errorHandler');
const User = require('../models/User');
const logger = require('../utils/logger');

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
    updatePreferences,
    getProfile
};