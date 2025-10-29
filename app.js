// app.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const imageRoutes = require('./routes/imageRoutes');
// const serverless = require('serverless-http'); // <-- KALDIR

dotenv.config();
const app = express();

app.use(express.json());
app.use('/api/images', imageRoutes);

mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('MongoDB bağlantısı başarılı'))
  .catch(err => console.log('MongoDB bağlantı hatası:', err));

// Vercel için default export (DOĞRUDAN Express uygulamasını dışa aktar)
module.exports = app; // <-- SADECE `app`'i dışa aktar