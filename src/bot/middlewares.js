const User = require('../models/User');

// Foydalanuvchini bazadan qidiruvchi va ctx ga ulovchi to'liq middleware
const userMiddleware = async (ctx, next) => {
    try {
        if (ctx.from && !ctx.from.is_bot) {
            const telegramId = ctx.from.id.toString();
            // Bazadan foydalanuvchini topamiz
            const user = await User.findOne({ telegramId });
            
            // Agar foydalanuvchi bo'lsa, uni ctx.sessionUser ga biriktiramiz
            if (user) {
                ctx.sessionUser = user;
            }
        }
        return next();
    } catch (error) {
        console.error("Middleware'da xatolik yuz berdi:", error);
        return next();
    }
};

module.exports = {
    userMiddleware
};