const Item = require('../models/Item');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Setting = require('../models/Setting');

const createItem = async (req, res) => {
    try {
        const { telegramId, title, description, price, categoryName, region, district } = req.body;

        if (!req.file) return res.status(400).json({ message: "Iltimos, rasm faylini yuklang!" });
        const imageUrl = `/uploads/${req.file.filename}`;

        const user = await User.findOne({ telegramId });
        if (!user) return res.status(404).json({ message: "Foydalanuvchi topilmadi" });

        const costSetting = await Setting.findOne({ key: 'item_create_cost' });
        const creationCost = costSetting ? Number(costSetting.value) : 5;

        if (user.coins < creationCost) {
            return res.status(400).json({ message: `Tanga yetarli emas. Narxi: ${creationCost} tanga.` });
        }

        // XATO TO'G'IRLANDI: user.save() qilinmaydi, faqat tanga ayriladi
        await User.updateOne({ telegramId }, { $inc: { coins: -creationCost } });

        const newItem = new Item({ ownerTelegramId: telegramId, title, description, price, imageUrl, categoryName, region, district });
        await newItem.save();

        res.status(201).json({ message: "Tovar yaratildi", item: newItem, remainingCoins: user.coins - creationCost });
    } catch (error) { res.status(500).json({ message: "Server xatosi", error: error.message }); }
};

const getItems = async (req, res) => {
    try {
        const { region, district, categoryName, search, favoritesOnly, myItems, telegramId } = req.query;
        let filter = { isActive: true };

        if (favoritesOnly === 'true' && telegramId) filter.likes = telegramId;
        if (myItems === 'true' && telegramId) filter.ownerTelegramId = telegramId;

        if (region) filter.region = region;
        if (district) filter.district = district;
        if (categoryName && categoryName !== 'Sevimlilar' && categoryName !== "Mening e'lonlarim") filter.categoryName = categoryName;
        if (search) filter.title = { $regex: search, $options: 'i' };

        const items = await Item.find(filter).sort({ createdAt: -1 }).lean();
        
        for (let i = 0; i < items.length; i++) {
            const owner = await User.findOne({ telegramId: items[i].ownerTelegramId });
            if (owner) {
                items[i].ownerName = owner.firstName || "Foydalanuvchi";
                items[i].ownerPhone = owner.phoneNumber;
            }
            items[i].commentsCount = await Comment.countDocuments({ itemId: items[i]._id });
        }
        res.status(200).json({ success: true, count: items.length, data: items });
    } catch (error) { res.status(500).json({ message: "Server xatosi", error: error.message }); }
};

const updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { telegramId, title, description, price, categoryName, region, district } = req.body;

        const item = await Item.findById(id);
        if (!item) return res.status(404).json({ message: "Tovar topilmadi" });
        if (item.ownerTelegramId !== telegramId) return res.status(403).json({ message: "Bunga ruxsatingiz yo'q!" });

        const user = await User.findOne({ telegramId });

        const editCostSetting = await Setting.findOne({ key: 'item_edit_cost' });
        const editCost = editCostSetting ? Number(editCostSetting.value) : 2;

        if (user.coins < editCost) {
            return res.status(400).json({ message: `Tahrirlash narxi: ${editCost} tanga. Mablag'ingiz yetarli emas.` });
        }

        // XATO TO'G'IRLANDI
        await User.updateOne({ telegramId }, { $inc: { coins: -editCost } });

        item.title = title;
        item.description = description;
        item.price = price;
        item.categoryName = categoryName;
        item.region = region;
        item.district = district;

        if (req.file) item.imageUrl = `/uploads/${req.file.filename}`;
        await item.save();

        res.status(200).json({ success: true, message: "Tovar muvaffaqiyatli tahrirlandi!", remainingCoins: user.coins - editCost });
    } catch (error) { res.status(500).json({ message: "Server xatosi", error: error.message }); }
};

const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { telegramId } = req.query;

        const item = await Item.findById(id);
        if (!item) return res.status(404).json({ message: "Tovar topilmadi" });
        if (item.ownerTelegramId !== telegramId) return res.status(403).json({ message: "Bunga ruxsatingiz yo'q!" });

        await Item.findByIdAndDelete(id);
        await Comment.deleteMany({ itemId: id }); 

        res.status(200).json({ success: true, message: "Tovar o'chirildi!" });
    } catch (error) { res.status(500).json({ message: "Server xatosi", error: error.message }); }
};

module.exports = { createItem, getItems, updateItem, deleteItem };