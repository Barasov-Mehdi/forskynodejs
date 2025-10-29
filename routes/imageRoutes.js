const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const Image = require('../models/Image');
const fs = require('fs');

// Buradaki dest: '/tmp/' KRİTİK öneme sahiptir.
const upload = multer({ dest: '/tmp/' }); 

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

// Resim yükleme
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    // Multer dosyayı /tmp/ dizinine kaydetti.
    const result = await cloudinary.uploader.upload(req.file.path);
    const newImage = new Image({
      title: req.body.title,
      category: req.body.category,
      imageUrl: result.secure_url
    });
    await newImage.save();
    
    // Yükleme başarılı olduktan sonra geçici dosyayı siliyoruz (Çok Önemli!)
    fs.unlinkSync(req.file.path);
    res.redirect('/');
  } catch (error) {
    // Hata durumunda da geçici dosyayı silmeyi deneyin
    if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
    }
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
