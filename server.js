
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
const imagesRoute = require('./routes/images');
app.use('/', imagesRoute);
app.use('/api/images', imagesRoute);
app.use('/api/images', require('./routes/images'));

// MongoDB bağlantısı
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error(err));

// Vercel için export
module.exports = app;

// Lokal geliştirme ortamında çalıştırma
if (require.main === module) {
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
}
