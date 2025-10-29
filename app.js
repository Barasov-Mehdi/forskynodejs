const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const imageRoutes = require('./routes/imageRoutes');
const path = require('path');

dotenv.config();

// Express uygulamasını oluştur
const app = express();

app.set('view engine', 'ejs');
// Dosya yollarını Vercel ortamına uygun hale getiriyoruz
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));

// Statik dosyalar (Vercel'de bu klasörün kök dizinde 'public' olarak bulunduğundan emin olun)
app.use(express.static(path.join(__dirname, 'public')));

// Rota tanımlaması
app.use('/', imageRoutes);

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('MongoDB bağlantısı başarılı'))
  .catch(err => console.log('MongoDB bağlantı hatası:', err));

// Uygulama çekirdeğini dışa aktar
module.exports = app;
