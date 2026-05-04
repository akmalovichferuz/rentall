const User = require('../models/User');
const Setting = require('../models/Setting');

// Foydalanuvchining shaxsiy ma'lumotlarini va balansini olish
const getUserProfile = async (req, res) => {
    try {
        const { telegramId } = req.params;

        // Bazadan Telegram ID orqali foydalanuvchini qidiramiz
        const user = await User.findOne({ telegramId });
        
        // Agar foydalanuvchi topilmasa (ya'ni botdan ro'yxatdan o'tmagan bo'lsa)
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "Foydalanuvchi topilmadi. Iltimos, avval Telegram bot orqali ro'yxatdan o'ting." 
            });
        }

        // Karta yaratish xizmati ma'lumotini ham admin sozlamalaridan o'qib olamiz
        const cardSetting = await Setting.findOne({ key: 'card_service_info' });
        const cardServiceInfo = cardSetting ? cardSetting.value : "Karta xizmati haqida ma'lumot yo'q.";

        // Barcha kerakli ma'lumotlarni Frontend (Web App) ga yuboramiz
        res.status(200).json({ 
            success: true, 
            data: {
                telegramId: user.telegramId, // Frontend mantiqi uchun juda muhim
                firstName: user.firstName,
                phoneNumber: user.phoneNumber,
                coins: user.coins,
                referralsCount: user.referralsCount,
                cardServiceInfo: cardServiceInfo 
            } 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Serverda xatolik yuz berdi", 
            error: error.message 
        });
    }
};

module.exports = { getUserProfile };