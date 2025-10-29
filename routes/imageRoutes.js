const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const Image = require('../models/Image');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

// ✅ Vercel'de view engine kullanıyorsan bu dosya sadece route döndürür,
// render işlemleri app.js içinde yapılır.
// Bu nedenle `res.render` yerine `res.json` ya da template path döndürmek daha uygundur.

// Ana sayfa: resimleri listele
router.get('/', async (req, res) => {
  try {
    const images = await Image.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, images });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Yükleme formu için kategoriler gönder
router.get('/upload', (req, res) => {
  const categories = ['WEDDINGS', 'BIRTHDAYS', 'NEW BORN', 'BOQUETS', 'GIFTS'];
  res.status(200).json({ success: true, categories });
});

// Resim yükleme
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    const newImage = new Image({
      title: req.body.title,
      category: req.body.category,
      imageUrl: result.secure_url
    });
    await newImage.save();

    // Temporary dosyayı sil
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(201).json({ success: true, message: 'Image uploaded successfully', image: newImage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Resim silme
router.delete('/delete/:id', async (req, res) => {
  try {
    await Image.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Resim düzenleme
router.put('/edit/:id', async (req, res) => {
  try {
    await Image.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      category: req.body.category
    });
    res.status(200).json({ success: true, message: 'Image updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
