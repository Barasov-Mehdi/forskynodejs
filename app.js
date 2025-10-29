const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
// routes klasörüne ait doğru yolu hesaplamak için require('../routes/imageRoutes') yerine
// önce rota dosyasını tanımlayalım:
const imageRoutes = require('./routes/imageRoutes'); 

dotenv.config();

const app = express();

// MongoDB bağlantısı (Başarısız olsa bile, şimdilik yol hatasına odaklanıyoruz)
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('MongoDB bağlantısı başarılı'))
  .catch(err => console.log('MongoDB bağlantı hatası: ', err.message));


// YOL DÜZELTMESİ: __dirname yerine Vercel'de doğru yolu hesaplamak için 'path.resolve' kullanacağız.
// Serverless ortamda __dirname kullanımı karmaşıklığa yol açabilir.

// EJS View Engine ayarları
app.set('view engine', 'ejs');
// 'views' klasörünün projenin ana kökünde olduğunu varsayarak yolu ayarla
app.set('views', path.join(process.cwd(), 'views')); 

// Express Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Statik dosyalar için middleware (public klasörünü kök dizinden bul)
app.use(express.static(path.join(process.cwd(), 'public')));

// Ana rotalar
app.use('/', imageRoutes);

// Vercel Serverless Function olarak Express uygulamasını dışa aktar
module.exports = app;
