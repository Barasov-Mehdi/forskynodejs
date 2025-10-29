// app.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const imageRoutes = require('./routes/imageRoutes');

dotenv.config();
const app = express();

app.use(express.json());

// 🚀 YENİ EKLE: Kök Dizin (/) Rotası
app.get('/', (req, res) => {
  res.json({ 
    message: "Welcome to the API! Everything is running smoothly.",
    routes: {
      getAllImages: '/api/images',
      upload: '/api/images/upload'
    }
  });
});

app.use('/api/images', imageRoutes);

mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('MongoDB bağlantısı başarılı'))
  .catch(err => console.log('MongoDB bağlantı hatası:', err));

module.exports = app;