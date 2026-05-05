const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Rentall Web App API',
            version: '1.0.0',
            description: 'Ijara platformasi uchun Web App Backend API hujjatlari. Bu yerda tovarlarni qidirish, filterlash (viloyat, tuman/shahar bo\'yicha) va yaratish mumkin.',
        },
        servers: [
            {
                // ASOSIY: Railway production manzili (API ishlashi uchun)
                url: 'https://rentall-production.up.railway.app',
                description: 'Railway Server (Production)'
            },
            {
                // QO'SHIMCHA: Lokal kompyuteringizda ishlatganingizda ham ishlashi uchun
                url: 'http://localhost:3000',
                description: 'Lokal Server (Development)'
            }
        ],
    },
    apis: ['./src/routes/*.js', './src/social/*.js'], // Barcha marshrutlarni o'qiydi (Social ni ham qo'shdim)
};

const swaggerSpec = swaggerJSDoc(options);

// To'g'ri eksport qilish: server.js buni oson qabul qiladi
module.exports = swaggerSpec;