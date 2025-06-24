import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './routes/AuthRoutes.js';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',  // replace with your frontend URL
  credentials: true,
}));

app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Welcome to the RentEase API');
});

app.use('/api/auth', authRoutes);

export default app;
