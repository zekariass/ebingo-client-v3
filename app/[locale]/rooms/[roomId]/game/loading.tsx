
export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
      <div className="text-sm text-muted-foreground">Loading game...</div>
    </div>
  )
}
