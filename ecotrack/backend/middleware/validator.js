const { validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

const validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const messages = errors.array().map(err => `${err.path}: ${err.msg}`).join(', ');
            return next(new AppError(messages, 400));
        }
        next();
    };
};

module.exports = validate;