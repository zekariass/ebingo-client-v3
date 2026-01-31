'use client'

import ProcessingOverlay from "@/components/ui/processing-overlay"
import { useProcessing } from "@/lib/contexts/processing-context"
import { ReactNode } from "react"

export function LayoutContent({ children }: { children: ReactNode }) {
  const { processing, message } = useProcessing()

  return (
    <div className="min-h-screen relative">
      {children}
      <ProcessingOverlay show={processing} message={message} />
    </div>
  )
}