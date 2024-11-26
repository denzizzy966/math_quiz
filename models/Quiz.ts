import mongoose from 'mongoose';

const QuizSchema = new mongoose.Schema({
  numbers: [{ type: Number, required: true }],
  operator: { type: String, required: true },
  result: { type: Number, required: true },
  speed: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Quiz || mongoose.model('Quiz', QuizSchema);
