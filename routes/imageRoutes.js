const express = require('express');
const router = express.Router();
const multer = require('multer');
// Cloudinary config ve Mongoose modeli import ediliyor
const cloudinary = require('../config/cloudinary'); 
const Image = require('../models/Image');

// KRİTİK: Vercel'in kısıtlamalarına uymak için Multer'ı disk yerine bellek kullanması için ayarla.
const upload = multer({ storage: multer.memoryStorage() });

// --- GÖRÜNTÜLEME VE LİSTELEME ---

// Ana sayfa: resimleri listele
router.get('/', async (req, res) => {
    try {
        const images = await Image.find().sort({ createdAt: -1 });
        res.render('index', { images });
    } catch (error) {
        console.error("Ana sayfa veri çekme hatası:", error.message);
        // MongoDB bağlantı hatası durumunda (MongooseServerSelectionError) kullanıcıya uyarı
        res.status(500).send('Veritabanı bağlantı hatası: Lütfen MongoDB Atlas Network Access ayarlarınızı kontrol edin (0.0.0.0/0).');
    }
});

// Yükleme formu sayfasını göster
router.get('/upload', (req, res) => {
    const categories = ['WEDDINGS', 'BIRTHDAYS', 'NEW BORN', 'BOQUETS', 'GIFTS'];
    res.render('upload', { categories });
});


// --- CLOUDINARY'E YÜKLEME ---

// Resim yükleme ve Cloudinary'ye gönderme
router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('Dosya bulunamadı.');
        }

        // 1. Bellekteki dosyayı Cloudinary'nin kabul ettiği base64 veri URI'sine dönüştür
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

        // 2. Cloudinary'ye yükle
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: "forskynodejs" // İsteğe bağlı olarak Cloudinary'de bir klasör belirle
        });

        // 3. Veritabanına kaydet
        const newImage = new Image({
            title: req.body.title,
            category: req.body.category,
            imageUrl: result.secure_url
        });
        await newImage.save(); 
        
        res.redirect('/');
    } catch (error) {
        console.error("Yükleme işlemi sırasında hata oluştu:", error.message);
        res.status(500).send('Resim yüklenirken bir hata oluştu: ' + error.message);
    }
});


// --- DÜZENLEME VE SİLME ---

// Resim silme (Veritabanından)
router.post('/delete/:id', async (req, res) => {
    try {
        await Image.findByIdAndDelete(req.params.id);
        res.redirect('/');
    } catch (error) {
        console.error("Silme işlemi sırasında hata oluştu:", error.message);
        res.status(500).send('Silme işlemi başarısız oldu: ' + error.message);
    }
});

// Resim düzenleme formu
router.get('/edit/:id', async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);
        const categories = ['WEDDINGS', 'BIRTHDAYS', 'NEW BORN', 'BOQUETS', 'GIFTS'];
        res.render('edit', { image, categories });
    } catch (error) {
         res.status(404).send('Resim bulunamadı.');
    }
});

// Resim düzenleme kaydet
router.post('/edit/:id', async (req, res) => {
    try {
        await Image.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            category: req.body.category
        });
        res.redirect('/');
    } catch (error) {
        console.error("Düzenleme işlemi sırasında hata oluştu:", error.message);
        res.status(500).send('Düzenleme işlemi başarısız oldu: ' + error.message);
    }
});

module.exports = router;
