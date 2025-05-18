"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { InfoIcon } from "lucide-react"

export function IntroductionModal() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <InfoIcon className="h-4 w-4" />
          <span>How it works</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to Fast Quiz</DialogTitle>
          <DialogDescription>A simple and fast quiz application</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
