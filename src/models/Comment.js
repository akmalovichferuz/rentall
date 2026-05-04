const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    itemId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Item', 
        required: true 
    },
    telegramId: { 
        type: String, 
        required: true 
    },
    authorName: { 
        type: String, 
        required: true 
    },
    text: { 
        type: String, 
        required: true 
    }
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);