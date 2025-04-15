"use client"

import { useState, useEffect, useCallback } from "react"

interface SpeechRecognitionResult {
  transcript: string
  isFinal: boolean
}

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [isSupported, setIsSupported] = useState(true)

  // Reference to the SpeechRecognition instance
  const recognitionRef = useCallback(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = "en-US"
        return recognition
      }
    }
    return null
  }, [])

  useEffect(() => {
    // Check if speech recognition is supported
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SpeechRecognition) {
        setIsSupported(false)
      }
    }
  }, [])

  const startListening = useCallback(() => {
    const recognition = recognitionRef()
    if (!recognition) {
      console.error("Speech recognition not supported")
      return
    }

    // Clear previous transcript
    setTranscript("")

    recognition.onresult = (event: any) => {
      let interimTranscript = ""
      let finalTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      setTranscript(finalTranscript || interimTranscript)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error)
      setIsListening(false)
    }

    recognition.start()
    setIsListening(true)
  }, [recognitionRef])

  const stopListening = useCallback(() => {
    const recognition = recognitionRef()
    if (recognition) {
      recognition.stop()
      setIsListening(false)
    }
  }, [recognitionRef])

  const resetTranscript = useCallback(() => {
    setTranscript("")
  }, [])

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
  }
}
