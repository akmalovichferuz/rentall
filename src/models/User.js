const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    telegramId: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String
    },
    referredBy: {
        type: String,
        default: null
    },
    referralsCount: {
        type: Number,
        default: 0
    },
    coins: {
        type: Number,
        default: 0
    },
    dailyBonus: {
        currentStreak: { type: Number, default: 0 },
        lastClaimDate: { type: Date, default: null }
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);