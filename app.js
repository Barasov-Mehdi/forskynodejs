const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const serverless = require('serverless-http');

dotenv.config();
const app = express();

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('✅ MongoDB bağlantısı başarılı'))
  .catch(err => console.error('❌ MongoDB bağlantı hatası:', err.message));

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
const imageRoutes = require('./routes/imageRoutes');
app.use('/api/images', imageRoutes);

// Frontend render
const Image = require('./models/Image');
app.get('/', async (req, res) => {
  const images = await Image.find().sort({ createdAt: -1 });
  res.render('index', { images });
});

module.exports.handler = serverless(app);
