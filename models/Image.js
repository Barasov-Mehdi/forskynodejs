const mongoose = require('mongoose');

const categories = ['WEDDINGS', 'BIRTHDAYS', 'NEW BORN', 'BOQUETS', 'GIFTS'];

const ImageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, enum: categories, required: true },
  imageUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Image', ImageSchema);
