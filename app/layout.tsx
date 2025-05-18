import type { ReactNode } from "react"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SettingsProvider } from "@/components/settings-provider"
import { Toaster } from "@/components/ui/toaster"

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  const data = {
    title: "Fast Quiz - Load and play quizzes quickly",
    description: "Fast Quiz allows you to load and play quizzes quickly.",
    author: "CuB1z",
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>{data.title}</title>
        <meta name="description" content={data.description} />
        <meta name="author" content={data.author} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content="quiz, fast, quick, load, play" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="apple-mobile-web-app-title" content="Fast Quiz" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <link rel="icon" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.svg" type="image/x-icon" />
        <link rel="manifest" href="manifest.json" />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SettingsProvider>
            {children}
            <Toaster />
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
