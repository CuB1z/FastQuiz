"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Settings, Sun, Moon, Laptop } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface QuizSettingsProps {
  timerEnabled: boolean
  setTimerEnabled: (enabled: boolean) => void
  timerDuration: number
  setTimerDuration: (duration: number) => void
  shuffleQuestions: boolean
  setShuffleQuestions: (shuffle: boolean) => void
  shuffleOptions: boolean
  setShuffleOptions: (shuffle: boolean) => void
  theme: string
  setTheme: (theme: string) => void
}

export function QuizSettings({
  timerEnabled,
  setTimerEnabled,
  timerDuration,
  setTimerDuration,
  shuffleQuestions,
  setShuffleQuestions,
  shuffleOptions,
  setShuffleOptions,
  theme,
  setTheme,
}: QuizSettingsProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" title="Settings">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quiz Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Timer Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Timer</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="timer-toggle" className="flex flex-col space-y-1">
                <span>Enable timer</span>
                <span className="font-normal text-xs text-muted-foreground">Set a time limit for each question</span>
              </Label>
              <Switch id="timer-toggle" checked={timerEnabled} onCheckedChange={setTimerEnabled} />
            </div>
            {timerEnabled && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="timer-duration">Duration (seconds)</Label>
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
            <h3 className="text-sm font-medium">Randomization</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="shuffle-questions" className="flex flex-col space-y-1">
                <span>Shuffle questions</span>
                <span className="font-normal text-xs text-muted-foreground">Randomize the order of questions</span>
              </Label>
              <Switch id="shuffle-questions" checked={shuffleQuestions} onCheckedChange={setShuffleQuestions} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="shuffle-options" className="flex flex-col space-y-1">
                <span>Shuffle options</span>
                <span className="font-normal text-xs text-muted-foreground">Randomize the order of answer options</span>
              </Label>
              <Switch id="shuffle-options" checked={shuffleOptions} onCheckedChange={setShuffleOptions} />
            </div>
          </div>

          {/* Theme Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Appearance</h3>
            <RadioGroup value={theme} onValueChange={setTheme} className="grid grid-cols-3 gap-2">
              <div>
                <RadioGroupItem value="light" id="theme-light" className="sr-only" />
                <Label
                  htmlFor="theme-light"
                  className={`flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground ${
                    theme === "light" ? "border-primary" : ""
                  }`}
                >
                  <Sun className="h-5 w-5 mb-2" />
                  <span className="text-xs">Light</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="dark" id="theme-dark" className="sr-only" />
                <Label
                  htmlFor="theme-dark"
                  className={`flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground ${
                    theme === "dark" ? "border-primary" : ""
                  }`}
                >
                  <Moon className="h-5 w-5 mb-2" />
                  <span className="text-xs">Dark</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="system" id="theme-system" className="sr-only" />
                <Label
                  htmlFor="theme-system"
                  className={`flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground ${
                    theme === "system" ? "border-primary" : ""
                  }`}
                >
                  <Laptop className="h-5 w-5 mb-2" />
                  <span className="text-xs">System</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
