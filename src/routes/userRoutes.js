const express = require('express');
const router = express.Router();
const { getUserProfile } = require('../controllers/userController');

/**
 * @swagger
 * /api/users/{telegramId}:
 *   get:
 *     summary: Foydalanuvchi profili va balansini olish
 *     description: Web App yuklanganda foydalanuvchining tangalarini va shaxsiy ma'lumotlarini olish uchun ishlatiladi.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: telegramId
 *         required: true
 *         schema:
 *           type: string
 *         description: Foydalanuvchining Telegram ID si
 *     responses:
 *       200:
 *         description: Foydalanuvchi ma'lumotlari muvaffaqiyatli qaytarildi
 *       404:
 *         description: Foydalanuvchi topilmadi
 */
router.get('/:telegramId', getUserProfile);

module.exports = router;