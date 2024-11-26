import mongoose from 'mongoose';

const QuizSchema = new mongoose.Schema({
  numbers: {
    type: [Number],
    required: true,
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'Quiz must have at least one number'
    }
  },
  operator: {
    type: String,
    required: true,
    enum: ['+', '-', '*', '/'],
    message: 'Operator must be one of: +, -, *, /'
  },
  result: {
    type: Number,
    required: true
  },
  speed: {
    type: Number,
    required: true,
    min: [0, 'Speed cannot be negative']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add index for better query performance
QuizSchema.index({ createdAt: -1 });

const Quiz = mongoose.models.Quiz || mongoose.model('Quiz', QuizSchema);

export default Quiz;
