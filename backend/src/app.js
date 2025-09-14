import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

const app = express(); 

// ---------- Middlewares ----------
app.use(cors()); 
app.use(express.json());
app.use(morgan("dev"))


// ---------- Routes ----------
app.get("/", (req, res) => {
    res.status(200).json({message: "Welcome to index route"});
})


export default app;