"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface SettingsContextType {
  timerEnabled: boolean
  setTimerEnabled: (enabled: boolean) => void
  timerDuration: number
  setTimerDuration: (duration: number) => void
  shuffleQuestions: boolean
  setShuffleQuestions: (shuffle: boolean) => void
  shuffleOptions: boolean
  setShuffleOptions: (shuffle: boolean) => void
}

const defaultSettings: SettingsContextType = {
  timerEnabled: false,
  setTimerEnabled: () => {},
  timerDuration: 30,
  setTimerDuration: () => {},
  shuffleQuestions: true,
  setShuffleQuestions: () => {},
  shuffleOptions: true,
  setShuffleOptions: () => {},
}

const SettingsContext = createContext<SettingsContextType>(defaultSettings)

export function useSettings() {
  return useContext(SettingsContext)
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [timerEnabled, setTimerEnabled] = useState(defaultSettings.timerEnabled)
  const [timerDuration, setTimerDuration] = useState(defaultSettings.timerDuration)
  const [shuffleQuestions, setShuffleQuestions] = useState(defaultSettings.shuffleQuestions)
  const [shuffleOptions, setShuffleOptions] = useState(defaultSettings.shuffleOptions)

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("quizSettings")
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        setTimerEnabled(settings.timerEnabled ?? defaultSettings.timerEnabled)
        setTimerDuration(settings.timerDuration ?? defaultSettings.timerDuration)
        setShuffleQuestions(settings.shuffleQuestions ?? defaultSettings.shuffleQuestions)
        setShuffleOptions(settings.shuffleOptions ?? defaultSettings.shuffleOptions)
      } catch (error) {
        console.error("Error loading settings:", error)
      }
    }
  }, [])

  // Save settings to localStorage when they change
  useEffect(() => {
    const settings = {
      timerEnabled,
      timerDuration,
      shuffleQuestions,
      shuffleOptions,
    }
    localStorage.setItem("quizSettings", JSON.stringify(settings))
  }, [timerEnabled, timerDuration, shuffleQuestions, shuffleOptions])

  return (
    <SettingsContext.Provider
      value={{
        timerEnabled,
        setTimerEnabled,
        timerDuration,
        setTimerDuration,
        shuffleQuestions,
        setShuffleQuestions,
        shuffleOptions,
        setShuffleOptions,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}
