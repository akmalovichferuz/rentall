const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./src/config/db');

// ==========================================
// SWAGGER UCHUN KUTUBXONALAR
// ==========================================
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger'); // Sizning swagger faylingiz

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// API HUJJATLARI (SWAGGER) MARSHRUTI
// ==========================================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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

// Botni barqaror ishga tushirish
const bot = require('./src/bot/bot');
bot.launch({ dropPendingUpdates: true })
    .then(() => console.log('Telegram Bot ishga tushdi va eski xabarlar tozalandi. 🚀'))
    .catch((err) => console.error('Botni ishga tushirishda xatolik:', err));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));