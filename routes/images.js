const express = require('express');
const router = express.Router();
const Image = require('../models/Image');
const { parser, cloudinary } = require('../config/cloudinary'); // Cloudinary config

// Tüm resimleri listele
router.get('/', async (req, res) => {
  try {
    const images = await Image.find().sort({ createdAt: -1 });
    res.render('images', { images });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Yönetim sayfası
router.get('/manage', async (req, res) => {
  const images = await Image.find().sort({ createdAt: -1 });
  res.render('manage', { images });
});

// 🔹 Arama (aynı sayfada göster)
router.get('/search', async (req, res) => {
  try {
    const category = req.query.category?.trim();
    let images = [];

    if (category) {
      images = await Image.find({
        category: { $regex: category, $options: 'i' },
      }).sort({ createdAt: -1 });
    } else {
      images = await Image.find().sort({ createdAt: -1 });
    }

    // Arama sonuçlarını manage.ejs içinde göster
    res.render('manage', { images });
  } catch (err) {
    console.error('Arama hatası:', err);
    res.status(500).send(err.message);
  }
});
// Yeni resim ekleme formu
router.get('/new', (req, res) => {
  res.render('newImage');
});

// Her kategoriden 1 resim döndür
// router.get('/unique-by-category', async (req, res) => {
//   try {
//     const allImages = await Image.find().sort({ createdAt: -1 });

//     const unique = [];
//     const seenCategories = new Set();

//     for (const img of allImages) {
//       if (!seenCategories.has(img.category)) {
//         unique.push(img);
//         seenCategories.add(img.category);
//       }
//     }

//     res.json(unique); // React tarafına JSON döndür
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Sunucu hatası');
//   }
// });

router.get('/unique-by-category', async (req, res) => {
  try {
    const allImages = await Image.find().sort({ createdAt: -1 });
    const unique = [];
    const seenCategories = new Set();

    for (const img of allImages) {
      if (!seenCategories.has(img.category)) {
        unique.push(img);
        seenCategories.add(img.category);
      }
    }

    res.json(unique); // React tarafına JSON döndür
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası' }); // <<< JSON formatında hata
  }
});


// Yeni resim ekle
router.post('/', parser.single('image'), async (req, res) => {
  const { title, category } = req.body;
  const imageUrl = req.file.path;

  const image = new Image({ title, category, imageUrl });
  try {
    await image.save();
    res.redirect('/'); // Ana sayfa
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Kategoriye göre filtrele
router.get('/category/:category', async (req, res) => {
  try {
    const images = await Image.find({ category: req.params.category });
    res.render('images', { images });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

/* -------------------- DÜZENLEME & SİLME -------------------- */

// routes/images.js
router.get('/all-json', async (req, res) => {
  try {
    const images = await Image.find().sort({ createdAt: -1 });
    res.json(images); // JSON döndür
  } catch (err) {
    res.status(500).send(err.message);
  }
});


// Silme
router.post('/delete/:id', async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).send('Resim bulunamadı');

    // Cloudinary'den sil
    const publicId = image.imageUrl.split('/').pop().split('.')[0]; // URL'den public_id al
    await cloudinary.uploader.destroy(publicId);

    await Image.findByIdAndDelete(req.params.id);
    res.redirect('/'); // Ana sayfa
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Düzenleme formu
router.get('/edit/:id', async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).send('Resim bulunamadı');
    res.render('editImage', { image });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Düzenleme işlemi
router.post('/edit/:id', parser.single('image'), async (req, res) => {
  try {
    const { title, category } = req.body;
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).send('Resim bulunamadı');

    // Eğer yeni resim yüklendiyse Cloudinary'e yükle ve eskiyi sil
    if (req.file) {
      const publicId = image.imageUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
      image.imageUrl = req.file.path;
    }

    image.title = title;
    image.category = category;
    await image.save();

    res.redirect('/');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
