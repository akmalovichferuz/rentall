const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    ownerTelegramId: {
        type: String,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    // Sizning oldingi asosiy rasmingiz
    imageUrl: {
        type: String,
        required: true
    },
    // 🔥 YANGI: Bir nechta rasmlar saqlash uchun massiv
    images: {
        type: [String],
        default: []
    },
    categoryName: {
        type: String,
        required: true
    },
    region: { 
        type: String,
        required: true
    },
    district: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // 🔥 YANGI: Tizim tomonidan tanga yetmaganda bloklash uchun maxsus status
    status: {
        type: String,
        enum: ['active', 'blocked'],
        default: 'active'
    },
    // Likelar (Telegram ID lar ro'yxati)
    likes: {
        type: [String],
        default: []
    }
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);