'use client'

import { useState, useEffect } from 'react'
import { Clock, CheckCircle } from 'lucide-react'
import Confettiful from './Confettiful'

interface QuizScreenProps {
  rows: { number: number; operator: string }[]
  result: number
  speed: number
  onFinish: () => void
  currentQuizNumber?: number
  totalQuizzes?: number
}

export default function QuizScreen({ 
  rows, 
  result, 
  speed, 
  onFinish,
  currentQuizNumber,
  totalQuizzes
}: QuizScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [showResult, setShowResult] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const [resultCountdown, setResultCountdown] = useState(5)

  // Reset state when component mounts or when quiz changes
  useEffect(() => {
    setCurrentIndex(-1)
    setShowResult(false)
    setCountdown(3)
    setResultCountdown(5)
  }, [rows, result, speed])

  // Handle initial countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0 && currentIndex === -1) {
      setCurrentIndex(0)
    }
  }, [countdown, currentIndex])

  // Handle quiz progression
  useEffect(() => {
    if (currentIndex >= 0 && currentIndex < rows.length) {
      const timer = setTimeout(() => setCurrentIndex(currentIndex + 1), speed)
      return () => clearTimeout(timer)
    } else if (currentIndex === rows.length && !showResult) {
      const timer = setTimeout(() => setShowResult(true), 5000)
      return () => clearTimeout(timer)
    } else if (showResult) {
      const timer = setTimeout(onFinish, 3000)
      return () => clearTimeout(timer)
    }
  }, [currentIndex, showResult, rows.length, speed, onFinish])

  // Handle result countdown
  useEffect(() => {
    if (currentIndex === rows.length && !showResult && resultCountdown > 0) {
      const timer = setTimeout(() => setResultCountdown(resultCountdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [currentIndex, showResult, resultCountdown, rows.length])

  // Request fullscreen
  useEffect(() => {
    document.documentElement.requestFullscreen().catch(err => console.log(err))
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.log(err))
      }
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center">
      {currentQuizNumber && totalQuizzes && (
        <div className="absolute top-4 left-4 text-xl font-bold">
          Soal No {currentQuizNumber} dari {totalQuizzes}
        </div>
      )}
      {countdown > 0 && (
        <div className="text-center">
          <div className="text-4xl mb-4">Quiz dimulai dalam</div>
          <div className="text-8xl">{countdown}</div>
        </div>
      )}
      {currentIndex >= 0 && currentIndex < rows.length && (
        <div className="flex items-center text-8xl">
          <span>{rows[currentIndex].number}</span>
          {currentIndex < rows.length - 1 && (
            <span className="ml-4">{rows[currentIndex + 1].operator}</span>
          )}
        </div>
      )}
      {currentIndex === rows.length && !showResult && (
        <div className="text-center">
          <Clock className="w-32 h-32 mx-auto mb-4" />
          <div className="text-4xl">Hasil dalam {resultCountdown}</div>
        </div>
      )}
      {showResult && (
        <div className="text-center relative">
          <div className="fixed inset-0 z-10">
            <Confettiful />
          </div>
          <div className="text-center relative z-20">
            <CheckCircle className="w-32 h-32 mx-auto mb-4 text-green-500" />
            <div className="text-9xl animate-bounce">{result}</div>
          </div>
        </div>
      )}
    </div>
  )
}

