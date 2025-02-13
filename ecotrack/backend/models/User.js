const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    auth0Id: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    preferences: {
        newsCategories: [{
            type: String,
            enum: ['environment', 'climate', 'energy', 'sustainability']
        }],
        notifications: {
            email: { type: Boolean, default: false },
            push: { type: Boolean, default: true }
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    }
}, {
    timestamps: true
});

// Update last login
userSchema.methods.updateLastLogin = function() {
    this.lastLogin = new Date();
    return this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User;