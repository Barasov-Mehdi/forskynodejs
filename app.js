const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const imageRoutes = require('../routes/imageRoutes'); 
const fs = require('fs'); // fs'yi require edin, multer temp dosya silmede kullanılıyor

dotenv.config();

const app = express();

// 1. KONTROL NOKTASI
console.log('--- Uygulama Başlatılıyor ---');
console.log('MongoDB URL Var Mı? ', !!process.env.MONGODB_URL); // URL'nin varlığını kontrol et

// MongoDB bağlantısı
// Burası çökerse, sorun %99 bağlantı dizesindedir.
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('MongoDB bağlantısı başarılı'))
  .catch(err => {
        // Bu hata Vercel loglarında görünmeli ve 500 hatasının kaynağı olmalıdır.
        console.error('KRİTİK HATA: MongoDB bağlantısı başarısız oldu!', err.message); 
        // Uygulamayı çökertmek yerine bir hata mesajı dönmek, hatayı görmemizi sağlar.
        process.exit(1); 
    });
    
// 2. KONTROL NOKTASI
console.log('--- MongoDB Bağlantısı Geçti ---');

// EJS ve Middleware ayarları... (diğer kodunuz aynı kalacak)

app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views')); 

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(process.cwd(), 'public')));

app.use('/', imageRoutes);

// 3. KONTROL NOKTASI
console.log('--- Rotalar Yüklendi ve Uygulama Hazır ---');

module.exports = app;
