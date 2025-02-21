import mongoose from 'mongoose';

const flashcardSchema = new mongoose.Schema({
  question: { 
    type: String, 
    required: [true, 'Question is required'],
    minlength: [10, 'Question must be at least 10 characters']
  },
  answer: {
    type: String,
    required: [true, 'Answer is required'],
    minlength: [5, 'Answer must be at least 5 characters']
  },
  deck: {
    type: String,
    required: [true, 'Deck is required'],
    enum: ['Microbiología', 'Semiología', 'Patología', 'Farmacología'] // Add your actual decks
  },
  subdeck: {
    type: String,
    required: [true, 'Subdeck is required']
  },
  interval: { 
    type: Number, 
    default: 1,
    min: [1, 'Interval cannot be less than 1 day'],
    max: [365, 'Interval cannot exceed 1 year']
  },
  lastReview: { 
    type: Date, 
    default: Date.now 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  // Consider adding these optional fields:
  tags: [String],
  references: [String],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Add indexes for common queries
flashcardSchema.index({ deck: 1, subdeck: 1 });
flashcardSchema.index({ createdBy: 1 });
flashcardSchema.index({ lastReview: 1 });

const Flashcard = mongoose.model('Flashcard', flashcardSchema);
export default Flashcard;