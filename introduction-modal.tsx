import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

export function IntroductionModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">How to Use</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Welcome to the Quiz App!</DialogTitle>
          <DialogDescription>
            This app allows you to load and take quizzes from a JSON file. Follow the instructions below to get started.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="mt-4 h-[60vh] pr-4">
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-semibold mb-2">JSON Format</h3>
              <p className="text-sm text-gray-600 mb-2">
                Your JSON file should follow this structure:
              </p>
              <pre className="bg-gray-100 p-2 rounded-md text-xs overflow-x-auto">
{`{
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
}`}
              </pre>
            </div>
            <div>
              <h3 className="text-base font-semibold mb-2">How to Use</h3>
              <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                <li>Prepare your JSON file according to the format above.</li>
                <li>Click the "Select a file" button or drag and drop your JSON file into the designated area.</li>
                <li>Once loaded, the quiz will start automatically.</li>
                <li>Answer each question and submit your answer.</li>
                <li>Navigate through questions using the "Previous" and "Next" buttons.</li>
                <li>Your score will be displayed at the top of the quiz.</li>
              </ol>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

