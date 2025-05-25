"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark" | "system"
type ColorScheme = "blue" | "green" | "purple" | "orange" | "red"

interface ThemeContextType {
  theme: Theme
  colorScheme: ColorScheme
  setTheme: (theme: Theme) => void
  setColorScheme: (scheme: ColorScheme) => void
  actualTheme: "light" | "dark"
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("system")
  const [colorScheme, setColorScheme] = useState<ColorScheme>("blue")
  const [actualTheme, setActualTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    // Load saved preferences
    const savedTheme = localStorage.getItem("theme") as Theme
    const savedColorScheme = localStorage.getItem("colorScheme") as ColorScheme

    if (savedTheme) setTheme(savedTheme)
    if (savedColorScheme) setColorScheme(savedColorScheme)
  }, [])

  useEffect(() => {
    // Apply theme
    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    let effectiveTheme: "light" | "dark"

    if (theme === "system") {
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    } else {
      effectiveTheme = theme
    }

    root.classList.add(effectiveTheme)
    setActualTheme(effectiveTheme)

    // Apply color scheme
    root.classList.remove("theme-blue", "theme-green", "theme-purple", "theme-orange", "theme-red")
    root.classList.add(`theme-${colorScheme}`)

    // Save preferences
    localStorage.setItem("theme", theme)
    localStorage.setItem("colorScheme", colorScheme)
  }, [theme, colorScheme])

  return (
    <ThemeContext.Provider value={{ theme, colorScheme, setTheme, setColorScheme, actualTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
