const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const imageRoutes = require('./routes/imageRoutes'); // ✅ path düzeltildi
const serverless = require('serverless-http'); // ✅ Vercel için gerekli

dotenv.config();

const app = express();

// 1. KONTROL
console.log('--- Uygulama Başlatılıyor ---');
console.log('MongoDB URL Var mı? ', !!process.env.MONGODB_URL);

// MongoDB Bağlantısı
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB bağlantısı başarılı'))
.catch(err => {
    console.error('❌ KRİTİK HATA: MongoDB bağlantısı başarısız oldu!', err.message);
    process.exit(1);
});

// EJS engine ayarları
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); 
// ✅ process.cwd yerine __dirname kullanmak vercel'de daha stabildir

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rotalar
app.use('/', imageRoutes);

console.log('--- 🚀 Rotalar Yüklendi ve Uygulama Hazır ---');

// ✅ Vercel serverless export
module.exports = app;
module.exports.handler = serverless(app);
