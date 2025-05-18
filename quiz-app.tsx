"use client"

import { useState, useCallback, useEffect } from "react"
import type { DragEvent } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  Upload,
  FileUp,
  RotateCcw,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  InfoIcon,
  Settings,
  Sun,
  Moon,
  Laptop,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { QuizSummary } from "./components/quiz-summary"
import { useSettings } from "./components/settings-provider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { SimpleModal } from "./components/simple-modal"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { useTheme } from "next-themes"

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
  const { toast } = useToast()
  const {
    timerEnabled,
    setTimerEnabled,
    timerDuration,
    setTimerDuration,
    shuffleQuestions: shuffleQuestionsEnabled,
    setShuffleQuestions: setShuffleQuestionsEnabled,
    shuffleOptions: shuffleOptionsEnabled,
    setShuffleOptions: setShuffleOptionsEnabled,
  } = useSettings()
  const { theme, setTheme } = useTheme()

  // Quiz data states
  const [quizData, setQuizData] = useState<QuizData | null>(null)
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [score, setScore] = useState(0)
  const [direction, setDirection] = useState(0) // -1 for left, 1 for right
  const [hasLastQuiz, setHasLastQuiz] = useState(false)

  // Input mode states
  const [inputMode, setInputMode] = useState<"file" | "text">("file")
  const [jsonText, setJsonText] = useState<string>("")
  const [jsonError, setJsonError] = useState<string | null>(null)

  // Timer state
  const [timeLeft, setTimeLeft] = useState<number | null>(null)

  // Results states
  const [answerHistory, setAnswerHistory] = useState<
    { questionId: string; correct: boolean; selectedOption: string }[]
  >([])
  const [showSummary, setShowSummary] = useState<boolean>(false)

  // Animation states
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Loading state
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmitAnswer = useCallback(() => {
    if (selectedAnswer !== null) {
      const currentQuestion = shuffledQuestions[currentQuestionIndex]
      const selectedOption = currentQuestion.options.find((option) => option.id === selectedAnswer)
      const isCorrect = selectedOption?.isCorrect || false

      if (isCorrect) {
        setScore((prevScore) => prevScore + 1)
        toast({
          title: "Correct answer!",
          description: "You got it right",
          variant: "default",
        })
      } else {
        toast({
          title: "Incorrect answer",
          description: "You got it wrong",
          variant: "destructive",
        })
      }

      // Add to answer history
      setAnswerHistory((prev) => [
        ...prev,
        {
          questionId: currentQuestion.id,
          correct: isCorrect,
          selectedOption: selectedAnswer,
        },
      ])

      setIsAnswerSubmitted(true)
    }
  }, [selectedAnswer, shuffledQuestions, currentQuestionIndex, toast])

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null

    if (timerEnabled && timeLeft !== null && timeLeft > 0 && !isAnswerSubmitted) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
    } else if (timerEnabled && timeLeft === 0 && !isAnswerSubmitted) {
      // Auto-submit when time runs out
      handleSubmitAnswer()
      toast({
        title: "Time's up!",
        description: "Your answer has been automatically submitted.",
        variant: "destructive",
      })
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [timerEnabled, timeLeft, isAnswerSubmitted, handleSubmitAnswer, toast])

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasLastQuiz(!!localStorage.getItem("lastQuiz"))
    }
  }, [isLoading])

  // Reset timer when moving to next question
  useEffect(() => {
    if (timerEnabled) {
      setTimeLeft(timerDuration)
    }
  }, [currentQuestionIndex, timerEnabled, timerDuration])

  const shuffleQuestions = useCallback(
    (questions: Question[]) => {
      let processedQuestions = [...questions]

      if (shuffleQuestionsEnabled) {
        processedQuestions = shuffleArray(processedQuestions)
      }

      if (shuffleOptionsEnabled) {
        processedQuestions = processedQuestions.map((question) => ({
          ...question,
          options: shuffleArray(question.options),
        }))
      } else {
        processedQuestions = processedQuestions.map((question) => ({
          ...question,
          options: [...question.options],
        }))
      }

      setShuffledQuestions(processedQuestions)
      setCurrentQuestionIndex(0)
      setSelectedAnswer(null)
      setIsAnswerSubmitted(false)
      setScore(0)
      setAnswerHistory([])
      setShowSummary(false)

      if (timerEnabled) {
        setTimeLeft(timerDuration)
      }
    },
    [shuffleQuestionsEnabled, shuffleOptionsEnabled, timerEnabled, timerDuration],
  )

  const handleFileUpload = useCallback(
    (file: File) => {
      setIsLoading(true)
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string) as QuizData
          setQuizData(json)
          shuffleQuestions(json.questions)

          // Save to localStorage for future use
          localStorage.setItem("lastQuiz", e.target?.result as string)

          toast({
            title: "Quiz loaded",
            description: `${json.title} - ${json.questions.length} questions`,
          })
        } catch (error) {
          console.error("Error parsing JSON:", error)
          toast({
            title: "Error loading quiz",
            description: "The file does not contain valid JSON",
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      }
      reader.readAsText(file)
    },
    [shuffleQuestions, toast],
  )

  const handleJsonTextSubmit = useCallback(() => {
    setIsLoading(true)
    try {
      setJsonError(null)
      const json = JSON.parse(jsonText) as QuizData
      setQuizData(json)
      shuffleQuestions(json.questions)

      // Save to localStorage for future use
      localStorage.setItem("lastQuiz", jsonText)

      toast({
        title: "Quiz loaded",
        description: `${json.title} - ${json.questions.length} questions`,
      })
    } catch (error) {
      console.error("Error parsing JSON:", error)
      setJsonError("Error processing JSON. Check the format.")
      toast({
        title: "Error loading quiz",
        description: "The text does not contain valid JSON",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [jsonText, shuffleQuestions, toast])

  const loadLastQuiz = useCallback(() => {
    setIsLoading(true)
    const lastQuiz = localStorage.getItem("lastQuiz")
    if (lastQuiz) {
      try {
        // Store the JSON text in case user wants to edit it later
        setJsonText(lastQuiz)

        // Parse and load the quiz directly
        const json = JSON.parse(lastQuiz) as QuizData
        setQuizData(json)
        shuffleQuestions(json.questions)

        toast({
          title: "Previous quiz loaded",
          description: `${json.title} - ${json.questions.length} questions`,
        })
      } catch (error) {
        console.error("Error parsing saved JSON:", error)
        toast({
          title: "Error loading quiz",
          description: "The saved quiz data is invalid",
          variant: "destructive",
        })
        // Switch to text mode so user can see and fix the JSON
        setInputMode("text")
      } finally {
        setIsLoading(false)
      }
    }
  }, [toast, shuffleQuestions])

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
    setIsTransitioning(true)

    setTimeout(() => {
      setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
      setSelectedAnswer(null)
      setIsAnswerSubmitted(false)
      setIsTransitioning(false)
    }, 300)
  }, [])

  const handleNextQuestion = useCallback(() => {
    setDirection(1)
    setIsTransitioning(true)

    setTimeout(() => {
      setCurrentQuestionIndex((prev) => Math.min(shuffledQuestions.length - 1, prev + 1))
      setSelectedAnswer(null)
      setIsAnswerSubmitted(false)
      setIsTransitioning(false)
    }, 300)
  }, [shuffledQuestions.length])

  const handleReshuffleQuestions = useCallback(() => {
    if (quizData) {
      shuffleQuestions(quizData.questions)
      toast({
        title: "Quiz restarted",
        description: "Questions have been reshuffled",
      })
    }
  }, [quizData, shuffleQuestions, toast])

  const handleRemoveQuiz = useCallback(() => {
    setQuizData(null)
    setShuffledQuestions([])
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setIsAnswerSubmitted(false)
    setScore(0)
    setShowSummary(false)
    setAnswerHistory([])
    setInputMode("file")
    setJsonError(null)
  }, [])

  const handleShowSummary = useCallback(() => {
    setShowSummary(true)
  }, [])

  const progressPercentage =
    shuffledQuestions.length > 0 ? ((currentQuestionIndex + 1) / shuffledQuestions.length) * 100 : 0

  const renderFileUpload = () => (
    <div className="flex items-center justify-center min-h-screen bg-background p-4 pb-16 transition-colors duration-300">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">Fast Quiz</h1>
          <p className="text-muted-foreground mb-4">Load and play quizzes quickly</p>
          <div className="flex justify-center">
            <SimpleModal
              trigger={
                <Button variant="outline" size="sm" className="gap-1">
                  <InfoIcon className="h-4 w-4" />
                  <span>How it works</span>
                </Button>
              }
              title="Welcome to Fast Quiz"
            >
              <div className="space-y-4 text-left">
                <p className="text-sm text-muted-foreground">
                  Fast Quiz is a lightweight quiz application that allows you to load and take quizzes from JSON files.
                </p>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Getting Started</h3>
                  <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2">
                    <li>Upload a JSON file or paste JSON content directly</li>
                    <li>Answer each question by selecting the correct option</li>
                    <li>Submit your answer to see if you were correct</li>
                    <li>Navigate through questions using the Previous and Next buttons</li>
                    <li>View your final score and review your answers at the end</li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Features</h3>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                    <li>Timer option for timed quizzes</li>
                    <li>Question and answer shuffling</li>
                    <li>Dark and light mode support</li>
                    <li>Detailed results summary</li>
                    <li>Save and load quizzes from your device</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">JSON Format</h3>
                  <p className="text-sm text-muted-foreground">Your quiz JSON should follow this structure:</p>
                  <pre className="bg-muted p-3 rounded-md text-xs overflow-auto">
                    {`{
  "id": "quiz-1",
  "title": "Sample Quiz",
  "description": "A sample quiz",
  "tags": ["sample", "demo"],
  "questions": [
    {
      "id": "q1",
      "type": "multiple-choice",
      "text": "What is 2+2?",
      "options": [
        {
          "id": "a",
          "text": "3",
          "isCorrect": false,
          "value": 0
        },
        {
          "id": "b",
          "text": "4",
          "isCorrect": true,
          "value": 1
        },
        {
          "id": "c",
          "text": "5",
          "isCorrect": false,
          "value": 0
        }
      ]
    }
  ]
}`}
                  </pre>
                </div>
              </div>
            </SimpleModal>
          </div>

          <div className="absolute top-4 right-4">
            <SimpleModal
              trigger={
                <Button variant="ghost" size="icon" title="Settings">
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Settings</span>
                </Button>
              }
              title="Quiz Settings"
            >
              <div className="space-y-6 text-left">
                {/* Timer Settings */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-left">Timer</h3>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="timer-toggle" className="flex flex-col space-y-1 text-left">
                      <span>Enable timer</span>
                      <span className="font-normal text-xs text-muted-foreground">
                        Set a time limit for each question
                      </span>
                    </Label>
                    <Switch id="timer-toggle" checked={timerEnabled} onCheckedChange={setTimerEnabled} />
                  </div>
                  {timerEnabled && (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="timer-duration" className="text-left">
                          Duration (seconds)
                        </Label>
                        <span className="text-sm">{timerDuration}s</span>
                      </div>
                      <Slider
                        id="timer-duration"
                        min={5}
                        max={120}
                        step={5}
                        value={[timerDuration]}
                        onValueChange={(value) => setTimerDuration(value[0])}
                      />
                    </div>
                  )}
                </div>

                {/* Shuffle Settings */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-left">Randomization</h3>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="shuffle-questions" className="flex flex-col space-y-1 text-left">
                      <span>Shuffle questions</span>
                      <span className="font-normal text-xs text-muted-foreground">
                        Randomize the order of questions
                      </span>
                    </Label>
                    <Switch
                      id="shuffle-questions"
                      checked={shuffleQuestionsEnabled}
                      onCheckedChange={setShuffleQuestionsEnabled}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="shuffle-options" className="flex flex-col space-y-1 text-left">
                      <span>Shuffle options</span>
                      <span className="font-normal text-xs text-muted-foreground">
                        Randomize the order of answer options
                      </span>
                    </Label>
                    <Switch
                      id="shuffle-options"
                      checked={shuffleOptionsEnabled}
                      onCheckedChange={setShuffleOptionsEnabled}
                    />
                  </div>
                </div>

                {/* Theme Settings */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-left">Appearance</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <div
                      className={`flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                        theme === "light" ? "border-primary" : ""
                      }`}
                      onClick={() => setTheme("light")}
                    >
                      <Sun className="h-5 w-5 mb-2" />
                      <span className="text-xs">Light</span>
                    </div>
                    <div
                      className={`flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                        theme === "dark" ? "border-primary" : ""
                      }`}
                      onClick={() => setTheme("dark")}
                    >
                      <Moon className="h-5 w-5 mb-2" />
                      <span className="text-xs">Dark</span>
                    </div>
                    <div
                      className={`flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                        theme === "system" ? "border-primary" : ""
                      }`}
                      onClick={() => setTheme("system")}
                    >
                      <Laptop className="h-5 w-5 mb-2" />
                      <span className="text-xs">System</span>
                    </div>
                  </div>
                </div>
              </div>
            </SimpleModal>
          </div>
        </div>

        <Tabs defaultValue="file" onValueChange={(value) => setInputMode(value as "file" | "text")}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="file">Upload file</TabsTrigger>
            <TabsTrigger value="text">Paste JSON</TabsTrigger>
          </TabsList>

          <TabsContent value="file">
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
                Select file
              </label>
            </div>
          </TabsContent>

          <TabsContent value="text">
            <div className="space-y-4">
              <div className="border rounded-lg p-4 relative">
                <textarea
                  className="w-full h-64 p-2 text-sm font-mono bg-muted/30 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder='Paste your JSON here... Example: {"title": "My Quiz", "questions": [...]}'
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                />
                <div className="absolute top-2 right-2">
                  <SimpleModal
                    trigger={
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <InfoIcon className="h-4 w-4" />
                        <span className="sr-only">JSON Format Help</span>
                      </Button>
                    }
                    title="JSON Format Example"
                  >
                    <div className="space-y-4 text-left">
                      <p className="text-sm text-muted-foreground">Your quiz JSON should follow this structure:</p>
                      <pre className="bg-muted p-4 rounded-md text-xs overflow-auto">
                        {`{
  "id": "quiz-1",
  "title": "Sample Quiz",
  "description": "A sample quiz to demonstrate the format",
  "tags": ["sample", "demo"],
  "questions": [
    {
      "id": "q1",
      "type": "multiple-choice",
      "text": "What is 2+2?",
      "options": [
        {
          "id": "a",
          "text": "3",
          "isCorrect": false,
          "value": 0
        },
        {
          "id": "b",
          "text": "4",
          "isCorrect": true,
          "value": 1
        },
        {
          "id": "c",
          "text": "5",
          "isCorrect": false,
          "value": 0
        }
      ]
    }
  ]
}`}
                      </pre>
                    </div>
                  </SimpleModal>
                </div>
              </div>
              {jsonError && (
                <div className="text-red-500 text-sm p-2 bg-red-50 dark:bg-red-950/30 rounded-md">{jsonError}</div>
              )}
              <div className="flex space-x-2">
                <Button onClick={handleJsonTextSubmit} className="w-full" disabled={!jsonText.trim() || isLoading}>
                  {isLoading ? "Loading..." : "Load JSON"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {hasLastQuiz && (
          <div className="mt-6 flex justify-center">
            <Button
              variant="outline"
              onClick={loadLastQuiz}
              className="group relative overflow-hidden rounded-lg border px-4 py-2 shadow-sm transition-all hover:shadow-md"
              disabled={isLoading}
            >
              <span className="relative z-10 flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                <span>{isLoading ? "Loading..." : "Load last used quiz"}</span>
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></span>
            </Button>
          </div>
        )}
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
              <span className="sr-only">Restart Quiz</span>
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
              <Button variant="outline" size="icon" onClick={handleReshuffleQuestions} title="Restart quiz">
                <RotateCcw className="h-4 w-4" />
                <span className="sr-only">Restart</span>
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
            {/* Timer toggle */}
            {timerEnabled && timeLeft !== null && (
              <div className="flex items-center justify-end mb-2 space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className={`text-sm font-medium ${timeLeft < 10 ? "text-red-500 animate-pulse" : ""}`}>
                  {timeLeft}s
                </span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                Question {currentQuestionIndex + 1} of {shuffledQuestions.length}
              </span>
              <span className="text-sm font-medium">
                Score: {score}/{currentQuestionIndex + (isAnswerSubmitted ? 1 : 0)}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>

        {/* Question content */}
        <div className="px-5 sm:px-8 py-5">
          <div
            className={`space-y-5 transition-opacity duration-300 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
            style={{
              transform: isTransitioning ? `translateX(${direction * 20}px)` : "translateX(0)",
              transition: "transform 300ms, opacity 300ms",
            }}
          >
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
            disabled={currentQuestionIndex === 0 || isTransitioning}
            className="w-full sm:w-auto"
            variant="outline"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>

          {!isAnswerSubmitted ? (
            <Button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null || isTransitioning}
              className="w-full sm:w-auto"
            >
              Submit Answer
            </Button>
          ) : (
            <Button
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === shuffledQuestions.length - 1 || isTransitioning}
              className="w-full sm:w-auto"
            >
              Next Question
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>

        {currentQuestionIndex === shuffledQuestions.length - 1 && isAnswerSubmitted && (
          <div className="flex justify-center p-4">
            <Button onClick={handleShowSummary} variant="outline">
              View Summary
            </Button>
          </div>
        )}
      </div>

      {/* Summary Modal */}
      {showSummary && (
        <QuizSummary
          title={quizData.title}
          description={quizData.description || ""}
          questions={shuffledQuestions}
          answerHistory={answerHistory}
          score={score}
          onClose={() => setShowSummary(false)}
          onRetry={handleReshuffleQuestions}
        />
      )}
    </div>
  )
}
