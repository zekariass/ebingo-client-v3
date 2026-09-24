
import type { Telegraf, Context } from "telegraf";
import { escapeTelegramHtml } from "../utils";
import { getAgentConfig } from "../agent-config";

const API_BASE_URL = process.env.BACKEND_BASE_URL!;
const BACKEND_ENDPOINTS_ACCESS_TOKEN = process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN;

// Track admins waiting to send broadcast and the prompt message id
// Keyed by `${agentId}:${adminTelegramId}`
const pendingPrompts = new Map<string, number>();

function makeKey(agentId: number, adminId: number) {
  return `${agentId}:${adminId}`;
}

// function escapeTelegramHtml(value: unknown) {
//   // Escape dynamic values if you ever inject into HTML templates
//   return String(value)
//     .replaceAll("&", "&amp;")
//     .replaceAll("<", "&lt;")
//     .replaceAll(">", "&gt;");
// }

export function registerBroadcastHandler(bot: Telegraf<Context>, agentId: number) {
  // Resolved per-call via the cached config so admin changes apply without restart
  async function isAdmin(userId: number): Promise<boolean> {
    const config = await getAgentConfig(agentId);
    const adminIds = (config?.adminIds || "")
      .split(",")
      .map((id: string) => id.trim())
      .filter((id: string) => id !== "")
      .map((id: string) => Number(id))
      .filter((n: number) => Number.isFinite(n) && n > 0);
    return adminIds.includes(userId);
  }

  // Helper: agent-scoped user ids
  async function getAgentUserIds(adminTelegramId: number): Promise<number[]> {
    // Option A (recommended): backend fetch scoped by agentId
    // Change the endpoint/query to match your backend.
    const url =
      `${API_BASE_URL}/api/v1/secured/user-profile/user-telegram-ids` +
      `?adminTelegramId=${adminTelegramId}&agentId=${agentId}`;

    const res = await fetch(url, {
      headers: {
        "X-Access-Token": BACKEND_ENDPOINTS_ACCESS_TOKEN ?? "",
      },
    });
    if (!res.ok) throw new Error(`Backend error: ${res.status}`);

    const json = await res.json();
    const ids: number[] = json.data?.ids || [];
    return ids;

    // Option B (if you store users locally per agent):
    // return (agentsData[agentId]?.userIds || []).map((x: any) => Number(x)).filter(Number.isFinite);
  }

  bot.command("broadcast", async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId || !(await isAdmin(userId))) {
      return ctx.reply("🚫 You are not authorized.");
    }

    const key = makeKey(agentId, userId);

    if (pendingPrompts.has(key)) {
      return ctx.reply(
        "⚠️ You already have a broadcast in progress for this agent. Reply to the prompt or type /cancel."
      );
    }

    const prompt = await ctx.reply(
      `✉️ <b>Agent ${escapeTelegramHtml(agentId)}</b> broadcast\n\n` +
        "Reply to this message with what you want to broadcast.\n" +
        "You can send:\n" +
        "• Text message\n" +
        "• Image with caption\n\n" +
        "To cancel, type /cancel or reply <code>cancel</code> to this message.",
      {
        parse_mode: "HTML",
        reply_markup: {
          force_reply: true,
          selective: true,
        },
      }
    );

    pendingPrompts.set(key, prompt.message_id);
  });

  bot.command("cancel", async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    const key = makeKey(agentId, userId);

    if (pendingPrompts.has(key)) {
      pendingPrompts.delete(key);
      return ctx.reply("❌ Broadcast cancelled.");
    }
    return ctx.reply("ℹ️ No broadcast in progress.");
  });

  bot.on("message", async (ctx, next) => {
    try {
      const adminId = ctx.from?.id;
      if (!adminId) return next();

      // Only handle admins for this agent
      if (!(await isAdmin(adminId))) return next();

      const key = makeKey(agentId, adminId);
      if (!pendingPrompts.has(key)) return next();

      const expectedPromptId = pendingPrompts.get(key);
      const msg = ctx.message;
      if (!msg) return next();

      const replyTo = (msg as any).reply_to_message;
      if (!replyTo || replyTo.message_id !== expectedPromptId) return next();

      // Cancel check
      if ("text" in msg && msg.text?.trim().toLowerCase() === "cancel") {
        pendingPrompts.delete(key);
        return ctx.reply("❌ Broadcast cancelled.");
      }

      // End the "waiting" state as soon as we accept the reply
      pendingPrompts.delete(key);

      // Determine message type
      let sendType: "text" | "photo" = "text";
      let text = "";
      let photoFileId: string | undefined;

      if ("text" in msg && msg.text) {
        sendType = "text";
        text = msg.text;
      } else if ("photo" in msg && msg.photo?.length) {
        sendType = "photo";
        const photo = msg.photo[msg.photo.length - 1];
        photoFileId = photo.file_id;
        text = msg.caption || "";
      } else {
        return ctx.reply("⚠️ Unsupported message type. Please reply with text or a photo with caption.");
      }

      await ctx.reply(`📡 Sending to <b>Agent ${escapeTelegramHtml(agentId)}</b> users...`, {
        parse_mode: "HTML",
      });

      // Fetch agent user IDs
      let userIds: number[] = [];
      try {
        userIds = await getAgentUserIds(adminId);
      } catch (e: any) {
        console.error("getAgentUserIds failed:", e);
        return ctx.reply(`❌ Failed to load users for this agent.`);
      }

      userIds = [...new Set(userIds)];
      if (!userIds.length) return ctx.reply("⚠️ No users found to broadcast.");

      await ctx.reply(`👥 Found ${userIds.length} users. Broadcasting...`);

      let sent = 0;
      let failed = 0;
      const failedIds: number[] = [];

      // Telegram allows roughly 30 msgs/sec to different users for bulk sends.
      // Pace sends conservatively and honor retry_after on 429 responses.
      const PACE_MS = 40;
      let useHtml = true;

      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

      async function sendTo(id: number) {
        const html = useHtml ? ({ parse_mode: "HTML" } as const) : {};
        return sendType === "text"
          ? bot.telegram.sendMessage(id, text, html)
          : bot.telegram.sendPhoto(id, photoFileId as string, { caption: text, ...html });
      }

      async function retrySend(fn: () => Promise<any>, retries = 5) {
        let backoff = 500;
        for (let i = 0; i < retries; i++) {
          try {
            return await fn();
          } catch (err: any) {
            const retryAfterSec = err?.response?.parameters?.retry_after;
            const isRateLimit =
              err?.code === 429 ||
              Number.isFinite(retryAfterSec) ||
              String(err?.description || err?.message || "").includes("Too Many Requests");
            if (!isRateLimit || i === retries - 1) throw err;
            await sleep(Number.isFinite(retryAfterSec) ? retryAfterSec * 1000 + 250 : backoff);
            backoff *= 2;
          }
        }
      }

      for (const id of userIds) {
        try {
          await retrySend(() => sendTo(id));
          sent++;
        } catch (err: any) {
          const desc = String(err?.response?.description || err?.description || err?.message || "");
          // If the message isn't valid HTML, drop parse_mode and resend as plain text
          if (useHtml && /can't parse entities|can't parse/i.test(desc)) {
            useHtml = false;
            try {
              await retrySend(() => sendTo(id));
              sent++;
            } catch {
              failed++;
              failedIds.push(id);
            }
            continue;
          }
          failed++;
          failedIds.push(id);
        }
        await sleep(PACE_MS);
      }

      await ctx.reply(
        `✅ Broadcast complete.\nTotal users: ${userIds.length}\nSent: ${sent}\nFailed: ${failed}`
      );
      if (failedIds.length) {
        await ctx.reply(`⚠️ Failed IDs (first 20): ${failedIds.slice(0, 20).join(", ")}`);
      }
    } catch (err) {
      console.error("Unexpected handler error:", err);
      const adminId = ctx.from?.id;
      if (adminId) pendingPrompts.delete(makeKey(agentId, adminId));
      await ctx.reply("❌ Broadcast aborted due to an internal error.");
    }
  });
}