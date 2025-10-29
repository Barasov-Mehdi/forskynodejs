const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const Image = require('../models/Image');
// fs modülüne artık ihtiyacımız yok, çünkü diske yazmıyoruz.

// 1. MULTER AYARINI DEĞİŞTİRİN: Disk yerine Memory Storage kullanın.
const upload = multer({ storage: multer.memoryStorage() });

// Ana sayfa: resimleri listele
router.get('/', async (req, res) => {
    const images = await Image.find().sort({ createdAt: -1 });
    res.render('index', { images });
});

// Yükleme formu
router.get('/upload', (req, res) => {
    const categories = ['WEDDINGS', 'BIRTHDAYS', 'NEW BORN', 'BOQUETS', 'GIFTS'];
    res.render('upload', { categories });
});

// Resim yükleme (EN KRİTİK DEĞİŞİKLİK BURADA)
router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('Dosya bulunamadı.');
        }

        // 2. YÜKLEME YÖNTEMİNİ DEĞİŞTİRİN: req.file.path yerine req.file.buffer kullanın
        // Dosyayı base64'e dönüştürme formatı
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

        const result = await cloudinary.uploader.upload(dataURI);
        
        const newImage = new Image({
            title: req.body.title,
            category: req.body.category,
            imageUrl: result.secure_url
        });
        await newImage.save();
        
        // 3. YEREL DOSYA SİLME İŞLEMİNİ KALDIRIN (ÇÜNKÜ DOSYA YAZILMADI)
        // fs.unlinkSync(req.file.path); // <-- BU SATIR YORUMA ALINDI/KALDIRILDI

        res.redirect('/');
    } catch (error) {
        res.status(500).send('Bir hata oluştu: ' + error.message);
    }
});

// Resim silme
router.post('/delete/:id', async (req, res) => {
    try {
        await Image.findByIdAndDelete(req.params.id);
        res.redirect('/');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Resim düzenleme formu
router.get('/edit/:id', async (req, res) => {
    const image = await Image.findById(req.params.id);
    const categories = ['WEDDINGS', 'BIRTHDAYS', 'NEW BORN', 'BOQUETS', 'GIFTS'];
    res.render('edit', { image, categories });
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
        res.status(500).send(error.message);
    }
});

module.exports = router;