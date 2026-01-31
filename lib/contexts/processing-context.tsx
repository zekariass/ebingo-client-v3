// lib/context/ProcessingContext.tsx
'use client'

import { createContext, useContext, useState, ReactNode } from "react"

interface ProcessingContextType {
  processing: boolean
  message: string
  startProcessing: (message?: string) => void
  stopProcessing: () => void
}

const ProcessingContext = createContext<ProcessingContextType | undefined>(undefined)

export const ProcessingProvider = ({ children }: { children: ReactNode }) => {
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState("Processing...")

  const startProcessing = (msg?: string) => {
    if (msg) setMessage(msg)
    setProcessing(true)
  }

  const stopProcessing = () => setProcessing(false)

  return (
    <ProcessingContext.Provider value={{ processing, message, startProcessing, stopProcessing }}>
      {children}
    </ProcessingContext.Provider>
  )
}

export const useProcessing = () => {
  const context = useContext(ProcessingContext)
  if (!context) throw new Error("useProcessing must be used within ProcessingProvider")
  return context
}
