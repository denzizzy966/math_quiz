import mongoose from 'mongoose';

const QuizSchema = new mongoose.Schema({
  rows: [{ 
    number: Number, 
    operator: String 
  }],
  result: Number,
  speed: Number,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Quiz || mongoose.model('Quiz', QuizSchema);

