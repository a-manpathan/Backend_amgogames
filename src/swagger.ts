import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Backend Hiring Test API',
            version: '1.0.0',
            description: 'API documentation for the video rendering service.',
        },
        // We define the tags here now
        tags: [
            { name: 'Auth', description: 'User authentication' },
            { name: 'Projects', description: 'Project management and rendering' },
            { name: 'Jobs', description: 'Check the status of background jobs' },
            { name: 'Analytics', description: 'Analytics event logging' },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/api/routes/*.ts'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

const swaggerDocs = (app: Express, port: number) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

export default swaggerDocs;