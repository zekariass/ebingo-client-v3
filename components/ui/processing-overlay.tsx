'use client'

interface Props {
  show: boolean
  message?: string
}

export default function ProcessingOverlay({ show, message }: Props) {
  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mb-4" />
      {message && <p className="text-white text-lg">{message}</p>}
    </div>
  )
}
