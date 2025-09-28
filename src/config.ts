import dotenv from 'dotenv';
dotenv.config();

const config = {
    PORT: process.env.PORT || 3000,
    DATABASE_URL: process.env.DATABASE_URL as string,
    REDIS_URL: process.env.REDIS_URL as string,
    JWT_SECRET: process.env.JWT_SECRET as string,
};

export default config;