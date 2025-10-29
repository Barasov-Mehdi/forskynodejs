const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
// Rota dosyası artık bir üst klasörde (..)
const imageRoutes = require('routes/imageRoutes'); 
const path = require('path');

// Ortam değişkenlerini yükle
dotenv.config();

const app = express();

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('MongoDB bağlantısı başarılı'))
  .catch(err => console.log('MongoDB bağlantı hatası: ', err.message));

// EJS View Engine ayarları
app.set('view engine', 'ejs');
// View klasörü, 'api' klasörünün bir üst seviyesinde bulunuyor
app.set('views', path.join(__dirname, '..', 'views')); 

// Express Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Statik dosyalar için middleware
app.use(express.static(path.join(__dirname, '..', 'public')));

// Ana rotalar
app.use('/', imageRoutes);

// ***************************************************************
// Vercel Serverless Function olarak Express uygulamasını dışa aktar
module.exports = app;
