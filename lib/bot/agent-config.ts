import { agentsData } from "./utils"

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL
const BACKEND_ENDPOINTS_ACCESS_TOKEN = process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN

const CONFIG_TTL_MS = 5 * 60 * 1000 // 5 minutes

// Matches GET /api/v1/agents/{agentId}/bot-config -> data
export interface AgentBotConfig {
  agentId: number
  name: string | null
  adminIds: string | null // CSV string of Telegram user IDs
  logoName: string | null
  supportContact: string | null
  supportUsername: string | null
  supportChannel: string | null
  bankDetails: Record<string, any> | null
  hideName: boolean
}

const cache = new Map<number, { config: AgentBotConfig; fetchedAt: number }>()

function fromLegacy(agentId: number): AgentBotConfig | null {
  const legacy = agentsData[agentId]
  if (!legacy) return null
  return {
    agentId,
    name: legacy.name ?? null,
    adminIds: legacy.adminIds ?? null,
    logoName: legacy.logoName ?? null,
    supportContact: legacy.supportContact ?? null,
    supportUsername: legacy.supportUsername ?? null,
    supportChannel: legacy.supportChannel ?? null,
    bankDetails: legacy.bankDetails ?? null,
    hideName: legacy.hideName === true,
  }
}

/**
 * Fetch the agent's bot config from the backend with a short-lived cache.
 *
 * Fallback order (never throws):
 *   fresh cache -> backend -> stale cache -> hardcoded agentsData -> null
 */
export async function getAgentConfig(agentId: number): Promise<AgentBotConfig | null> {
  const cached = cache.get(agentId)
  if (cached && Date.now() - cached.fetchedAt < CONFIG_TTL_MS) {
    return cached.config
  }

  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/v1/agents/${agentId}/bot-config`, {
      headers: {
        "Content-Type": "application/json",
        "X-Access-Token": BACKEND_ENDPOINTS_ACCESS_TOKEN ?? "",
      },
      cache: "no-store",
    })

    if (res.ok) {
      const json = await res.json()
      if (json?.success && json.data) {
        const config = json.data as AgentBotConfig
        cache.set(agentId, { config, fetchedAt: Date.now() })
        return config
      }
    } else if (res.status !== 404) {
      console.warn(`[Agent Config] Backend returned ${res.status} for agent ${agentId}`)
    }
    // 404 means no config row — fall through to fallbacks, retried after TTL
  } catch (err) {
    console.error(`[Agent Config] Fetch failed for agent ${agentId}:`, err)
  }

  if (cached) return cached.config // serve stale rather than failing the bot flow

  const fallback = fromLegacy(agentId)
  if (fallback) {
    cache.set(agentId, { config: fallback, fetchedAt: Date.now() })
    return fallback
  }

  return null
}

/** Warm the config cache at startup so the first messages don't hit the backend. */
export async function prefetchAgentConfigs(agentIds: number[]): Promise<void> {
  await Promise.allSettled(agentIds.map((id) => getAgentConfig(id)))
}
