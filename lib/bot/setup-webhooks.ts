import { Telegraf } from "telegraf";
import { agentsData } from "./utils";

/* ======================================================
   Environment variables (SERVER ONLY)
====================================================== */

const APP_URL = process.env.APP_URL;
const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL;
const DEFAULT_LOCALE = process.env.DEFAULT_LOCALE ?? "en";
const BACKEND_ENDPOINTS_ACCESS_TOKEN = process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN;

if (!APP_URL) console.warn("[Webhook Setup] APP_URL is not defined");
if (!BACKEND_BASE_URL) console.warn("[Webhook Setup] BACKEND_BASE_URL is not defined");
if (!BACKEND_ENDPOINTS_ACCESS_TOKEN) console.warn("[Webhook Setup] BACKEND_ENDPOINTS_ACCESS_TOKEN is not defined");

/* ======================================================
   Telegram commands
====================================================== */

export const BASE_COMMANDS = [
  { command: "register", description: "📋 Register | ተመዝገብ" },
  { command: "start", description: "🎮 Show Menu | ሜኑ አሳይ" },
  { command: "deposit", description: "💰 Deposit Fund | ገንዘብ አስቀምጥ" },
  { command: "withdraw", description: "💸 Withdraw Money | ገንዘብ አውጣ" },
  { command: "gamerooms", description: "🎲 Game Rooms | የጨዋታ ክፍሎች" },
  { command: "language", description: "🌐 Change Language | ቋንቋ ቀይር" },
  { command: "webview", description: "🌐 Web View | ድረገጽ" },
  { command: "wallet", description: "💰 Check Balance | ቀሪ ገንዘብ" },
  { command: "transfer", description: "🔁 Transfer To A Friend | ለጓደኛ ገንዘብ ላክ" },
  { command: "invite", description: "🔗 Invite A Friend | ጓደኛ ይጋብዙ" },
  { command: "instructions", description: "📖 Instructions | የጨዋታ መመሪያዎች" },
  { command: "support", description: "🧑‍💻 Support | ድጋፍ ያግኙ" },
];

export const ADMIN_COMMANDS = [
  ...BASE_COMMANDS,
  { command: "broadcast", description: "📡 Broadcast message (Admin)" },
  { command: "cancel", description: "❌ Cancel broadcast (Admin)" },
];

/* ======================================================
   Types
====================================================== */

interface Agent {
  id: string;      // e.g. "1", "2"
  botToken: string;
}

/* ======================================================
   Helpers
====================================================== */

function parseAdminIds(raw: string): number[] {
  return (raw || "")
    .split(",")
    .map((x) => Number(String(x).trim()))
    .filter((n) => Number.isFinite(n));
}

function getAdminsForAgentId(agentIdFromBackend: string): number[] {
  const numericId = Number(agentIdFromBackend);
  if (!Number.isFinite(numericId)) {
    console.warn(
      `[Webhook Setup] agent.id="${agentIdFromBackend}" is not numeric. Cannot read admins from agentsData.`
    );
    return [];
  }

  const raw = agentsData[numericId]?.adminIds || "";
  return parseAdminIds(raw);
}

/* ======================================================
   Option A runtime helper (CALL THIS IN YOUR BOT HANDLERS)
====================================================== */

/**
 * Enable admin commands when the admin starts the bot.
 * This avoids "chat not found" because the chat exists after /start.
 *
 * IMPORTANT:
 * Call this once when you bootstrap your bot for that agent:
 *   enableAdminCommandsOnStart(bot, agentId)
 */
export function enableAdminCommandsOnStart(bot: Telegraf, agentId: number) {
  const adminIds = parseAdminIds(agentsData[agentId]?.adminIds || "");

  bot.start(async (ctx: any) => {
    const uid = ctx.from?.id;
    if (!uid) return;

    if (adminIds.includes(uid)) {
      try {
        await ctx.telegram.setMyCommands(ADMIN_COMMANDS, {
          scope: { type: "chat", chat_id: uid },
        });
      } catch (e) {
        console.error(`[Admin Commands] Failed to set admin commands for agent ${agentId} admin ${uid}`, e);
      }
    }
  });
}

/* ======================================================
   Fetch active agents (SECURE INTERNAL API)
====================================================== */

async function fetchActiveAgents(): Promise<Agent[]> {
  if (!BACKEND_BASE_URL) {
    console.warn("[Webhook Setup] BACKEND_BASE_URL missing, skipping agent fetch");
    return [];
  }

  try {
    const response = await fetch(`${BACKEND_BASE_URL}/api/v1/agents/active`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.INTERNAL_API_KEY ?? ""}`,
        "X-Access-Token": BACKEND_ENDPOINTS_ACCESS_TOKEN ?? "",
      },
    });

    if (!response.ok) {
      console.error("[Webhook Setup] Failed to fetch agents:", response.status);
      return [];
    }

    const data = await response.json();

    if (!Array.isArray(data.data)) {
      console.error("[Webhook Setup] Invalid agent response format");
      return [];
    }

    return data.data as Agent[];
  } catch (err) {
    console.error("[Webhook Setup] Error fetching agents:", err);
    return [];
  }
}

/* ======================================================
   Setup webhook + base commands for ONE agent
====================================================== */

async function setupAgentWebhook(agent: Agent): Promise<boolean> {
  const { id, botToken } = agent;

  if (!botToken) {
    console.warn(`[Webhook Setup] Missing bot token for agent ${id}`);
    return false;
  }

  if (!APP_URL) {
    console.warn("[Webhook Setup] APP_URL missing, cannot set webhook");
    return false;
  }

  const bot = new Telegraf(botToken);
  const webhookUrl = `${APP_URL}/${DEFAULT_LOCALE}/api/telegram/webhook/${id}`;

  try {
    // Webhook
    await bot.telegram.setWebhook(webhookUrl, {
      allowed_updates: ["message", "callback_query"],
      drop_pending_updates: true,
    });

    // Everyone sees base commands
    await bot.telegram.setMyCommands(BASE_COMMANDS);

    // Best-effort: pre-set admin commands for admins who have already started the bot
    const adminIds = getAdminsForAgentId(id);

    for (const adminId of adminIds) {
      try {
        await bot.telegram.setMyCommands(ADMIN_COMMANDS, {
          scope: { type: "chat", chat_id: adminId },
        });
      } catch (err: any) {
        const desc = String(err?.description || err?.response?.description || err?.message || "");
        if (desc.toLowerCase().includes("chat not found")) {
          console.warn(
            `[Webhook Setup] Agent ${id}: admin ${adminId} has not started this bot yet. Skipping admin commands.`
          );
          continue;
        }
        throw err;
      }
    }

    console.info(`[Webhook Setup] Bot configured successfully for agent ${id}`);
    return true;
  } catch (err) {
    console.error(`[Webhook Setup] Failed to configure bot for agent ${id}`, err);
    return false;
  }
}

/* ======================================================
   Setup ALL agent webhooks (SAFE ENTRY POINT)
====================================================== */

export async function setupAllAgentWebhooks(): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    console.info("[Webhook Setup] Skipping webhook setup (not production)");
    return;
  }

  console.info("[Webhook Setup] Starting webhook configuration...");

  const agents = await fetchActiveAgents();

  if (agents.length === 0) {
    console.info("[Webhook Setup] No active agents found");
    return;
  }

  console.info(`[Webhook Setup] Found ${agents.length} active agent(s)`);

  const results = await Promise.allSettled(agents.map((a) => setupAgentWebhook(a)));

  const success = results.filter((r) => r.status === "fulfilled" && r.value === true).length;
  const failed = results.length - success;

  console.info(`[Webhook Setup] Completed — Success: ${success}, Failed: ${failed}`);
}

/* ======================================================
   Setup SINGLE agent webhook (admin-triggered)
====================================================== */

export async function setupSingleAgentWebhook(agentId: string, botToken: string): Promise<boolean> {
  return setupAgentWebhook({ id: agentId, botToken });
}
