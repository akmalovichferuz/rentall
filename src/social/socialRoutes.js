const express = require('express');
const router = express.Router();
const { toggleLike, addComment, getComments } = require('./socialController');

router.post('/like', toggleLike);
router.post('/comment', addComment);
router.get('/comment/:itemId', getComments);

module.exports = router;