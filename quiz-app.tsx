"use client"

import { useState, useCallback } from "react"
import type { DragEvent } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Upload, FileUp, RotateCcw, X, ChevronLeft, ChevronRight } from "lucide-react"
import { IntroductionModal } from "./introduction-modal"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

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
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
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
  const [direction, setDirection] = useState(0) // -1 for left, 1 for right

  const shuffleQuestions = useCallback((questions: Question[]) => {
    const shuffled = shuffleArray(questions).map((question) => ({
      ...question,
      options: shuffleArray(question.options),
    }))
    setShuffledQuestions(shuffled)
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setIsAnswerSubmitted(false)
    setScore(0)
  }, [])

  const handleFileUpload = useCallback(
    (file: File) => {
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
    },
    [shuffleQuestions],
  )

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      setIsDragging(false)
      const file = event.dataTransfer.files[0]
      if (file && file.type === "application/json") {
        handleFileUpload(file)
      }
    },
    [handleFileUpload],
  )

  const handlePrevQuestion = useCallback(() => {
    setDirection(-1)
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
    setSelectedAnswer(null)
    setIsAnswerSubmitted(false)
  }, [])

  const handleNextQuestion = useCallback(() => {
    setDirection(1)
    setCurrentQuestionIndex((prev) => Math.min(shuffledQuestions.length - 1, prev + 1))
    setSelectedAnswer(null)
    setIsAnswerSubmitted(false)
  }, [shuffledQuestions.length])

  const handleSubmitAnswer = useCallback(() => {
    if (selectedAnswer !== null) {
      const currentQuestion = shuffledQuestions[currentQuestionIndex]
      const selectedOption = currentQuestion.options.find((option) => option.id === selectedAnswer)
      if (selectedOption && selectedOption.isCorrect) {
        setScore((prevScore) => prevScore + 1)
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

  const progressPercentage =
    shuffledQuestions.length > 0 ? ((currentQuestionIndex + 1) / shuffledQuestions.length) * 100 : 0

  const renderFileUpload = () => (
    <div className="flex items-center justify-center min-h-screen bg-background p-4 pb-16 transition-colors duration-300">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">Fast Quiz</h1>
          <div className="flex justify-center">
            <IntroductionModal />
          </div>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-6 sm:p-10 text-center transition-all duration-300 ${
            isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-10 w-10 sm:h-14 sm:w-14 text-muted-foreground" />
          <p className="mt-3 text-sm sm:text-base text-muted-foreground">Drag and drop your JSON file here, or</p>
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
            className="mt-4 cursor-pointer inline-flex items-center rounded-md bg-primary px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            <FileUp className="-ml-0.5 mr-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            Select a file
          </label>
        </div>
      </div>
    </div>
  )

  if (!quizData) {
    return renderFileUpload()
  }

  const currentQuestion = shuffledQuestions[currentQuestionIndex]

  return (
    <div className="flex items-center justify-center min-h-screen bg-background transition-colors duration-300">
      <div className="w-full max-w-2xl mx-auto">
        {/* Mobile header with menu */}
        <div className="sm:hidden flex items-center justify-between bg-background sticky top-0 z-10 p-4 border-b">
          <h1 className="font-semibold truncate pr-2">{quizData.title}</h1>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={handleReshuffleQuestions}>
              <RotateCcw className="h-5 w-5" />
              <span className="sr-only">Reshuffle Questions</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleRemoveQuiz}>
              <X className="h-5 w-5" />
              <span className="sr-only">Exit Quiz</span>
            </Button>
          </div>
        </div>

        {/* Desktop header */}
        <div className="hidden sm:block p-8 pb-0">
          <div className="flex justify-between items-center mb-5">
            <h1 className="text-xl font-bold">{quizData.title}</h1>
            <div className="hidden sm:flex items-center space-x-3">
              <Button variant="outline" size="icon" onClick={handleReshuffleQuestions} title="Reshuffle questions">
                <RotateCcw className="h-4 w-4" />
                <span className="sr-only">Reshuffle</span>
              </Button>
              <Button variant="outline" size="icon" onClick={handleRemoveQuiz} title="Exit quiz">
                <X className="h-4 w-4" />
                <span className="sr-only">Exit</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Tags and progress */}
        <div className="px-5 sm:px-8 py-4 sm:py-5">
          <div className="flex flex-wrap gap-2 mb-5">
            {quizData.tags &&
              quizData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                Question {currentQuestionIndex + 1} of {shuffledQuestions.length}
              </span>
              <span className="text-sm font-medium">
                Score: {score}/{shuffledQuestions.length}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>

        {/* Question content */}
        <div className="px-5 sm:px-8 py-5">
          <div className="space-y-5">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-5">{currentQuestion.text}</h2>
            <RadioGroup value={selectedAnswer || ""} onValueChange={setSelectedAnswer} className="space-y-4">
              {currentQuestion.options.map((option) => (
                <div
                  key={option.id}
                  className={`flex items-center space-x-3 p-4 rounded-md transition-colors ${
                    isAnswerSubmitted
                      ? option.isCorrect
                        ? "bg-green-500/20 dark:bg-green-500/30 border border-green-500/50"
                        : selectedAnswer === option.id
                          ? "bg-red-500/20 dark:bg-red-500/30 border border-red-500/50"
                          : "bg-muted/50 border border-transparent"
                      : "bg-muted/50 hover:bg-muted border border-transparent"
                  }`}
                >
                  <RadioGroupItem value={option.id} id={option.id} disabled={isAnswerSubmitted} />
                  <Label htmlFor={option.id} className="flex-grow cursor-pointer text-sm sm:text-base">
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 p-5 sm:p-8 pt-4 sm:pt-5 border-t">
          <Button
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
            className="w-full sm:w-auto"
            variant="outline"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
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
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
