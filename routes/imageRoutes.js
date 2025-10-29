const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const Image = require('../models/Image');
// const fs = require('fs'); // Yerel dosya işlemleri artık gerekli olmadığı için kaldırıldı

// Multer'ı disk yerine bellek (memory) üzerinde depolama yapacak şekilde ayarlıyoruz.
// Bu, Vercel'in Read-Only (salt okunur) dosya sistemi kısıtlamasını aşar.
const upload = multer({ storage: multer.memoryStorage() });

// --- Ana Sayfa ve Form Rotaları ---

// Ana sayfa: resimleri listele
router.get('/', async (req, res) => {
    try {
        // Mongoose ile MongoDB bağlantınızın 'app.js' içinde olduğundan emin olun.
        const images = await Image.find().sort({ createdAt: -1 });
        res.render('index', { images });
    } catch (error) {
        // MongoDB bağlantı hatası veya diğer hatalar için
        console.error("Ana sayfa yüklenirken hata:", error.message);
        res.status(500).send('Sunucu hatası: Resimler yüklenemedi. Veritabanı bağlantınızı kontrol edin.');
    }
});

// Yükleme formu
router.get('/upload', (req, res) => {
    const categories = ['WEDDINGS', 'BIRTHDAYS', 'NEW BORN', 'BOQUETS', 'GIFTS'];
    res.render('upload', { categories });
});

// --- Resim Yükleme İşlemi (Güncellenen Kısım) ---

// Resim yükleme
router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('Dosya yüklenemedi.');
        }

        // Multer dosyayı bellekte tuttuğu için req.file.buffer kullanıyoruz.
        // Cloudinary, buffer verisini Base64'e çevirip doğrudan yükleyebilir.
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

        // Cloudinary'e yükleme
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: "your_project_folder_name" // Cloudinary'de bir klasör belirleyebilirsiniz
        });

        const newImage = new Image({
            title: req.body.title,
            category: req.body.category,
            // Yüklenen resmin güvenli URL'sini kullanıyoruz
            imageUrl: result.secure_url
        });
        await newImage.save();
        
        // Yerel dosya silme satırı kaldırıldı, çünkü dosya diske yazılmadı.

        res.redirect('/');
    } catch (error) {
        console.error("Cloudinary yükleme veya kaydetme hatası:", error);
        res.status(500).send('Bir hata oluştu: ' + error.message);
    }
});

// --- Silme ve Düzenleme Rotaları (Aynı Kaldı) ---

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
    try {
        const image = await Image.findById(req.params.id);
        const categories = ['WEDDINGS', 'BIRTHDAYS', 'NEW BORN', 'BOQUETS', 'GIFTS'];
        res.render('edit', { image, categories });
    } catch (error) {
        res.status(500).send(error.message);
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
        res.status(500).send(error.message);
    }
});

module.exports = router;