const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const imageRoutes = require('./routes/imageRoutes');
const serverless = require('serverless-http');

dotenv.config();

const app = express();
app.use(express.json());
app.use('/api/images', imageRoutes);

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('MongoDB bağlantısı başarılı'))
  .catch(err => console.log('MongoDB bağlantı hatası:', err));

// Vercel için: serverless handler
module.exports = app; // APP'i export et
module.exports.handler = serverless(app); // serverless handler export
