const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const app = express();

const swaggerOptions  = {
    definition:{
        openapi: '3.0.0',
        info:{
            title: 'BloodLineAlpha NHL GPT API',
            version: '1.0.0',
        },
        servers: [
            {
                url: 'https://bloodlinealpha.com',
                description: 'GPT Action Builder API Server' 
            }
        ],
    },
    apis:['./routes/*.js'],
}

// create swagger docs
const swaggerSpec = swaggerJSDoc(swaggerOptions);
// serve interactive swagger docs 
app.use('/nhl-GPT/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// serve OpenAPI Specification docs - USED for the GPT Actiosn builder
app.get('/nhl-GPT/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// Import routes
const nhlWebAPIRoute = require('./routes/nhlWebAPI');

// Use routes
app.use('/nhl-GPT/api', nhlWebAPIRoute);

app.get('/nhl-GPT/', function(req, res) {
    res.status(200).send('Hello World!');
});

// Listen to the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port 3000'));
