// const express = require('express');
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const imageRoutes = require('./routes/imageRoutes');
// const path = require('path');

// dotenv.config();
// const app = express();

// mongoose.connect(process.env.MONGODB_URL)
//   .then(() => console.log('MongoDB bağlantısı başarılı'))
//   .catch(err => console.log(err));

// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));
// app.use(express.urlencoded({ extended: true }));

// app.use('/', imageRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Sunucu çalışıyor: http://localhost:${PORT}`));



const express = require('express');
const app = express();
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

// Routes
const imageRoutes = require('./routes/imageRoutes');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));

app.use('/', imageRoutes);

module.exports = app; // serverless uyumlu
