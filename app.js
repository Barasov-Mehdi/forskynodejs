const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Ortam değişkenlerini (MONGODB_URL gibi) yükle
dotenv.config();

const app = express();

// --- KRİTİK ADIM: MONGOOSE VERİTABANI BAĞLANTISI ---
// Bu bağlantının Vercel'de çalışması için MONGODB_URL ortam değişkeninin doğru olması şarttır.
mongoose.connect(process.env.MONGODB_URL)
    .then(() => {
        console.log('MongoDB bağlantısı başarılı.');
        // Bağlantı başarılıysa, routes'u yükleyebiliriz
        const imageRoutes = require('./routes/imageRoutes');
        app.use('/', imageRoutes);
    })
    .catch(err => {
        // Hata durumunda loglama yap
        console.error('MongoDB Bağlantı Hatası:', err);
        // Hata durumunda kullanıcıya 500 hatası göster
        app.use((req, res) => {
            res.status(500).send("Veritabanı bağlantı hatası. Lütfen MONGODB_URL ve MongoDB Atlas ağ ayarlarınızı kontrol edin.");
        });
    });

// Routes'u tanımlamadan önce middleware'leri ayarla
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));

// Statik dosyalar için public klasörünü kullanıyorsanız ekleyin (örneğin CSS, JS)
// app.use(express.static(path.join(__dirname, 'public')));

// Not: Routes'un yüklenmesi yukarıda, mongoose.connect().then() bloğuna taşındı
// app.use('/', imageRoutes); // <-- Bu satır yukarı taşındı

// Serverless (Vercel) için Express uygulamasını dışarı aktarın
module.exports = app;
