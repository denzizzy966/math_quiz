import mongoose from 'mongoose';

const QuizSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  rows: [{ 
    number: Number, 
    operator: String 
  }],
  result: Number,
  speed: Number,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Quiz || mongoose.model('Quiz', QuizSchema);
