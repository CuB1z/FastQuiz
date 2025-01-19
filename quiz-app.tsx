"use client"

import { useState, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Upload, FileUp, RotateCcw, X } from 'lucide-react'
import { IntroductionModal } from './introduction-modal'

interface Option {
  id: string
  text: string
  isCorrect: boolean
  value: number
}

interface Question {
  id: string
  type: string
  text: string
  options: Option[]
}

interface QuizData {
  id: string
  title: string
  description: string
  tags: string[]
  questions: Question[]
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function QuizApp() {
  const [quizData, setQuizData] = useState<QuizData | null>(null)
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [score, setScore] = useState(0)

  const shuffleQuestions = useCallback((questions: Question[]) => {
    const shuffled = shuffleArray(questions).map(question => ({
      ...question,
      options: shuffleArray(question.options)
    }))
    setShuffledQuestions(shuffled)
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setIsAnswerSubmitted(false)
    setScore(0)
  }, [])

  const handleFileUpload = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string) as QuizData
        setQuizData(json)
        shuffleQuestions(json.questions)
      } catch (error) {
        console.error("Error parsing JSON:", error)
      }
    }
    reader.readAsText(file)
  }, [shuffleQuestions])

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files[0]
    if (file && file.type === "application/json") {
      handleFileUpload(file)
    }
  }, [handleFileUpload])

  const handlePrevQuestion = useCallback(() => {
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
    setSelectedAnswer(null)
    setIsAnswerSubmitted(false)
  }, [])

  const handleNextQuestion = useCallback(() => {
    setCurrentQuestionIndex((prev) => Math.min(shuffledQuestions.length - 1, prev + 1))
    setSelectedAnswer(null)
    setIsAnswerSubmitted(false)
  }, [shuffledQuestions.length])

  const handleSubmitAnswer = useCallback(() => {
    if (selectedAnswer !== null) {
      const currentQuestion = shuffledQuestions[currentQuestionIndex]
      const selectedOption = currentQuestion.options.find(option => option.id === selectedAnswer)
      if (selectedOption && selectedOption.isCorrect) {
        setScore(prevScore => prevScore + 1)
      }
      setIsAnswerSubmitted(true)
    }
  }, [selectedAnswer, shuffledQuestions, currentQuestionIndex])

  const handleReshuffleQuestions = useCallback(() => {
    if (quizData) {
      shuffleQuestions(quizData.questions)
    }
  }, [quizData, shuffleQuestions])

  const handleRemoveQuiz = useCallback(() => {
    setQuizData(null)
    setShuffledQuestions([])
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setIsAnswerSubmitted(false)
    setScore(0)
  }, [])

  const renderFileUpload = () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-2xl">Fast Quiz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <IntroductionModal />
          </div>
          <div
            className={`border-2 border-dashed rounded-lg p-4 sm:p-8 text-center ${
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
            <p className="mt-2 text-xs sm:text-sm text-gray-600">Drag and drop your JSON file here, or</p>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
            />
            <label
              htmlFor="file-upload"
              className="mt-2 cursor-pointer inline-flex items-center rounded-md bg-white px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              <FileUp className="-ml-0.5 mr-1.5 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" aria-hidden="true" />
              Select a file
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  if (!quizData) {
    return renderFileUpload()
  }

  const currentQuestion = shuffledQuestions[currentQuestionIndex]

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
          <CardTitle className="text-lg sm:text-xl text-center sm:text-left">{quizData.title}</CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-xs sm:text-sm font-medium">Score: {score}/{shuffledQuestions.length}</span>
            <Button variant="outline" size="icon" onClick={handleReshuffleQuestions}>
              <RotateCcw className="h-4 w-4" />
              <span className="sr-only">Reshuffle questions</span>
            </Button>
            <Button variant="outline" size="icon" onClick={handleRemoveQuiz}>
              <X className="h-4 w-4" />
              <span className="sr-only">Remove quiz</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">Question {currentQuestionIndex + 1} of {shuffledQuestions.length}</h2>
          <p className="mb-4 text-sm sm:text-base">{currentQuestion.text}</p>
          <RadioGroup
            value={selectedAnswer || ""}
            onValueChange={setSelectedAnswer}
            className="space-y-2"
          >
            {currentQuestion.options.map((option) => (
              <div
                key={option.id}
                className={`flex items-center space-x-2 p-2 rounded text-sm sm:text-base ${
                  isAnswerSubmitted
                    ? option.isCorrect
                      ? 'bg-green-200'
                      : selectedAnswer === option.id
                      ? 'bg-red-200'
                      : 'bg-gray-200'
                    : 'bg-gray-200'
                }`}
              >
                <RadioGroupItem value={option.id} id={option.id} disabled={isAnswerSubmitted} />
                <Label htmlFor={option.id} className="flex-grow cursor-pointer">{option.text}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0">
          <Button onClick={handlePrevQuestion} disabled={currentQuestionIndex === 0} className="w-full sm:w-auto">
            Previous
          </Button>
          {!isAnswerSubmitted ? (
            <Button onClick={handleSubmitAnswer} disabled={selectedAnswer === null} className="w-full sm:w-auto">
              Submit Answer
            </Button>
          ) : (
            <Button
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === shuffledQuestions.length - 1}
              className="w-full sm:w-auto"
            >
              Next Question
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

