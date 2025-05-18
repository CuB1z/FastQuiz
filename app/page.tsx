"use client"

import QuizApp from "../quiz-app"
import { ThemeLayout } from "@/components/theme-layout"
import { PWARegister } from "./pwa-register"

export default function Home() {
  return (
    <ThemeLayout>
      <PWARegister />
      <QuizApp />
    </ThemeLayout>
  )
}
