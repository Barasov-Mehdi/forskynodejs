const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const imageRoutes = require('./routes/imageRoutes');
const path = require('path');
const serverless = require('vercel-express');

dotenv.config();

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));

app.use('/', imageRoutes);

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('MongoDB bağlantısı başarılı'))
  .catch(err => console.log(err));

module.exports = serverless(app); // <-- Serverless olarak export ediyoruz
