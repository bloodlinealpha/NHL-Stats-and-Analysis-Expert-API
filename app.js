const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const app = express();

const swaggerOptions  = {
    definition:{
        openapi: '3.0.0',
        info:{
            title: 'REST API for my App',
            version: '1.0.0',
            description: 'This is the REST API for my product',
        },
    },
    apis:['./routes/*.js'],
}

const swaggerSpec = swaggerJSDoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Import routes
const nhlWebAPIRoute = require('./routes/nhlWebAPI');

// Use routes
app.use('/api', nhlWebAPIRoute);

app.get('/', function(req, res) {
    res.status(200).send('Hello World!');
});

// Listen to the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port 3000'));
