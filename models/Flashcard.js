import mongoose from 'mongoose';

const flashcardSchema = new mongoose.Schema({
  question: String,
  answer: String,
  deck: String,
  subdeck: String,
  interval: { type: Number, default: 1 },
  lastReview: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Flashcard = mongoose.model('Flashcard', flashcardSchema);
export default Flashcard;