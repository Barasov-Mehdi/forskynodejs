const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const imageRoutes = require('./routes/imageRoutes');
const path = require('path'); // Gerekli: EJS View yolunu tanımlamak için eklendi
const Image = require('./models/Image'); // Gerekli: Anasayfa için DB'den resim çekmek için eklendi

dotenv.config();
const app = express();

app.use(express.json());

// 💡 EJS VIEW MOTORU AYARI
// Express'e 'ejs' şablon motorunu kullanacağını söylüyoruz
app.set('view engine', 'ejs');
// EJS şablonlarının 'views' klasöründe olduğunu belirtiyoruz
app.set('views', path.join(__dirname, 'views'));

// 🚀 KÖK DİZİN (/) Rotası: Tarayıcının beklediği HTML sayfasını render eder
app.get('/', async (req, res) => {
    try {
        // Tüm resimleri veritabanından çek ve son eklenene göre sırala
        const images = await Image.find().sort({ createdAt: -1 });

        // 'index.ejs' şablonunu render et ve resim verilerini sayfaya gönder
        res.render('index', { images: images });
    } catch (error) {
        console.error("Anasayfa yüklenirken hata oluştu:", error);
        res.status(500).send('Anasayfa yüklenirken bir sunucu hatası oluştu: ' + error.message);
    }
});

// API Rotaları için '/api/images' prefix'ini kullanmaya devam ediyoruz
app.use('/api/images', imageRoutes);

mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log('MongoDB bağlantısı başarılı'))
    .catch(err => console.log('MongoDB bağlantı hatası:', err));

module.exports = app;
