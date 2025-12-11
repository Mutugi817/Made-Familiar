const mongoose = require('mongoose');

const PaperSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  course: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true
  },
  filePath: {
    type: String,
    required: true, // Stores relative or absolute path to the PDF on server
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Paper', PaperSchema);