// app.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const imageRoutes = require('./routes/imageRoutes');
const path = require('path');
const serverless = require('vercel-express'); // veya serverless-http

dotenv.config();

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));

// Statik dosyalar (CSS, JS, img)
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', imageRoutes);

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('MongoDB bağlantısı başarılı'))
  .catch(err => console.log(err));

// Vercel için export
module.exports = serverless(app);
