const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    telegramChatId: {
        type: String,
        sparse: true,
        unique: true
    },
    telegramUsername: {
        type: String
    },
    telegramNotifications: {
        enabled: {
            type: Boolean,
            default: false
        },
        dailyReminder: {
            type: Boolean,
            default: true
        },
        timePreference: {
            type: String,
            default: '08:30' // 8:30 AM
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User; 