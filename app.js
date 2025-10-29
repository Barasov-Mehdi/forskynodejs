const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const imageRoutes = require('./routes/imageRoutes');
const path = require('path');
const serverless = require('vercel-express');

dotenv.config();

const app = express();

// EJS ve statik dosyalar
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection cache
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  isConnected = true;
  console.log('MongoDB bağlantısı başarılı');
}

// Middleware ile her request öncesi DB bağlanıyor
app.use(async (req, res, next) => {
  if (!isConnected) await connectDB();
  next();
});

// Routes
app.use('/', imageRoutes);

// Vercel için export
module.exports = serverless(app);
