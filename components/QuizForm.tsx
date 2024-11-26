'use client'

import { useState } from 'react'

interface QuizFormProps {
  onGenerate: (rows: { number: number; operator: string }[], speed: number) => void
}

export default function QuizForm({ onGenerate }: QuizFormProps) {
  const [rowCount, setRowCount] = useState(2)
  const [rows, setRows] = useState<{ number: number; operator: string }[]>([
    { number: 0, operator: '+' },
    { number: 0, operator: '+' }
  ])
  const [speed, setSpeed] = useState(1000) // Default speed 1000ms

  const handleRowCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(e.target.value)
    setRowCount(count)
    setRows(prevRows => {
      const newRows = [...prevRows]
      if (count > prevRows.length) {
        for (let i = prevRows.length; i < count; i++) {
          newRows.push({ number: 0, operator: '+' })
        }
      } else {
        newRows.splice(count)
      }
      return newRows
    })
  }

  const handleRowChange = (index: number, field: 'number' | 'operator', value: string) => {
    setRows(prevRows => {
      const newRows = [...prevRows]
      if (field === 'number') {
        newRows[index].number = parseInt(value) || 0
      } else {
        newRows[index].operator = value
      }
      return newRows
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onGenerate(rows, speed)
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="mb-4">
        <label htmlFor="rowCount" className="block mb-2">Number of rows:</label>
        <input
          type="number"
          id="rowCount"
          value={rowCount}
          onChange={handleRowCountChange}
          min="2"
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      {rows.map((row, index) => (
        <div key={index} className="mb-4 flex gap-4">
          <div className="flex-1">
            <label htmlFor={`number-${index}`} className="block mb-2">Number {index + 1}:</label>
            <input
              type="number"
              id={`number-${index}`}
              value={row.number}
              onChange={(e) => handleRowChange(index, 'number', e.target.value)}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          {index > 0 && (
            <div className="w-24">
              <label htmlFor={`operator-${index}`} className="block mb-2">Operator:</label>
              <select
                id={`operator-${index}`}
                value={row.operator}
                onChange={(e) => handleRowChange(index, 'operator', e.target.value)}
                required
                className="w-full px-3 py-2 border rounded"
              >
                <option value="+">+</option>
                <option value="-">-</option>
                <option value="*">*</option>
                <option value="/">/</option>
              </select>
            </div>
          )}
        </div>
      ))}
      <div className="mb-4">
        <label htmlFor="speed" className="block mb-2">Speed (ms):</label>
        <input
          type="range"
          id="speed"
          min="100"
          max="2000"
          step="100"
          value={speed}
          onChange={(e) => setSpeed(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="text-center">{speed} ms</div>
      </div>
      <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Generate Quiz
      </button>
    </form>
  )
}

