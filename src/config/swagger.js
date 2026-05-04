const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

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
                url: 'http://localhost:3000',
                description: 'Lokal server'
            },
        ],
    },
    apis: ['./src/routes/*.js'], // Barcha route fayllarni o'qiydi
};

const swaggerSpec = swaggerJSDoc(options);

const setupSwagger = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log('Swagger hujjatlari ishga tushdi: http://localhost:3000/api-docs');
};

module.exports = setupSwagger;