const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const imageRoutes = require('./routes/imageRoutes');
const path = require('path');

// Ortam değişkenlerini yükle
dotenv.config();

const app = express();

// MongoDB bağlantısı
// Vercel ortam değişkenleri (MONGODB_URL) kullanılacaktır.
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('MongoDB bağlantısı başarılı'))
  .catch(err => console.log('MongoDB bağlantı hatası: ', err.message));

// EJS View Engine ayarları
app.set('view engine', 'ejs');
// Vercel'de doğru yolu bulmak için __dirname kullanılıyor
app.set('views', path.join(__dirname, 'views'));

// Express Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // JSON body parsing için eklenmiştir.

// Statik dosyalar için middleware (Vercel bunu doğrudan sunsa da, yerel için bırakılabilir)
// Not: Vercel, public klasöründeki dosyaları otomatik sunar, ancak bu satır yerel geliştirme için faydalıdır.
app.use(express.static(path.join(__dirname, 'public')));

// Ana rotalar
app.use('/', imageRoutes);

// ***************************************************************
// Vercel UYARISI: app.listen() KALDIRILMIŞTIR!
// Sunucusuz fonksiyon ortamında port dinleme Vercel tarafından yapılır.
// ***************************************************************

// Vercel Serverless Function olarak Express uygulamasını dışa aktar
module.exports = app;
