export async function register() {
  // Only run on server startup, not during build
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { setupAllAgentWebhooks } = await import("@/lib/bot/setup-webhooks")
    await setupAllAgentWebhooks()
  }
}
