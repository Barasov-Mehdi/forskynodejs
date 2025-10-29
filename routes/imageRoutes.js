const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const Image = require('../models/Image');

// ✅ Multer memory storage (Vercel uyumlu)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WEBP files are allowed.'));
    }
  }
});

// ✅ Tüm resimleri getir (API Endpoint: /api/images)
router.get('/', async (req, res) => {
  try {
    const images = await Image.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, images });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ Kategori listesi (API Endpoint: /api/images/upload)
// Bu rota frontend formlarında kategori listesini doldurmak için kullanılabilir
router.get('/upload', (req, res) => {
  const categories = ['WEDDINGS', 'BIRTHDAYS', 'NEW BORN', 'BOQUETS', 'GIFTS'];
  res.status(200).json({ success: true, categories });
});

// ✅ Resim yükleme: Memory'den Cloudinary'ye upload (API Endpoint: /api/images/upload POST)
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const { title, category } = req.body;
    if (!title || !category) {
      return res.status(400).json({ success: false, message: 'Title and category are required' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const result = await cloudinary.uploader.upload(fileBase64, { folder: 'my_images' });

    const newImage = new Image({
      title,
      category,
      imageUrl: result.secure_url,
      cloudinaryId: result.public_id, // Silme için kaydediyoruz
    });

    await newImage.save();
    res.status(201).json({ success: true, image: newImage });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ Resim silme (Cloudinary + MongoDB) (API Endpoint: /api/images/delete/:id)
router.delete('/delete/:id', async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ success: false, message: 'Image not found' });

    if (image.cloudinaryId) {
      await cloudinary.uploader.destroy(image.cloudinaryId);
    }

    await Image.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Image deleted successfully' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ Resim bilgisi düzenleme (API Endpoint: /api/images/edit/:id)
router.put('/edit/:id', async (req, res) => {
  try {
    const { title, category } = req.body;
    await Image.findByIdAndUpdate(req.params.id, { title, category });
    res.status(200).json({ success: true, message: 'Image updated successfully' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
