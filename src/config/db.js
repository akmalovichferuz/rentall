const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        // Eski versiyadagi options larni olib tashladik, endi Mongoose 9 ga mos
        const conn = await mongoose.connect(process.env.MONGODB_URI);

        console.log(`MongoDB ulanishi muvaffaqiyatli amalga oshdi: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB ulanishida xatolik: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;