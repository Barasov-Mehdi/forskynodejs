// Dosyanızın başlangıcı
const express = require('express');
const mongoose = require('mongoose');
const imageRoutes = require('./routes/imageRoutes'); // Rotanız
const path = require('path');
const dotenv = require('dotenv');

// Ortam değişkenlerini (MONGODB_URL gibi) yükle
dotenv.config();

const app = express();

// --- 1. EXPRESS MIDDLEWARE'LERİ (Rota Yüklemeden Önce) ---
app.set('view engine', 'ejs');
// Lütfen 'views' klasörünün uygulamanızın kökünde olduğundan emin olun
app.set('views', path.join(__dirname, 'views')); 
app.use(express.urlencoded({ extended: true }));
// Statik dosyalar için (CSS/JS) gerekiyorsa bu satırı aktif edin:
// app.use(express.static(path.join(__dirname, 'public')));


// --- 2. MONGOOSE VERİTABANI BAĞLANTISI ---
const MONGODB_URL = process.env.MONGODB_URL; // Ortam değişkeninizin adı

mongoose.connect(MONGODB_URL)
    .then(() => console.log('MongoDB Bağlantısı Başarılı.'))
    .catch(err => {
        // Bağlantı hatasını sadece logla. Uygulamanın çalışmaya devam etmesini sağla.
        console.error('MongoDB Bağlantı Hatası:', err.message);
        // Hata notu: Kullanıcıya bu hatanın MongoDB Atlas ağ ayarlarından kaynaklandığını
        // bildirmek için router.get('/') içinde bir kontrol yapabilirsiniz.
    });


// --- 3. ROTAYI KULLAN (Hata olmasa bile rota yüklenmeli) ---
// Bağlantı başarısız olsa bile, Express'in bu rotayı bilmesi gerekir ki
// 404 yerine doğru hata mesajını (veya 500) döndürebilelim.
app.use('/', imageRoutes);

// --- 4. HATA YÖNETİMİ / 404 YAKALAYICI ---
// Yukarıdaki rotaların hiçbiri eşleşmezse bu blok çalışır ve 404 döndürülür.
app.use((req, res) => {
    // Vercel'in `Cannot GET /` hatası yerine daha bilgilendirici bir mesaj döndür.
    res.status(404).send(`404: Aradığınız sayfa (${req.originalUrl}) bulunamadı. Lütfen rota tanımlarınızı kontrol edin.`);
});

// Vercel, Express uygulaması objesinin dışa aktarılmasını gerektirir.
// Eğer dosyanızın adı 'app.js' ise:
module.exports = app; 

// EĞER SİZİN DOSYANIZDA AŞAĞIDAKİ GİBİ BİR LISTEN KOMUTU VARSA,
// VERCEL ORTAMINDA BU SATIRI YORUM SATIRI YAPIN VEYA KALDIRIN:
/* const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor.`);
}); 
*/
