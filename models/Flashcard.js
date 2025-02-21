import mongoose from 'mongoose';

const flashcardSchema = new mongoose.Schema({
  question: {
      type: String,
      required: [true, 'Question is required'],
      trim: true
  },
  answer: {
      type: String,
      required: [true, 'Answer is required'],
      trim: true
  },
  deck: {
      type: String,
      required: [true, 'Deck is required'],
      trim: true
  },
  subdeck: {
      type: String,
      trim: true,
      default: ''
  },
  references: {
      type: [String],
      default: []
  },
  tags: {
      type: [String],
      default: []
  },
  extraInfo: {
      type: String,
      trim: true,
      default: ''
  },
  createdAt: {
      type: Date,
      default: Date.now
  },
  updatedAt: {
      type: Date,
      default: Date.now
  }
},{ collection: 'Flashcards' });

const Flashcard = mongoose.model('Flashcards', flashcardSchema);
export default Flashcard;