const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const imageRoutes = require('./routes/imageRoutes');
const serverless = require('serverless-http');

dotenv.config();

const app = express();

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB bağlantısı başarılı'))
.catch(err => {
  console.error('❌ MongoDB bağlantı hatası:', err.message);
});

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rotalar
app.use('/', imageRoutes);

// ❗ Sadece handler export edilmeli
module.exports.handler = serverless(app);
