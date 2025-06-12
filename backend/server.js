import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import bankAccountRoutes from './routes/bankAccountRoutes.js';

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());


const uploadsDir = new URL('./uploads', import.meta.url).pathname;
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}


app.use('/uploads', express.static(uploadsDir));


app.get('/', (req, res) => {
  res.send('Banko API veikia!');
});


app.use('/api/auth', authRoutes);
app.use('/api/saskaitos', bankAccountRoutes);


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Įvyko serverio klaida!', error: err.message });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`✅ Serveris veikia ant porto ${PORT} (${process.env.NODE_ENV})`));
