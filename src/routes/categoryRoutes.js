const express = require('express');
const router = express.Router();

const { seedCategories, getCategories } = require('../controllers/categoryController');

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Barcha kategoriyalarni olish
 *     description: Web App interfeysida ko'rsatish uchun bazadagi barcha mavjud kategoriyalarni ro'yxatini qaytaradi.
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Kategoriyalar muvaffaqiyatli qaytarildi
 *       500:
 *         description: Server xatoligi yuz berdi
 */
router.get('/', getCategories);

/**
 * @swagger
 * /api/categories/seed:
 *   post:
 *     summary: Kategoriyalarni avtomatik yaratish
 *     description: Tizim ishlashi uchun zarur bo'lgan boshlang'ich kategoriyalarni (Uy ro'zg'or buyumlari, Avtomobillar va h.k.) generatsiya qiladi.
 *     tags: [Categories]
 *     responses:
 *       201:
 *         description: Kategoriyalar muvaffaqiyatli generatsiya qilindi
 */
// Hozircha server qulamasligi uchun xavfsizlik qulfini olib tashladik
router.post('/seed', seedCategories);

module.exports = router;