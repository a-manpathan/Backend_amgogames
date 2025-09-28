import express from 'express';
import cors from 'cors';
import config from './config';
import apiRoutes from './api/routes';
import { globalErrorHandler } from './middleware/error.middleware';
import swaggerDocs from './swagger';

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Swagger Docs
swaggerDocs(app, config.PORT as number);

// Global Error Handler
app.use(globalErrorHandler);

app.listen(config.PORT, () => {
    console.log(`Server is running on port ${config.PORT}`);
    console.log(`Docs available at http://localhost:${config.PORT}/api-docs`);
});