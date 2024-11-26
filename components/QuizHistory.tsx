import React from 'react';

interface Quiz {
  id: number;
  rows: { number: number; operator: string }[];
  result: number;
  speed: number;
}

interface QuizHistoryProps {
  quizzes: Quiz[];
  onSelectQuiz: (quiz: Quiz) => void;
}

const QuizHistory: React.FC<QuizHistoryProps> = ({ quizzes, onSelectQuiz }) => {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Quiz History</h2>
      {quizzes.map((quiz) => (
        <div key={quiz.id} className="mb-2 p-2 border rounded">
          <div className="flex justify-between items-center">
            <span>
              {quiz.rows.length} numbers, Speed: {quiz.speed}ms
            </span>
            <button
              onClick={() => onSelectQuiz(quiz)}
              className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Use This Quiz
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuizHistory;

