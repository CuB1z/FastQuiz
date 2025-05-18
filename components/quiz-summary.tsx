"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle } from "lucide-react"

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

interface QuizSummaryProps {
  title: string
  description: string
  questions: Question[]
  answerHistory: { questionId: string; correct: boolean; selectedOption: string }[]
  score: number
  onClose: () => void
  onRetry: () => void
}

export function QuizSummary({
  title,
  description,
  questions,
  answerHistory,
  score,
  onClose,
  onRetry,
}: QuizSummaryProps) {
  const percentage = Math.round((score / questions.length) * 100)

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quiz Results: {title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Score summary */}
          <div className="text-center p-6 bg-muted/50 rounded-lg">
            <h3 className="text-2xl font-bold mb-2">
              Your Score: {score} / {questions.length}
            </h3>
            <div className="text-lg font-medium mb-4">{percentage}%</div>
            <div className="text-sm text-muted-foreground">{description}</div>
          </div>

          {/* Question review */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Question Review</h3>
            {questions.map((question, index) => {
              const answer = answerHistory.find((a) => a.questionId === question.id)
              const selectedOption = answer ? question.options.find((o) => o.id === answer.selectedOption) : null
              const correctOption = question.options.find((o) => o.isCorrect)

              return (
                <div key={question.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium">
                      {index + 1}. {question.text}
                    </h4>
                    {answer?.correct ? (
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    )}
                  </div>

                  {selectedOption && (
                    <div
                      className={`p-3 rounded-md ${
                        answer?.correct
                          ? "bg-green-500/10 border border-green-500/30"
                          : "bg-red-500/10 border border-red-500/30"
                      }`}
                    >
                      <div className="text-sm font-medium mb-1">Your answer:</div>
                      <div>{selectedOption.text}</div>
                    </div>
                  )}

                  {!answer?.correct && correctOption && (
                    <div className="p-3 rounded-md bg-green-500/10 border border-green-500/30">
                      <div className="text-sm font-medium mb-1">Correct answer:</div>
                      <div>{correctOption.text}</div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={onRetry}>Try Again</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
