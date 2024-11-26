import React, { useState } from 'react'
import { Droppable, Draggable } from 'react-beautiful-dnd'

interface Quiz {
  id: number;
  rows: { number: number; operator: string }[];
  result: number;
  speed: number;
}

interface QuizSelectorProps {
  quizzes: Quiz[];
  selectedQuiz: Quiz | null;
  onSelectQuiz: (quiz: Quiz) => void;
  isMultipleQuiz: boolean;
  onToggleMultipleQuiz: (isMultiple: boolean) => void;
  onStartQuiz: (index: number) => void;
  onDeleteQuiz: (id: number) => void;
}

export default function QuizSelector({ 
  quizzes = [], 
  selectedQuiz, 
  onSelectQuiz, 
  isMultipleQuiz, 
  onToggleMultipleQuiz,
  onStartQuiz,
  onDeleteQuiz
}: QuizSelectorProps) {
  const [expandedQuiz, setExpandedQuiz] = useState<number | null>(null);

  const toggleQuizExpansion = (id: number) => {
    setExpandedQuiz(expandedQuiz === id ? null : id);
  };

  if (!Array.isArray(quizzes)) {
    console.error('quizzes prop is not an array:', quizzes);
    return null;
  }

  return (
    <div className="mb-4">
      <h2 className="text-xl font-bold mb-2">Saved Quizzes</h2>
      <div className="flex items-center mb-2">
        <label className="mr-2">
          <input 
            type="checkbox" 
            checked={isMultipleQuiz} 
            onChange={(e) => onToggleMultipleQuiz(e.target.checked)}
            className="mr-1"
          />
          Multiple Quiz Mode
        </label>
      </div>
      {quizzes.length === 0 ? (
        <p className="text-gray-500">No quizzes available yet. Create one using the form above.</p>
      ) : (
        <Droppable droppableId="quizList">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {quizzes.map((quiz, index) => (
                <Draggable key={quiz.id} draggableId={quiz.id.toString()} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="mb-2 p-2 border rounded bg-white"
                    >
                      <div className="flex justify-between items-center">
                        <span 
                          className="cursor-pointer"
                          onClick={() => toggleQuizExpansion(quiz.id)}
                        >
                          Soal No {index + 1} - {quiz.rows.length} numbers, Speed: {quiz.speed}ms
                        </span>
                        <div>
                          <button 
                            onClick={() => onStartQuiz(index)}
                            className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
                          >
                            Mulai
                          </button>
                          <button 
                            onClick={() => onDeleteQuiz(quiz.id)}
                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                      {expandedQuiz === quiz.id && (
                        <div className="mt-2">
                          <h3 className="font-bold">Detail Soal:</h3>
                          <div className="flex flex-wrap">
                            {quiz.rows.map((row, rowIndex) => (
                              <span key={rowIndex} className="mr-2">
                                {rowIndex > 0 && row.operator} {row.number}
                              </span>
                            ))}
                            <span>= {quiz.result}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      )}
    </div>
  )
}
