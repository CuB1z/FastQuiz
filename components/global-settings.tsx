"use client"
import { QuizSettings } from "./quiz-settings"
import { useSettings } from "./settings-provider"
import { useTheme } from "next-themes"

export function GlobalSettings() {
  const { theme, setTheme } = useTheme()
  const {
    timerEnabled,
    setTimerEnabled,
    timerDuration,
    setTimerDuration,
    shuffleQuestions,
    setShuffleQuestions,
    shuffleOptions,
    setShuffleOptions,
  } = useSettings()

  return (
    <QuizSettings
      timerEnabled={timerEnabled}
      setTimerEnabled={setTimerEnabled}
      timerDuration={timerDuration}
      setTimerDuration={setTimerDuration}
      shuffleQuestions={shuffleQuestions}
      setShuffleQuestions={setShuffleQuestions}
      shuffleOptions={shuffleOptions}
      setShuffleOptions={setShuffleOptions}
      theme={theme || "system"}
      setTheme={setTheme}
    />
  )
}
