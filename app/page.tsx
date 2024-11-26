'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, DropResult } from 'react-beautiful-dnd'
import QuizForm from '../components/QuizForm'
import ResultTable from '../components/ResultTable'
import QuizScreen from '../components/QuizScreen'
import QuizSelector from '../components/QuizSelector'
import QuizHistory from '../components/QuizHistory'

interface Quiz {
  _id?: string;  // MongoDB ID
  id: number;    // Client-side ID
  rows: { number: number; operator: string }[];
  result: number;
  speed: number;
}

export default function MathQuiz() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [showQuiz, setShowQuiz] = useState(false)
  const [isMultipleQuiz, setIsMultipleQuiz] = useState(false)
  const [currentQuizIndex, setCurrentQuizIndex] = useState(-1)
  const [quizHistory, setQuizHistory] = useState<Quiz[]>([])

  useEffect(() => {
    fetchQuizHistory();
  }, []);

  const fetchQuizHistory = async () => {
    try {
      const response = await fetch('/api/quizzes');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Check if data.quizzes exists and is an array
      if (data.quizzes && Array.isArray(data.quizzes)) {
        const transformedData = data.quizzes.map((quiz: any) => ({
          ...quiz,
          id: quiz._id || quiz.id || Date.now() // Use MongoDB _id, existing id, or generate new one
        }));
        setQuizHistory(transformedData);
      } else {
        console.error('Invalid quiz data format:', data);
      }
    } catch (error) {
      console.error('Failed to fetch quiz history:', error);
    }
  };

  const handleQuizGenerate = async (newRows: { number: number; operator: string }[], newSpeed: number) => {
    const newQuiz: Quiz = {
      id: Date.now(),
      rows: newRows,
      result: calculateResult(newRows),
      speed: newSpeed
    }
    setQuizzes(prevQuizzes => [...prevQuizzes, newQuiz])
    setSelectedQuiz(newQuiz)

    // Save to database
    await fetch('/api/quizzes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newQuiz),
    });

    // Refresh quiz history
    fetchQuizHistory();
  }

  const calculateResult = (rows: { number: number; operator: string }[]): number => {
    let result = rows[0].number;
    
    for (let i = 1; i < rows.length; i++) {
      const { number, operator } = rows[i];
      switch (operator) {
        case '+':
          result += number;
          break;
        case '-':
          result -= number;
          break;
        case '*':
          result *= number;
          break;
        case '/':
          if (number !== 0) {
            result /= number;
          } else {
            console.error('Division by zero');
            return NaN;
          }
          break;
      }
    }

    return result;
  }

  const handleStartQuiz = (index: number) => {
    setCurrentQuizIndex(index)
    setSelectedQuiz(quizzes[index])
    setShowQuiz(true)
  }

  const handleQuizFinish = () => {
    setShowQuiz(false)
    if (isMultipleQuiz) {
      if (currentQuizIndex < quizzes.length - 1) {
        setCurrentQuizIndex(currentQuizIndex + 1)
        setSelectedQuiz(quizzes[currentQuizIndex + 1])
        setShowQuiz(true)
      } else {
        setCurrentQuizIndex(-1)
        setSelectedQuiz(null)
      }
    } else {
      setSelectedQuiz(null)
    }
  }

  const handleDeleteQuiz = (id: number) => {
    setQuizzes(prevQuizzes => prevQuizzes.filter(quiz => quiz.id !== id))
    if (selectedQuiz && selectedQuiz.id === id) {
      setSelectedQuiz(null)
    }
  }

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const newQuizzes = Array.from(quizzes);
    const [reorderedItem] = newQuizzes.splice(result.source.index, 1);
    newQuizzes.splice(result.destination.index, 0, reorderedItem);

    setQuizzes(newQuizzes);
  }

  const handleSelectHistoryQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">Math Quiz Generator</h1>
      <QuizForm onGenerate={handleQuizGenerate} />
      {quizzes.length > 0 && (
        <DragDropContext onDragEnd={onDragEnd}>
          <QuizSelector 
            quizzes={quizzes} 
            selectedQuiz={selectedQuiz} 
            onSelectQuiz={setSelectedQuiz}
            isMultipleQuiz={isMultipleQuiz}
            onToggleMultipleQuiz={setIsMultipleQuiz}
            onStartQuiz={handleStartQuiz}
            onDeleteQuiz={handleDeleteQuiz}
          />
        </DragDropContext>
      )}
      {selectedQuiz && !isMultipleQuiz && !showQuiz && (
        <>
          <ResultTable rows={selectedQuiz.rows} result={selectedQuiz.result} />
          <button 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => handleStartQuiz(quizzes.findIndex(q => q.id === selectedQuiz.id))}
          >
            Start Quiz
          </button>
        </>
      )}
      {showQuiz && selectedQuiz && (
        <QuizScreen 
          rows={selectedQuiz.rows} 
          result={selectedQuiz.result} 
          speed={selectedQuiz.speed}
          onFinish={handleQuizFinish}
          currentQuizNumber={currentQuizIndex + 1}
          totalQuizzes={quizzes.length}
        />
      )}
      <QuizHistory quizzes={quizHistory} onSelectQuiz={handleSelectHistoryQuiz} />
    </div>
  )
}
