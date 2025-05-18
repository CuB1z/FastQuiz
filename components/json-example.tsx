"use client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { HelpCircle } from "lucide-react"
import { useState } from "react"

export function JsonExample() {
  const [isOpen, setIsOpen] = useState(false)

  const exampleJson = `{
  "title": "Example Quiz",
  "description": "An example quiz to show the JSON format",
  "tags": ["example", "demo", "tutorial"],
  "questions": [
    {
      "id": "q1",
      "type": "multiple-choice",
      "text": "What is the capital of France?",
      "options": [
        {
          "id": "a",
          "text": "London",
          "isCorrect": false,
          "value": 0
        },
        {
          "id": "b",
          "text": "Paris",
          "isCorrect": true,
          "value": 1
        },
        {
          "id": "c",
          "text": "Berlin",
          "isCorrect": false,
          "value": 0
        },
        {
          "id": "d",
          "text": "Madrid",
          "isCorrect": false,
          "value": 0
        }
      ]
    },
    {
      "id": "q2",
      "type": "multiple-choice",
      "text": "Which of these is NOT a programming language?",
      "options": [
        {
          "id": "a",
          "text": "Python",
          "isCorrect": false,
          "value": 0
        },
        {
          "id": "b",
          "text": "Java",
          "isCorrect": false,
          "value": 0
        },
        {
          "id": "c",
          "text": "HTML",
          "isCorrect": true,
          "value": 1
        },
        {
          "id": "d",
          "text": "Rust",
          "isCorrect": false,
          "value": 0
        }
      ]
    }
  ]
}`

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <HelpCircle className="h-4 w-4" />
          <span className="sr-only">View JSON example</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>JSON Format Example</DialogTitle>
        </DialogHeader>
        <div className="mt-4 bg-muted p-4 rounded-md overflow-auto max-h-[60vh]">
          <pre className="text-xs font-mono whitespace-pre-wrap">{exampleJson}</pre>
        </div>
        <div className="text-sm text-muted-foreground mt-2">
          <p>
            Copy this example and modify it according to your needs. Make sure each question has a unique ID and only
            one option per question has <code>isCorrect: true</code>.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
