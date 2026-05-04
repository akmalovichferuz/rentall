const Item = require('../models/Item');
const Comment = require('../models/Comment');

// 1. Like bosish yoki olib tashlash
const toggleLike = async (req, res) => {
    try {
        const { itemId, telegramId } = req.body;
        const item = await Item.findById(itemId);
        
        if (!item) return res.status(404).json({ success: false, message: "Tovar topilmadi" });

        const index = item.likes.indexOf(telegramId);
        let isLiked = false;

        if (index === -1) {
            item.likes.push(telegramId);
            isLiked = true;
        } else {
            item.likes.splice(index, 1);
            isLiked = false;
        }

        await item.save();
        res.status(200).json({ success: true, likesCount: item.likes.length, isLiked });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server xatosi", error: error.message });
    }
};

// 2. Fikr yozish
const addComment = async (req, res) => {
    try {
        const { itemId, telegramId, authorName, text } = req.body;
        const newComment = new Comment({ itemId, telegramId, authorName, text });
        await newComment.save();
        res.status(201).json({ success: true, comment: newComment });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server xatosi", error: error.message });
    }
};

// 3. Fikrlarni o'qish
const getComments = async (req, res) => {
    try {
        const { itemId } = req.params;
        const comments = await Comment.find({ itemId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, comments });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server xatosi", error: error.message });
    }
};

module.exports = { toggleLike, addComment, getComments };