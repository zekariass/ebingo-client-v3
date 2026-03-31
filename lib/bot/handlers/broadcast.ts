
import type { Telegraf, Context } from "telegraf";
import { agentsData, escapeTelegramHtml } from "../utils";

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
  const adminIdsRaw = agentsData[agentId]?.adminIds || "";
  const ADMIN_IDS = adminIdsRaw
    .split(",")
    .map((id: string) => Number(id.trim()))
    .filter((n: number) => Number.isFinite(n));

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
    if (!userId || !ADMIN_IDS.includes(userId)) {
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

  bot.on("message", async (ctx) => {
    try {
      const adminId = ctx.from?.id;
      if (!adminId) return;

      // Only handle admins for this agent
      if (!ADMIN_IDS.includes(adminId)) return;

      const key = makeKey(agentId, adminId);
      if (!pendingPrompts.has(key)) return;

      const expectedPromptId = pendingPrompts.get(key);
      const msg = ctx.message;
      if (!msg) return;

      const replyTo = (msg as any).reply_to_message;
      if (!replyTo || replyTo.message_id !== expectedPromptId) return;

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

      if (!userIds.length) return ctx.reply("⚠️ No users found to broadcast.");

      let sent = 0;
      let failed = 0;
      const failedIds: number[] = [];

      const CHUNK_SIZE = 25;
      const BATCH_DELAY_MS = 120;

      function chunkArray<T>(arr: T[], size: number): T[][] {
        const chunks: T[][] = [];
        for (let i = 0; i < arr.length; i += size) {
          chunks.push(arr.slice(i, i + size));
        }
        return chunks;
      }

      async function retrySend(fn: () => Promise<any>, retries = 3, backoff = 500) {
        for (let i = 0; i < retries; i++) {
          try {
            return await fn();
          } catch (err: any) {
            const isRateLimit =
              err && (err.code === 429 || String(err.description || "").includes("Too Many Requests"));
            if (!isRateLimit || i === retries - 1) throw err;
            await new Promise((r) => setTimeout(r, backoff));
            backoff *= 2;
          }
        }
      }

      const batches = chunkArray(userIds, CHUNK_SIZE);

      for (const batch of batches) {
        const results = await Promise.allSettled(
          batch.map((id) =>
            sendType === "text"
              ? retrySend(() => bot.telegram.sendMessage(id, text, { parse_mode: "HTML" }))
              : retrySend(() =>
                  bot.telegram.sendPhoto(id, photoFileId as string, {
                    caption: text,
                    parse_mode: "HTML",
                  })
                )
          )
        );

        results.forEach((res, i) => {
          if (res.status === "fulfilled") sent++;
          else {
            failed++;
            failedIds.push(batch[i]);
          }
        });

        await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
      }

      await ctx.reply(`✅ Broadcast complete.\nSent: ${sent}\nFailed: ${failed}`);
      // If you want:
      // if (failedIds.length) await ctx.reply("⚠️ Failed IDs: " + JSON.stringify(failedIds.slice(0, 50)));
    } catch (err) {
      console.error("Unexpected handler error:", err);
      const adminId = ctx.from?.id;
      if (adminId) pendingPrompts.delete(makeKey(agentId, adminId));
      await ctx.reply("❌ Broadcast aborted due to an internal error.");
    }
  });
}