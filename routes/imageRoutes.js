const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary'); 
const Image = require('../models/Image');

// KRİTİK: Vercel'in read-only (salt okunur) dosya sistemine uymak için
// Multer'ı diske (diskStorage) değil, belleğe (memoryStorage) kaydetmesi için ayarla.
const upload = multer({ storage: multer.memoryStorage() });

// --- GÖRÜNTÜLEME VE LİSTELEME ROUTE'LARI ---

// Ana sayfa: resimleri listele
router.get('/', async (req, res) => {
    try {
        // MongooseError timeout hatası devam ederse, sorun HÂLÂ MongoDB Atlas ağ ayarlarınızdadır.
        const images = await Image.find().sort({ createdAt: -1 });
        res.render('index', { images });
    } catch (error) {
        console.error("Ana sayfa veri çekme hatası:", error.message);
        // MongoDB bağlantı hatası durumunda kullanıcıya bilgi ver
        res.status(500).send('Veritabanından veri çekilemedi. Lütfen MongoDB bağlantınızı ve Ağ Erişimi ayarlarınızı kontrol edin.');
    }
});

// Yükleme formu sayfasını göster
router.get('/upload', (req, res) => {
    const categories = ['WEDDINGS', 'BIRTHDAYS', 'NEW BORN', 'BOQUETS', 'GIFTS'];
    res.render('upload', { categories });
});


// --- YÜKLEME VE SİLME ROUTE'LARI ---

// Resim yükleme
router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('Dosya bulunamadı.');
        }

        // 1. Bellekteki dosya buffer'ını Cloudinary'ye yüklemek için base64 URI'ye çeviriyoruz
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
            imageUrl: result.secure_url,
            // Eğer Cloudinary Public ID'sini silme işlemi için saklamak isterseniz:
            // cloudinaryId: result.public_id 
        });
        await newImage.save(); 
        
        res.redirect('/');
    } catch (error) {
        console.error("Yükleme işlemi sırasında hata oluştu:", error.message);
        res.status(500).send('Resim yüklenirken bir hata oluştu: ' + error.message);
    }
});

// Resim silme (Veritabanından)
router.post('/delete/:id', async (req, res) => {
    try {
        // İsteğe bağlı: Eğer Cloudinary'den de silmek isterseniz, önce public_id'yi bulmanız gerekir.
        // const imageToDelete = await Image.findById(req.params.id);
        // if (imageToDelete.cloudinaryId) { await cloudinary.uploader.destroy(imageToDelete.cloudinaryId); }
        
        await Image.findByIdAndDelete(req.params.id);
        res.redirect('/');
    } catch (error) {
        console.error("Silme işlemi sırasında hata oluştu:", error.message);
        res.status(500).send('Silme işlemi başarısız oldu: ' + error.message);
    }
});


// --- DÜZENLEME ROUTE'LARI ---

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
