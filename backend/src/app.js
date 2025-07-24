import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import authRoutes from './routes/authRoutes.js';
import landlordRoutes from './routes/landlordRoutes.js';
import { globalLimiter } from './middlewares/rateLimiter.js';

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Apply global rate limiter before other middleware
app.use(globalLimiter);

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(helmet());

// No more serving local files (e.g., /uploads) – handled by Supabase

app.get('/', (req, res) => {
  res.send('Welcome to the RentEase API');
});

app.use('/api/auth', authRoutes);
app.use('/api/landlord', landlordRoutes);

// Global error handler (must come after all routes and middleware)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

export default app;
