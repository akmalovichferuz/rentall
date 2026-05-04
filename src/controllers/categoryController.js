const Category = require('../models/Category');

// Kategoriyalarni bazaga avtomatik generatsiya qilish (Seeding)
const seedCategories = async (req, res) => {
    try {
        const defaultCategories = [
            { name: "Uy va ro'zg'or buyumlari", icon: "🏠" },
            { name: "Avtomobillar va transport", icon: "🚗" },
            { name: "Telefon va Aksessuarlar", icon: "📱" },
            { name: "Kiyim va poyabzal", icon: "👕" },
            { name: "Sport inventarlari", icon: "⚽" },
            { name: "Qurilish anjomlari", icon: "🔨" },
            { name: "Elektronika", icon: "💻" }
        ];

        // Har bir kategoriyani aylanib chiqib, bazaga yozamiz
        for (let cat of defaultCategories) {
            await Category.findOneAndUpdate(
                { name: cat.name },
                cat,
                { upsert: true } // Bor bo'lsa yangilaydi, yo'q bo'lsa qo'shadi
            );
        }

        res.status(200).json({ success: true, message: "Kategoriyalar muvaffaqiyatli generatsiya qilindi!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server xatosi", error: error.message });
    }
};

// Barcha kategoriyalarni Web App uchun chiqarib berish
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: 1 });
        res.status(200).json({ success: true, count: categories.length, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server xatosi", error: error.message });
    }
};

module.exports = { seedCategories, getCategories };