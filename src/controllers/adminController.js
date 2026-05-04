const User = require('../models/User');
const Item = require('../models/Item');
const Setting = require('../models/Setting');
const bot = require('../bot/bot'); 

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getUserDetails = async (req, res) => {
    try {
        const { telegramId } = req.params;
        const user = await User.findOne({ telegramId });
        if (!user) return res.status(404).json({ success: false, message: "Foydalanuvchi topilmadi" });

        const items = await Item.find({ ownerTelegramId: telegramId });
        const referrals = await User.find({ referredBy: telegramId }).select('firstName telegramId createdAt');

        res.status(200).json({ success: true, user, items, referrals });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// XATOLIK BARTARAF ETILDI: Email/Password so'ramasligi uchun $inc dan foydalanildi
const modifyUserCoins = async (req, res) => {
    try {
        const { telegramId } = req.params;
        const { amount } = req.body; 

        // user.save() o'rniga to'g'ridan-to'g'ri faqat tangani o'zgartiramiz
        const updatedUser = await User.findOneAndUpdate(
            { telegramId },
            { $inc: { coins: Number(amount) } }, // Mavjud tangaga amount'ni qo'shadi (yoki manfiy bo'lsa ayiradi)
            { new: true, runValidators: false }  // Validatorlarni o'chirib qo'yamiz
        );

        if (!updatedUser) return res.status(404).json({ success: false, message: "Topilmadi" });

        try {
            await bot.telegram.sendMessage(telegramId, `💰 Admin tomonidan balansingizga ${amount} tanga o'tkazildi. \nHozirgi balansingiz: ${updatedUser.coins} tanga.`);
        } catch (e) {
            console.log("Xabar yuborib bo'lmadi:", e.message);
        }

        res.status(200).json({ success: true, newBalance: updatedUser.coins, message: "Tanga muvaffaqiyatli qo'shildi!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getSettings = async (req, res) => {
    try {
        const settings = await Setting.find();
        res.status(200).json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateSettings = async (req, res) => {
    try {
        const updates = req.body; 
        for (const [key, value] of Object.entries(updates)) {
            await Setting.findOneAndUpdate({ key }, { value }, { upsert: true, new: true });
        }
        res.status(200).json({ success: true, message: "Sozlamalar muvaffaqiyatli saqlandi!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const sendMessage = async (req, res) => {
    try {
        const { type, target, text } = req.body; 
        
        if (type === 'single') {
            await bot.telegram.sendMessage(target, `👨‍💻 Admin xabari:\n\n${text}`);
            return res.status(200).json({ success: true, message: "Xabar yuborildi!" });
        } 
        
        if (type === 'mass') {
            let users;
            if (target === 'all') {
                users = await User.find({}, 'telegramId');
            } else {
                users = await User.find({}, 'telegramId').sort({ createdAt: -1 }).limit(Number(target));
            }

            if (!users || users.length === 0) {
                return res.status(404).json({ success: false, message: "Bazada foydalanuvchilar topilmadi." });
            }

            let successCount = 0;

            const promises = users.map(user => 
                bot.telegram.sendMessage(user.telegramId, `📢 Ommaviy xabar:\n\n${text}`)
                    .then(() => { successCount++; })
                    .catch(err => { 
                        console.log(`User ${user.telegramId} ga xabar yetmadi.`); 
                    })
            );

            await Promise.all(promises);

            return res.status(200).json({ success: true, message: `Xabar jami ${successCount} ta foydalanuvchiga muvaffaqiyatli yetkazildi!` });
        }
    } catch (error) {
        console.error("Xabar yuborishda server xatosi:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getAllUsers, getUserDetails, modifyUserCoins, getSettings, updateSettings, sendMessage };