const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema({
  question: String,
  answer: String,
  deck: String,
  subdeck: String,
  interval: { type: Number, default: 1 },
  lastReview: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Flashcard', flashcardSchema);