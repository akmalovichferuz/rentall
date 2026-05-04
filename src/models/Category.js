const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    icon: {
        type: String // Frontend uchun emoji yoki rasm ssilkasi
    }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);