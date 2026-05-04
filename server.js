const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./src/config/db');

dotenv.config();
connectDB();

const app = express();

// Xavfsizlik va formatlash sozlamalari
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// STATIC FAYLLAR (admin.html, index.html) SHU YERDAN OCHILADI
// ==========================================
app.use(express.static(path.join(__dirname, 'public')));

// API Marshrutlari
const itemRoutes = require('./src/routes/itemRoutes');
app.use('/api/items', itemRoutes);

const userRoutes = require('./src/routes/userRoutes');
app.use('/api/users', userRoutes);

const socialRoutes = require('./src/social/socialRoutes');
app.use('/api/social', socialRoutes);

const adminRoutes = require('./src/routes/adminRoutes');
app.use('/api/admin', adminRoutes);

// Serverni ishga tushirish
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server http://localhost:${PORT} portida ishga tushdi.`);
});

// Telegram botni ishga tushirish (xatoliklarni ushlash bilan)
const bot = require('./src/bot/bot');
bot.launch()
    .then(() => console.log('Telegram Bot ishga tushdi. 🚀'))
    .catch((err) => console.error('Botni ishga tushirishda xatolik:', err));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));