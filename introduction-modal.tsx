"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { HelpCircle, X } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

const JSON_EXAMPLE = `{
  "id": "unique-quiz-id",
  "title": "Quiz Title",
  "description": "Quiz Description",
  "tags": ["tag1", "tag2"],
  "questions": [
    {
      "id": "q1",
      "type": "multiple",
      "text": "Question text",
      "options": [
        {
          "id": "o1",
          "text": "Option text",
          "isCorrect": true,
          "value": 1
        },
        // ... more options
      ]
    },
    // ... more questions
  ]
}`

export function IntroductionModal() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button variant="outline" className="flex items-center gap-2" onClick={() => setIsOpen(true)}>
        <HelpCircle className="h-4 w-4" />
        How to Use
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center text-left p-0 sm:p-4">
          <div className="bg-background w-full h-full sm:h-auto sm:max-h-[90vh] sm:w-auto sm:max-w-md sm:rounded-lg relative overflow-hidden">
            <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b bg-background/80 backdrop-blur-sm">
              <h2 className="text-lg font-semibold">Welcome to the Quiz App!</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>

            <div className="p-5">
              <p className="text-sm text-muted-foreground mb-5">
                This app allows you to load and take quizzes from a JSON file. Follow the instructions below to get
                started.
              </p>

              <ScrollArea className="h-[calc(100vh-12rem)] sm:h-[60vh] pr-4">
                <div className="space-y-8">
                  <div>
                    <h3 className="text-base font-semibold mb-3">JSON Format</h3>
                    <p className="text-sm text-muted-foreground mb-3">Your JSON file should follow this structure:</p>
                    <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto">
                      {JSON_EXAMPLE}
                    </pre>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold mb-3">How to Use</h3>
                    <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-3">
                      <li>Prepare your JSON file according to the format above.</li>
                      <li>
                        Click the "Select a file" button or drag and drop your JSON file into the designated area.
                      </li>
                      <li>Once loaded, the quiz will start automatically.</li>
                      <li>Answer each question and submit your answer.</li>
                      <li>Navigate through questions using the "Previous" and "Next" buttons.</li>
                      <li>Your score will be displayed at the top of the quiz.</li>
                      <li>Use the theme toggle in the top right to switch between light and dark mode.</li>
                    </ol>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
