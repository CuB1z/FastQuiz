"use client"

import type React from "react"
import { ThemeToggle } from "./theme-toggle"

export function ThemeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative">
      {/* Cambiamos la posición del botón para que no se superponga */}
      <div className="fixed bottom-4 right-4 z-50">
        <ThemeToggle />
      </div>
      {children}
    </div>
  )
}
