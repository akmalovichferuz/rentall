const express = require('express');
const router = express.Router();
const { 
    getAllUsers, 
    getUserDetails, 
    modifyUserCoins, 
    getSettings, 
    updateSettings, 
    sendMessage 
} = require('../controllers/adminController');

// Xavfsizlik uchun bu yerga middleware (faqat admin ID tekshiruvchi) qo'shish mumkin
// Hozircha ochiq qoldiramiz, frontendda tekshiramiz.

router.get('/users', getAllUsers);
router.get('/users/:telegramId', getUserDetails);
router.post('/users/:telegramId/coins', modifyUserCoins);

router.get('/settings', getSettings);
router.post('/settings', updateSettings);

router.post('/message', sendMessage);

module.exports = router;