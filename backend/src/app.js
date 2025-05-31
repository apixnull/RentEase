// src/app.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRouter from './routes/authRouter.js';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173', // explicitly allow your Vite dev server
  credentials: true,               // allow cookies and HTTP-only tokens
}));

app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRouter);

app.get('/', (req, res) => {
  res.send('Server API is working');
});


export default app;
