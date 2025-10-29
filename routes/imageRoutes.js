const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary'); // Cloudinary config burada olmalı
const Image = require('../models/Image');

// ✅ Multer disk yerine MEMORY storage kullanılır (Vercel uyumlu)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Ana sayfa: resimleri listele
router.get('/', async (req, res) => {
  try {
    const images = await Image.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, images });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ Yükleme kategorileri
router.get('/upload', (req, res) => {
  const categories = ['WEDDINGS', 'BIRTHDAYS', 'NEW BORN', 'BOQUETS', 'GIFTS'];
  res.status(200).json({ success: true, categories });
});

// ✅ Resim yükleme: Memory'den Cloudinary'ye direkt upload
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    // Buffer'ı Base64 yapıya çevir
    const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    // Cloudinary'ye yükleme
    const result = await cloudinary.uploader.upload(fileBase64, {
      folder: 'my_images' // ✅ Cloudinary'de klasör ismi (isteğe bağlı)
    });

    // Veritabanına kaydet
    const newImage = new Image({
      title: req.body.title,
      category: req.body.category,
      imageUrl: result.secure_url
    });
    await newImage.save();

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      image: newImage
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ Resim silme
router.delete('/delete/:id', async (req, res) => {
  try {
    await Image.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ Resim düzenleme
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
