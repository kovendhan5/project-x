const logger = require('../utils/logger');

class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log error details
    logger.error('Error details:', {
        path: req.path,
        method: req.method,
        statusCode: err.statusCode,
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });

    if (process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    } else {
        // Production error response
        if (err.isOperational) {
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        } else {
            // Log unexpected errors
            logger.error('Unexpected error:', err);
            res.status(500).json({
                status: 'error',
                message: 'Something went wrong!'
            });
        }
    }
};

module.exports = {
    AppError,
    errorHandler
};