const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./src/config/db');

dotenv.config();
connectDB();

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Marshrutlari
const itemRoutes = require('./src/routes/itemRoutes');
app.use('/api/items', itemRoutes);

const userRoutes = require('./src/routes/userRoutes');
app.use('/api/users', userRoutes);

const socialRoutes = require('./src/social/socialRoutes');
app.use('/api/social', socialRoutes);

// ==========================================
// ENG ASOSIY QISM: ADMIN API SHU YERDA ULANDI
// ==========================================
const adminRoutes = require('./src/routes/adminRoutes');
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
    res.send('Rentall loyihasi ishlamoqda...');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server http://localhost:${PORT} portida ishga tushdi.`);
});

const bot = require('./src/bot/bot');
bot.launch().then(() => console.log('Telegram Bot ishga tushdi. 🚀'));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));