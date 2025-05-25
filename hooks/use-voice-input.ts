"use client"

import { useState, useCallback } from "react"

interface VoiceInputResult {
  transcript: string
  isListening: boolean
  error: string | null
}

export function useVoiceInput() {
  const [transcript, setTranscript] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startListening = useCallback(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      setError("Speech recognition not supported in this browser")
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = "en-US"

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
    }

    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript
      setTranscript(result)
    }

    recognition.onerror = (event) => {
      setError(`Speech recognition error: ${event.error}`)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }, [])

  const stopListening = useCallback(() => {
    setIsListening(false)
  }, [])

  const clearTranscript = useCallback(() => {
    setTranscript("")
    setError(null)
  }, [])

  return {
    transcript,
    isListening,
    error,
    startListening,
    stopListening,
    clearTranscript,
  }
}
