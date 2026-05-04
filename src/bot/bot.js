const { Telegraf, Markup, session } = require('telegraf');
const User = require('../models/User');
const Setting = require('../models/Setting');
const { userMiddleware } = require('./middlewares');
const moment = require('moment');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);

// ====================================================
// GLOBAL XATO USHLAGICH (Bot qulab tushishidan asraydi)
// ====================================================
bot.catch((err, ctx) => {
    console.error(`Botda xatolik yuz berdi (${ctx.updateType}):`, err);
});

bot.use(session());
bot.use(userMiddleware);

const adminId = process.env.ADMIN_TELEGRAM_ID;

const getDynamicSetting = async (key, defaultValue) => {
    try {
        const setting = await Setting.findOne({ key });
        return setting ? Number(setting.value) : defaultValue;
    } catch (e) {
        return defaultValue;
    }
};

const getMainMenu = (telegramId) => {
    const isAdmin = telegramId === adminId;
    
    const buttons = [
        ['👤 Mening hisobim', '🎁 Kunlik bonus'],
        ['👥 Do\'st taklif qilish (Referal)']
    ];
    
    if (isAdmin) {
        buttons.push(['⚙️ Admin Panel']);
    }
    
    return Markup.keyboard(buttons).resize();
};

const getContactMenu = () => {
    return Markup.keyboard([
        [Markup.button.contactRequest('📱 Telefon raqamni yuborish')]
    ]).resize().oneTime();
};

bot.start(async (ctx) => {
    const telegramId = ctx.from.id.toString();
    const text = ctx.message.text;
    const payload = text.split(' ')[1]; 

    if (ctx.sessionUser) {
        return ctx.reply(`Assalomu alaykum yana bir bor, ${ctx.from.first_name}! Rentall platformasiga xush kelibsiz.`, getMainMenu(telegramId));
    }

    if (payload && payload !== telegramId) {
        ctx.session = ctx.session || {};
        ctx.session.referredBy = payload;
    }

    await ctx.reply(
        `Assalomu alaykum, ${ctx.from.first_name}! ✋\n\n"Rentall" — ijaraga olish va berish platformasiga xush kelibsiz.\nTo'liq foydalanish va referal orqali tanga ishlash uchun telefon raqamingizni tasdiqlashingiz kerak. Iltimos, pastdagi tugmani bosing:`,
        getContactMenu()
    );
});

bot.on('contact', async (ctx) => {
    const telegramId = ctx.from.id.toString();
    const contact = ctx.message.contact;

    if (contact.user_id !== ctx.from.id) {
        return ctx.reply("Iltimos, faqat o'zingizning telefon raqamingizni yuboring!", getContactMenu());
    }

    if (ctx.sessionUser) {
        return ctx.reply("Siz allaqachon ro'yxatdan o'tgansiz!", getMainMenu(telegramId));
    }

    const referredBy = (ctx.session && ctx.session.referredBy) ? ctx.session.referredBy : null;

    try {
        const newUser = new User({
            telegramId: telegramId,
            firstName: ctx.from.first_name,
            phoneNumber: contact.phone_number,
            referredBy: referredBy,
            coins: 0
        });

        await newUser.save();
        ctx.sessionUser = newUser; 

        if (referredBy) {
            const bonusAmount = await getDynamicSetting('referral_bonus', 10);
            
            await User.updateOne(
                { telegramId: referredBy }, 
                { $inc: { referralsCount: 1, coins: bonusAmount } }
            );

            try {
                await ctx.telegram.sendMessage(referredBy, `🎉 Tabriklaymiz! Sizning taklifingiz orqali do'stingiz ro'yxatdan o'tdi va sizga ${bonusAmount} tanga berildi!`);
            } catch (e) {}
        }

        await ctx.reply(`Tabriklaymiz! Siz muvaffaqiyatli ro'yxatdan o'tdingiz. ✅\nEndi Web App orqali barcha buyumlarni ijaraga olishingiz yoki o'z buyumingizni ijaraga berishingiz mumkin!`, getMainMenu(telegramId));
    } catch (error) {
        ctx.reply("Kechirasiz, ro'yxatdan o'tishda xatolik yuz berdi. Iltimos, keyinroq urinib ko'ring.");
    }
});

bot.hears('👤 Mening hisobim', async (ctx) => {
    if (!ctx.sessionUser) return ctx.reply("Iltimos, oldin /start orqali ro'yxatdan o'ting.");
    
    const user = ctx.sessionUser;
    const text = `👤 Foydalanuvchi: ${user.firstName}\n📱 Telefon: ${user.phoneNumber}\n💰 Balansingiz: ${user.coins} tanga\n👥 Taklif qilingan do'stlar: ${user.referralsCount || 0} ta`;
    
    ctx.reply(text, getMainMenu(ctx.from.id.toString()));
});

bot.hears('👥 Do\'st taklif qilish (Referal)', async (ctx) => {
    if (!ctx.sessionUser) return ctx.reply("Iltimos, oldin /start orqali ro'yxatdan o'ting.");
    
    const botInfo = await ctx.telegram.getMe();
    const refLink = `https://t.me/${botInfo.username}?start=${ctx.from.id}`;
    
    const text = `👥 Do'stlarni taklif qiling va bepul tangalar ishlang!\n\nSizning maxsus taklif havolangiz:\n${refLink}\n\nUshbu ssilkani do'stlaringizga yuboring. Ular botga kirib ro'yxatdan o'tishi bilan sizga tanga taqdim etiladi.`;
    
    ctx.reply(text, getMainMenu(ctx.from.id.toString()));
});

bot.hears('🎁 Kunlik bonus', async (ctx) => {
    if (!ctx.sessionUser) return ctx.reply("Iltimos, oldin /start orqali ro'yxatdan o'ting.");
    
    const user = ctx.sessionUser;
    const today = moment().startOf('day');
    
    if (!user.dailyBonus) user.dailyBonus = {};
    
    let lastClaim = user.dailyBonus.lastClaimDate ? moment(user.dailyBonus.lastClaimDate).startOf('day') : null;
    
    if (lastClaim && lastClaim.isSame(today)) {
        return ctx.reply("Siz bugungi bonusni allaqachon olgansiz! Ertaga yana keling. ⏱", getMainMenu(ctx.from.id.toString()));
    }

    let newStreak = 1;
    if (lastClaim && lastClaim.isSame(moment().subtract(1, 'days').startOf('day'))) {
        newStreak = (user.dailyBonus.currentStreak || 0) + 1;
    }

    let bonusAmount = 0;
    if (newStreak === 1) bonusAmount = await getDynamicSetting('daily_bonus_1', 5);
    else if (newStreak === 2) bonusAmount = await getDynamicSetting('daily_bonus_2', 15);
    else bonusAmount = await getDynamicSetting('daily_bonus_3', 18);

    const now = new Date();

    await User.updateOne(
        { telegramId: user.telegramId },
        {
            $inc: { coins: bonusAmount },
            $set: {
                'dailyBonus.currentStreak': newStreak,
                'dailyBonus.lastClaimDate': now
            }
        }
    );

    user.coins += bonusAmount;
    user.dailyBonus.currentStreak = newStreak;
    user.dailyBonus.lastClaimDate = now;

    const text = `🎉 Tabriklaymiz! Siz ${newStreak}-kunlik bonusingizni oldingiz: +${bonusAmount} tanga.\n💰 Hozirgi balansingiz: ${user.coins} tanga.`;
    ctx.reply(text, getMainMenu(ctx.from.id.toString()));
});

bot.hears('⚙️ Admin Panel', async (ctx) => {
    const telegramId = ctx.from.id.toString();
    if (telegramId !== adminId) return; 

    const adminKeyboard = Markup.inlineKeyboard([
        [Markup.button.callback('🎁 Referal bonusni sozlash', 'admin_ref_bonus')]
    ]);

    ctx.reply("👨‍💻 Admin panelga xush kelibsiz.\n\n💡 To'liq boshqaruv Web App admin panelida joylashgan!\nLekin siz quyidagilarni shu yerdan ham tezkor o'zgartirishingiz mumkin:", adminKeyboard);
});

bot.action('admin_ref_bonus', async (ctx) => {
    ctx.session = ctx.session || {};
    ctx.session.adminState = 'waiting_ref_bonus';
    await ctx.reply("✏️ Iltimos, har bir taklif qilingan do'st uchun beriladigan yangi tanga miqdorini raqamda kiriting (masalan: 15):");
    await ctx.answerCbQuery();
});

bot.on('text', async (ctx, next) => {
    const telegramId = ctx.from.id.toString();
    
    if (telegramId !== adminId || !ctx.session || !ctx.session.adminState) {
        return next(); 
    }

    const state = ctx.session.adminState;
    const text = ctx.message.text;

    if (state === 'waiting_ref_bonus') {
        const amount = parseInt(text);
        if (isNaN(amount)) return ctx.reply("❌ Iltimos, faqat raqam kiriting!");
        
        await Setting.findOneAndUpdate({ key: 'referral_bonus' }, { value: amount }, { upsert: true, new: true });
        ctx.session.adminState = null;
        return ctx.reply(`✅ Muvaffaqiyatli! Referal bonus endi ${amount} tanga qilib belgilandi.`);
    }

    return next();
});

module.exports = bot;