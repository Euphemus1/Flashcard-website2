import mongoose from 'mongoose';

const flashcardSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Card type is required'],
    enum: ['classic', 'multipleChoice'],
    default: 'classic'
  },
  question: {
    type: String,
    required: [true, 'Question is required'],
    trim: true
  },
  subtitle: {
    type: String,
    trim: true,
    default: ''
  },
  answer: {
    type: String,
    required: [true, 'Answer is required'],
    trim: true
  },
  options: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        // Require options only for multiple choice type
        return this.type !== 'multipleChoice' || v.length > 0;
      },
      message: 'Multiple choice cards require at least one option'
    }
  },
  correctIndex: {
    type: Number,
    validate: {
      validator: function(v) {
        if (this.type !== 'multipleChoice') return true;
        return Number.isInteger(v) && v >= 0 && v < this.options.length;
      },
      message: props => `Invalid correct index. Must be between 0 and ${this.options.length - 1}`
    },
    default: -1
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
  subsubdeck: {
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
    default: '',
    maxlength: [500, 'Notes cannot exceed 500 characters'] 
  }
}, { 
  collection: 'Flashcards',
  timestamps: true // Replaces manual createdAt/updatedAt
});

// Add index for common query patterns
flashcardSchema.index({ deck: 1, subdeck: 1, subsubdeck: 1, type: 1 });

const Flashcard = mongoose.model('Flashcards', flashcardSchema);
export default Flashcard;