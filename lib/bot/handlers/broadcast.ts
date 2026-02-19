// import type { Telegraf } from "telegraf"
// import { agentsData } from "../utils"

// export function registerBroadcastHandler(bot: Telegraf, agentId: number) {
//   const ADMIN_IDS = (agentsData[agentId]?.adminIds || "").split(",").map((id: string) => Number(id))

//   bot.command("broadcast", async (ctx: any) => {
//     const userId = ctx.from?.id
//     if (!userId || !ADMIN_IDS.includes(userId)) {
//       return ctx.reply("⛔ You are not authorized to use this command.")
//     }

//     await ctx.reply("📡 Broadcast feature for agent: " + agentId)
//     // Implementation for agent-scoped broadcast
//   })
// }



// import type { Telegraf, Context } from "telegraf";
// import { agentsData, escapeTelegramHtml } from "../utils";

// const API_BASE_URL = process.env.BACKEND_BASE_URL!;

// // Track admins waiting to send broadcast and the prompt message id
// // Keyed by `${agentId}:${adminTelegramId}`
// const pendingPrompts = new Map<string, number>();

// function makeKey(agentId: number, adminId: number) {
//   return `${agentId}:${adminId}`;
// }

// // function escapeTelegramHtml(value: unknown) {
// //   // Escape dynamic values if you ever inject into HTML templates
// //   return String(value)
// //     .replaceAll("&", "&amp;")
// //     .replaceAll("<", "&lt;")
// //     .replaceAll(">", "&gt;");
// // }

// export function registerBroadcastHandler(bot: Telegraf<Context>, agentId: number) {
//   const adminIdsRaw = agentsData[agentId]?.adminIds || "";
//   const ADMIN_IDS = adminIdsRaw
//     .split(",")
//     .map((id: string) => Number(id.trim()))
//     .filter((n: number) => Number.isFinite(n));

//   // Helper: agent-scoped user ids
//   async function getAgentUserIds(adminTelegramId: number): Promise<number[]> {
//     // Option A (recommended): backend fetch scoped by agentId
//     // Change the endpoint/query to match your backend.
//     const url =
//       `${API_BASE_URL}/api/v1/secured/user-profile/user-telegram-ids` +
//       `?adminTelegramId=${adminTelegramId}&agentId=${agentId}`;

//     const res = await fetch(url);
//     if (!res.ok) throw new Error(`Backend error: ${res.status}`);

//     const json = await res.json();
//     const ids: number[] = json.data?.ids || [];
//     return ids;

//     // Option B (if you store users locally per agent):
//     // return (agentsData[agentId]?.userIds || []).map((x: any) => Number(x)).filter(Number.isFinite);
//   }

//   bot.command("broadcast", async (ctx) => {
//     const userId = ctx.from?.id;
//     if (!userId || !ADMIN_IDS.includes(userId)) {
//       return ctx.reply("🚫 You are not authorized.");
//     }

//     const key = makeKey(agentId, userId);

//     if (pendingPrompts.has(key)) {
//       return ctx.reply(
//         "⚠️ You already have a broadcast in progress for this agent. Reply to the prompt or type /cancel."
//       );
//     }

//     const prompt = await ctx.reply(
//       `✉️ <b>Agent ${escapeTelegramHtml(agentId)}</b> broadcast\n\n` +
//         "Reply to this message with what you want to broadcast.\n" +
//         "You can send:\n" +
//         "• Text message\n" +
//         "• Image with caption\n\n" +
//         "To cancel, type /cancel or reply <code>cancel</code> to this message.",
//       {
//         parse_mode: "HTML",
//         reply_markup: {
//           force_reply: true,
//           selective: true,
//         },
//       }
//     );

//     pendingPrompts.set(key, prompt.message_id);
//   });

//   bot.command("cancel", async (ctx) => {
//     const userId = ctx.from?.id;
//     if (!userId) return;

//     const key = makeKey(agentId, userId);

//     if (pendingPrompts.has(key)) {
//       pendingPrompts.delete(key);
//       return ctx.reply("❌ Broadcast cancelled.");
//     }
//     return ctx.reply("ℹ️ No broadcast in progress.");
//   });

//   bot.on("message", async (ctx) => {
//     try {
//       const adminId = ctx.from?.id;
//       if (!adminId) return;

//       // Only handle admins for this agent
//       if (!ADMIN_IDS.includes(adminId)) return;

//       const key = makeKey(agentId, adminId);
//       if (!pendingPrompts.has(key)) return;

//       const expectedPromptId = pendingPrompts.get(key);
//       const msg = ctx.message;
//       if (!msg) return;

//       const replyTo = (msg as any).reply_to_message;
//       if (!replyTo || replyTo.message_id !== expectedPromptId) return;

//       // Cancel check
//       if ("text" in msg && msg.text?.trim().toLowerCase() === "cancel") {
//         pendingPrompts.delete(key);
//         return ctx.reply("❌ Broadcast cancelled.");
//       }

//       // End the "waiting" state as soon as we accept the reply
//       pendingPrompts.delete(key);

//       // Determine message type
//       let sendType: "text" | "photo" = "text";
//       let text = "";
//       let photoFileId: string | undefined;

//       if ("text" in msg && msg.text) {
//         sendType = "text";
//         text = msg.text;
//       } else if ("photo" in msg && msg.photo?.length) {
//         sendType = "photo";
//         const photo = msg.photo[msg.photo.length - 1];
//         photoFileId = photo.file_id;
//         text = msg.caption || "";
//       } else {
//         return ctx.reply("⚠️ Unsupported message type. Please reply with text or a photo with caption.");
//       }

//       await ctx.reply(`📡 Sending to <b>Agent ${escapeTelegramHtml(agentId)}</b> users...`, {
//         parse_mode: "HTML",
//       });

//       // Fetch agent user IDs
//       let userIds: number[] = [];
//       try {
//         userIds = await getAgentUserIds(adminId);
//       } catch (e: any) {
//         console.error("getAgentUserIds failed:", e);
//         return ctx.reply(`❌ Failed to load users for this agent.`);
//       }

//       if (!userIds.length) return ctx.reply("⚠️ No users found to broadcast.");

//       let sent = 0;
//       let failed = 0;
//       const failedIds: number[] = [];

//       const CHUNK_SIZE = 25;
//       const BATCH_DELAY_MS = 120;

//       function chunkArray<T>(arr: T[], size: number): T[][] {
//         const chunks: T[][] = [];
//         for (let i = 0; i < arr.length; i += size) {
//           chunks.push(arr.slice(i, i + size));
//         }
//         return chunks;
//       }

//       async function retrySend(fn: () => Promise<any>, retries = 3, backoff = 500) {
//         for (let i = 0; i < retries; i++) {
//           try {
//             return await fn();
//           } catch (err: any) {
//             const isRateLimit =
//               err && (err.code === 429 || String(err.description || "").includes("Too Many Requests"));
//             if (!isRateLimit || i === retries - 1) throw err;
//             await new Promise((r) => setTimeout(r, backoff));
//             backoff *= 2;
//           }
//         }
//       }

//       const batches = chunkArray(userIds, CHUNK_SIZE);

//       for (const batch of batches) {
//         const results = await Promise.allSettled(
//           batch.map((id) =>
//             sendType === "text"
//               ? retrySend(() => bot.telegram.sendMessage(id, text, { parse_mode: "HTML" }))
//               : retrySend(() =>
//                   bot.telegram.sendPhoto(id, photoFileId as string, {
//                     caption: text,
//                     parse_mode: "HTML",
//                   })
//                 )
//           )
//         );

//         results.forEach((res, i) => {
//           if (res.status === "fulfilled") sent++;
//           else {
//             failed++;
//             failedIds.push(batch[i]);
//           }
//         });

//         await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
//       }

//       await ctx.reply(`✅ Broadcast complete.\nSent: ${sent}\nFailed: ${failed}`);
//       // If you want:
//       // if (failedIds.length) await ctx.reply("⚠️ Failed IDs: " + JSON.stringify(failedIds.slice(0, 50)));
//     } catch (err) {
//       console.error("Unexpected handler error:", err);
//       const adminId = ctx.from?.id;
//       if (adminId) pendingPrompts.delete(makeKey(agentId, adminId));
//       await ctx.reply("❌ Broadcast aborted due to an internal error.");
//     }
//   });
// }

// ==============================================================================
// import type { Telegraf, Context } from "telegraf";
// import { agentsData } from "../utils";

// const API_BASE_URL = process.env.BACKEND_BASE_URL!;

// type SendType = "text" | "photo" | "video" | "voice";

// type PendingBroadcast = {
//   agentId: number;
//   adminId: number;
//   promptMessageId: number;
//   createdAt: number;
//   sendType?: SendType;
//   text?: string;   // text or caption (HTML)
//   fileId?: string; // file_id for photo/video/voice
// };

// const pending = new Map<string, PendingBroadcast>(); // key = `${agentId}:${adminId}`
// const keyOf = (agentId: number, adminId: number) => `${agentId}:${adminId}`;

// function escapeTelegramHtml(value: unknown) {
//   return String(value)
//     .replaceAll("&", "&amp;")
//     .replaceAll("<", "&lt;")
//     .replaceAll(">", "&gt;");
// }

// function parseAdminIds(agentId: number): number[] {
//   const raw = agentsData[agentId]?.adminIds || "";
//   return raw
//     .split(",")
//     .map((x: string) => Number(x.trim()))
//     .filter((n: number) => Number.isFinite(n));
// }

// async function getActiveAgentUserIds(adminTelegramId: number, agentId: number): Promise<number[]> {
//   const url =
//     `${API_BASE_URL}/api/v1/secured/user-profile/user-telegram-ids` +
//     `?adminTelegramId=${adminTelegramId}&agentId=${agentId}&activeOnly=true`;

//   const res = await fetch(url);
//   if (!res.ok) throw new Error(`Backend error: ${res.status}`);
//   const json = await res.json();
//   return (json.data?.ids || []) as number[];
// }

// // Non-generic on purpose (so all send methods fit cleanly)
// async function retrySend(fn: () => Promise<unknown>, retries = 3, backoff = 500): Promise<unknown> {
//   for (let i = 0; i < retries; i++) {
//     try {
//       return await fn();
//     } catch (err: any) {
//       const isRateLimit =
//         err && (err.code === 429 || String(err.description || "").includes("Too Many Requests"));
//       if (!isRateLimit || i === retries - 1) throw err;
//       await new Promise((r) => setTimeout(r, backoff));
//       backoff *= 2;
//     }
//   }
//   throw new Error("retrySend exhausted");
// }

// function chunkArray<T>(arr: T[], size: number): T[][] {
//   const chunks: T[][] = [];
//   for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
//   return chunks;
// }

// export function registerBroadcastHandler(bot: Telegraf<Context>, agentId: number) {
//   console.log(`[Broadcast] registered for agent ${agentId}`);

//   const agentName = agentsData[agentId]?.name ?? `Agent ${agentId}`;
//   const ADMIN_IDS = parseAdminIds(agentId);

//   const isAuthorized = (adminId?: number) => !!adminId && ADMIN_IDS.includes(adminId);

//   // /broadcast
//   bot.command("broadcast", async (ctx) => {
//     const adminId = ctx.from?.id;
//     if (!isAuthorized(adminId)) return ctx.reply("🚫 You are not authorized.");

//     const k = keyOf(agentId, adminId!);
//     if (pending.has(k)) {
//       return ctx.reply("⚠️ You already have a broadcast in progress. Reply to the prompt or type /cancel.");
//     }

//     const prompt = await ctx.reply(
//       `🎛 <b>${escapeTelegramHtml(agentName)}</b> broadcast\n\n` +
//         "Reply to this message with what you want to broadcast.\n\n" +
//         "Supported:\n" +
//         "• Text\n" +
//         "• Photo (caption optional)\n" +
//         "• Video (caption optional)\n" +
//         "• Voice message\n\n" +
//         "Cancel: /cancel or reply <code>cancel</code> to this message.",
//       {
//         parse_mode: "HTML",
//         reply_markup: { force_reply: true, selective: true },
//       }
//     );

//     pending.set(k, {
//       agentId,
//       adminId: adminId!,
//       promptMessageId: prompt.message_id,
//       createdAt: Date.now(),
//     });
//   });

//   // /cancel
//   bot.command("cancel", async (ctx) => {
//     const adminId = ctx.from?.id;
//     if (!isAuthorized(adminId)) return ctx.reply("🚫 You are not authorized.");

//     const k = keyOf(agentId, adminId!);
//     if (pending.has(k)) {
//       pending.delete(k);
//       return ctx.reply("❌ Broadcast cancelled.");
//     }
//     return ctx.reply("ℹ️ No broadcast in progress.");
//   });

//   // Capture admin reply to the prompt
//   bot.on("message", async (ctx) => {
//     const adminId = ctx.from?.id;
//     if (!isAuthorized(adminId)) return;

//     const k = keyOf(agentId, adminId!);
//     const state = pending.get(k);
//     if (!state) return;

//     const msg = ctx.message;
//     const replyTo = (msg as any).reply_to_message;

//     // must reply to our prompt
//     if (!replyTo || replyTo.message_id !== state.promptMessageId) return;

//     // cancel via replying "cancel"
//     if ("text" in msg && msg.text?.trim().toLowerCase() === "cancel") {
//       pending.delete(k);
//       return ctx.reply("❌ Broadcast cancelled.");
//     }

//     // detect type
//     let sendType: SendType | undefined;
//     let text = "";
//     let fileId: string | undefined;

//     if ("text" in msg && msg.text) {
//       sendType = "text";
//       text = msg.text;
//     } else if ("photo" in msg && msg.photo?.length) {
//       sendType = "photo";
//       fileId = msg.photo[msg.photo.length - 1].file_id;
//       text = msg.caption || "";
//     } else if ("video" in msg && msg.video) {
//       sendType = "video";
//       fileId = msg.video.file_id;
//       text = msg.caption || "";
//     } else if ("voice" in msg && msg.voice) {
//       sendType = "voice";
//       fileId = msg.voice.file_id;
//     }

//     if (!sendType) {
//       return ctx.reply("⚠️ Unsupported type. Please reply with text/photo/video/voice.");
//     }

//     // store content until confirm
//     state.sendType = sendType;
//     state.text = text;
//     state.fileId = fileId;
//     pending.set(k, state);

//     const actionSend = `bc_send:${agentId}:${adminId}`;
//     const actionCancel = `bc_cancel:${agentId}:${adminId}`;

//     // preview controls
//     await ctx.reply(
//       `✅ <b>Preview</b>\n\nPress <b>Send</b> to broadcast, or <b>Cancel</b>.`,
//       {
//         parse_mode: "HTML",
//         reply_markup: {
//           inline_keyboard: [
//             [{ text: "✅ Send", callback_data: actionSend }],
//             [{ text: "❌ Cancel", callback_data: actionCancel }],
//           ],
//         },
//       }
//     );

//     // show exact preview content
//     switch (sendType) {
//       case "text":
//         await ctx.reply(text, { parse_mode: "HTML" });
//         break;
//       case "photo":
//         await ctx.replyWithPhoto(fileId!, { caption: text, parse_mode: "HTML" });
//         break;
//       case "video":
//         await ctx.replyWithVideo(fileId!, { caption: text, parse_mode: "HTML" });
//         break;
//       case "voice":
//         await ctx.replyWithVoice(fileId!);
//         break;
//     }
//   });

//   // Cancel button
//   bot.action(new RegExp(`^bc_cancel:${agentId}:(\\d+)$`), async (ctx) => {
//     const adminId = Number((ctx.match as any)[1]);
//     if (ctx.from?.id !== adminId) return ctx.answerCbQuery("Not allowed.");
//     if (!isAuthorized(adminId)) return ctx.answerCbQuery("Not authorized.");

//     pending.delete(keyOf(agentId, adminId));
//     await ctx.answerCbQuery("Cancelled");
//     await ctx.reply("❌ Broadcast cancelled.");
//   });

//   // Send button
//   bot.action(new RegExp(`^bc_send:${agentId}:(\\d+)$`), async (ctx) => {
//     const adminId = Number((ctx.match as any)[1]);
//     if (ctx.from?.id !== adminId) return ctx.answerCbQuery("Not allowed.");
//     if (!isAuthorized(adminId)) return ctx.answerCbQuery("Not authorized.");

//     const k = keyOf(agentId, adminId);
//     const state = pending.get(k);

//     if (!state?.sendType) {
//       await ctx.answerCbQuery("Nothing to send.");
//       return ctx.reply("⚠️ No broadcast content found. Use /broadcast again.");
//     }

//     await ctx.answerCbQuery("Starting…");

//     // recipients (active only)
//     let userIds: number[] = [];
//     try {
//       userIds = await getActiveAgentUserIds(adminId, agentId);
//     } catch (e) {
//       console.error(e);
//       pending.delete(k);
//       return ctx.reply("❌ Failed to load agent users.");
//     }

//     const targetCount = userIds.length;
//     if (!targetCount) {
//       pending.delete(k);
//       return ctx.reply("⚠️ No active users found to broadcast.");
//     }

//     // progress message
//     const progressMsg = await ctx.reply(
//       `📊 <b>Broadcast Progress</b>\n\n` +
//         `Agent: <b>${escapeTelegramHtml(agentName)}</b>\n` +
//         `Target (total users): <b>${targetCount}</b>\n` +
//         `Sent: <b>0</b>\n` +
//         `Failed: <b>0</b>`,
//       { parse_mode: "HTML" }
//     );

//     const CHUNK_SIZE = 25;
//     const BATCH_DELAY_MS = 120;

//     let sent = 0;
//     let failed = 0;

//     const batches = chunkArray(userIds, CHUNK_SIZE);

//     // Always returns () => Promise<unknown> (avoids TS union issues)
//     const makeSendFn = (id: number): (() => Promise<unknown>) => {
//       switch (state.sendType) {
//         case "text":
//           return () => bot.telegram.sendMessage(id, state.text || "", { parse_mode: "HTML" });

//         case "photo":
//           return () =>
//             bot.telegram.sendPhoto(id, state.fileId!, {
//               caption: state.text || "",
//               parse_mode: "HTML",
//             });

//         case "video":
//           return () =>
//             bot.telegram.sendVideo(id, state.fileId!, {
//               caption: state.text || "",
//               parse_mode: "HTML",
//             });

//         case "voice":
//           return () => bot.telegram.sendVoice(id, state.fileId!);

//         default:
//           return () => Promise.reject(new Error(`Unsupported sendType: ${String(state.sendType)}`));
//       }
//     };

//     for (const batch of batches) {
//       const results = await Promise.allSettled(batch.map((id) => retrySend(makeSendFn(id))));

//       results.forEach((res) => (res.status === "fulfilled" ? sent++ : failed++));

//       const done = sent + failed;
//       const pct = Math.floor((done / targetCount) * 100);

//       await retrySend(() =>
//         bot.telegram.editMessageText(
//           progressMsg.chat.id,
//           progressMsg.message_id,
//           undefined,
//           `📊 <b>Broadcast Progress</b>\n\n` +
//             `Agent: <b>${escapeTelegramHtml(agentName)}</b>\n` +
//             `Target (active users): <b>${targetCount}</b>\n` +
//             `Done: <b>${done}</b> (${pct}%)\n` +
//             `Sent: <b>${sent}</b>\n` +
//             `Failed: <b>${failed}</b>`,
//           { parse_mode: "HTML" }
//         )
//       ).catch(() => {});

//       await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
//     }

//     pending.delete(k);

//     await ctx.reply(
//       `✅ <b>Broadcast complete</b>\n\n` +
//         `Agent: <b>${escapeTelegramHtml(agentName)}</b>\n` +
//         `Targeted (total users): <b>${targetCount}</b>\n` +
//         `Messages sent: <b>${sent}</b>\n` +
//         `Failed: <b>${failed}</b>`,
//       { parse_mode: "HTML" }
//     );
//   });
// }

// =======================================================================

import type { Telegraf, Context } from "telegraf";
import { agentsData } from "../utils";

const API_BASE_URL = process.env.BACKEND_BASE_URL!;

type SendType = "text" | "photo" | "video" | "voice";

// ─── Pending state (awaiting admin confirmation) ──────────────────────────────
type PendingBroadcast = {
  agentId: number;
  adminId: number;
  promptMessageId: number;
  createdAt: number;
  sendType?: SendType;
  text?: string;
  fileId?: string;
};

// ─── Active partition job (broadcast in progress) ────────────────────────────
type PartitionJob = {
  agentId: number;
  adminId: number;
  sendType: SendType;
  text: string;
  fileId?: string;
  allUserIds: number[];   // full list (excluding admin — admin gets it last)
  adminIsUser: boolean;   // whether admin was in the original user list
  partitionIndex: number; // which partition we're currently on (0-based)
  totalSent: number;      // cumulative across all partitions
  totalFailed: number;
  progressChatId: number;
  progressMessageId: number;
};

const pending = new Map<string, PendingBroadcast>();   // key = `${agentId}:${adminId}`
const activeJobs = new Map<string, PartitionJob>();    // key = `${agentId}:${adminId}`

const keyOf = (agentId: number, adminId: number) => `${agentId}:${adminId}`;

// ─── Tuning ───────────────────────────────────────────────────────────────────
const PARTITION_SIZE      = 100;    // users per serverless invocation
const CONCURRENT_SENDS    = 10;     // parallel sends within a partition
const INTER_BATCH_DELAY   = 200;    // ms between concurrent batches inside a partition
const INTER_PARTITION_GAP = 10_000; // ms pause between partitions (10s)

// ─── Helpers ──────────────────────────────────────────────────────────────────
function escapeTelegramHtml(value: unknown) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function parseAdminIds(agentId: number): number[] {
  const raw = agentsData[agentId]?.adminIds || "";
  return raw
    .split(",")
    .map((x: string) => Number(x.trim()))
    .filter((n: number) => Number.isFinite(n));
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function getActiveAgentUserIds(adminTelegramId: number, agentId: number): Promise<number[]> {
  const url =
    `${API_BASE_URL}/api/v1/secured/user-profile/user-telegram-ids` +
    `?adminTelegramId=${adminTelegramId}&agentId=${agentId}&activeOnly=true`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Backend error: ${res.status}`);
  const json = await res.json();
  return (json.data?.ids || []) as number[];
}

/**
 * Retry with Telegram's own retry_after value on 429s.
 */
async function retrySend(fn: () => Promise<unknown>, retries = 5): Promise<unknown> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      const isRateLimit =
        err?.code === 429 || String(err?.description || "").includes("Too Many Requests");
      if (!isRateLimit || i === retries - 1) throw err;
      const waitMs = err?.parameters?.retry_after
        ? err.parameters.retry_after * 1000
        : Math.min(1000 * 2 ** i, 30_000);
      console.warn(`[Broadcast] 429 — waiting ${waitMs}ms (attempt ${i + 1}/${retries})`);
      await sleep(waitMs);
    }
  }
  throw new Error("retrySend exhausted");
}

// ─── Core send function ───────────────────────────────────────────────────────
function makeSendFn(
  bot: Telegraf<Context>,
  id: number,
  sendType: SendType,
  text: string,
  fileId?: string
): () => Promise<unknown> {
  switch (sendType) {
    case "text":
      return () => bot.telegram.sendMessage(id, text, { parse_mode: "HTML" });
    case "photo":
      return () => bot.telegram.sendPhoto(id, fileId!, { caption: text, parse_mode: "HTML" });
    case "video":
      return () => bot.telegram.sendVideo(id, fileId!, { caption: text, parse_mode: "HTML" });
    case "voice":
      return () => bot.telegram.sendVoice(id, fileId!);
    default:
      return () => Promise.reject(new Error(`Unsupported sendType: ${String(sendType)}`));
  }
}

// ─── Send one partition (up to PARTITION_SIZE users) ─────────────────────────
async function sendPartition(
  bot: Telegraf<Context>,
  job: PartitionJob
): Promise<{ sent: number; failed: number }> {
  const start = job.partitionIndex * PARTITION_SIZE;
  const slice = job.allUserIds.slice(start, start + PARTITION_SIZE);

  let sent = 0;
  let failed = 0;

  for (const batch of chunkArray(slice, CONCURRENT_SENDS)) {
    const results = await Promise.allSettled(
      batch.map((id) =>
        retrySend(makeSendFn(bot, id, job.sendType, job.text, job.fileId))
      )
    );
    results.forEach((r) => (r.status === "fulfilled" ? sent++ : failed++));
    await sleep(INTER_BATCH_DELAY);
  }

  return { sent, failed };
}

// ─── Update the pinned progress message ──────────────────────────────────────
async function updateProgressMessage(
  bot: Telegraf<Context>,
  job: PartitionJob,
  agentName: string,
  status: string
) {
  const totalUsers = job.allUserIds.length + (job.adminIsUser ? 1 : 0);
  const done = job.totalSent + job.totalFailed;
  const pct = totalUsers > 0 ? Math.floor((done / totalUsers) * 100) : 0;
  const totalPartitions = Math.ceil(job.allUserIds.length / PARTITION_SIZE);
  const currentPartition = Math.min(job.partitionIndex + 1, totalPartitions);

  await retrySend(() =>
    bot.telegram.editMessageText(
      job.progressChatId,
      job.progressMessageId,
      undefined,
      `📊 <b>Broadcast Progress</b>\n\n` +
        `Agent: <b>${escapeTelegramHtml(agentName)}</b>\n` +
        `Status: <b>${escapeTelegramHtml(status)}</b>\n` +
        `Partition: <b>${currentPartition} / ${totalPartitions}</b>\n` +
        `Total users: <b>${totalUsers}</b>\n` +
        `Done: <b>${done}</b> (${pct}%)\n` +
        `✅ Sent: <b>${job.totalSent}</b>\n` +
        `❌ Failed: <b>${job.totalFailed}</b>`,
      { parse_mode: "HTML" }
    )
  ).catch(() => {});
}

// ─── Orchestrator: runs all partitions, then sends to admin last ──────────────
async function runBroadcast(
  bot: Telegraf<Context>,
  job: PartitionJob,
  agentName: string,
  adminId: number
) {
  const k = keyOf(job.agentId, adminId);
  const totalPartitions = Math.ceil(job.allUserIds.length / PARTITION_SIZE);

  for (let i = job.partitionIndex; i < totalPartitions; i++) {
    // Check if admin cancelled mid-broadcast
    if (!activeJobs.has(k)) {
      console.log(`[Broadcast] Job ${k} was cancelled at partition ${i}`);
      return;
    }

    job.partitionIndex = i;

    await updateProgressMessage(
      bot, job, agentName,
      `Sending partition ${i + 1} / ${totalPartitions}…`
    );

    const { sent, failed } = await sendPartition(bot, job);
    job.totalSent += sent;
    job.totalFailed += failed;

    await updateProgressMessage(
      bot, job, agentName,
      `Partition ${i + 1} / ${totalPartitions} done`
    );

    // Pause between partitions (skip after the last one)
    if (i < totalPartitions - 1) {
      await updateProgressMessage(
        bot, job, agentName,
        `Pausing ${INTER_PARTITION_GAP / 1000}s before next partition…`
      );
      await sleep(INTER_PARTITION_GAP);
    }
  }

  // Check again before sending to admin (in case cancelled during last pause)
  if (!activeJobs.has(k)) return;

  // ── Send to admin last — acts as a delivery receipt ──────────────────────
  if (job.adminIsUser) {
    try {
      await retrySend(makeSendFn(bot, adminId, job.sendType, job.text, job.fileId));
      job.totalSent++;
    } catch {
      job.totalFailed++;
    }
  }

  // ── Final summary (edit progress message + send summary) ─────────────────
  const totalUsers = job.allUserIds.length + (job.adminIsUser ? 1 : 0);

  await retrySend(() =>
    bot.telegram.editMessageText(
      job.progressChatId,
      job.progressMessageId,
      undefined,
      `📊 <b>Broadcast Complete</b>\n\n` +
        `Agent: <b>${escapeTelegramHtml(agentName)}</b>\n` +
        `Status: <b>✅ Finished</b>\n` +
        `Partitions: <b>${totalPartitions}</b>\n` +
        `Total users: <b>${totalUsers}</b>\n` +
        `✅ Sent: <b>${job.totalSent}</b>\n` +
        `❌ Failed: <b>${job.totalFailed}</b>`,
      { parse_mode: "HTML" }
    )
  ).catch(() => {});

  await bot.telegram.sendMessage(
    adminId,
    `✅ <b>Broadcast complete</b>\n\n` +
      `Agent: <b>${escapeTelegramHtml(agentName)}</b>\n` +
      `Total users: <b>${totalUsers}</b>\n` +
      `Messages sent: <b>${job.totalSent}</b>\n` +
      `Failed: <b>${job.totalFailed}</b>`,
    { parse_mode: "HTML" }
  );

  activeJobs.delete(k);
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function registerBroadcastHandler(bot: Telegraf<Context>, agentId: number) {
  console.log(`[Broadcast] registered for agent ${agentId}`);

  const agentName = agentsData[agentId]?.name ?? `Agent ${agentId}`;
  const ADMIN_IDS = parseAdminIds(agentId);
  const isAuthorized = (adminId?: number) => !!adminId && ADMIN_IDS.includes(adminId);

  // ── /broadcast ──────────────────────────────────────────────────────────────
  bot.command("broadcast", async (ctx) => {
    const adminId = ctx.from?.id;
    if (!isAuthorized(adminId)) return ctx.reply("🚫 You are not authorized.");

    const k = keyOf(agentId, adminId!);

    if (activeJobs.has(k)) {
      return ctx.reply("⚠️ A broadcast is already running. Wait for it to finish or /cancel it.");
    }
    if (pending.has(k)) {
      return ctx.reply(
        "⚠️ You already have a broadcast in progress. Reply to the prompt or type /cancel."
      );
    }

    const prompt = await ctx.reply(
      `🎛 <b>${escapeTelegramHtml(agentName)}</b> broadcast\n\n` +
        "Reply to this message with what you want to broadcast.\n\n" +
        "Supported:\n" +
        "• Text\n" +
        "• Photo (caption optional)\n" +
        "• Video (caption optional)\n" +
        "• Voice message\n\n" +
        "Cancel: /cancel or reply <code>cancel</code> to this message.",
      { parse_mode: "HTML", reply_markup: { force_reply: true, selective: true } }
    );

    pending.set(k, {
      agentId,
      adminId: adminId!,
      promptMessageId: prompt.message_id,
      createdAt: Date.now(),
    });
  });

  // ── /cancel ─────────────────────────────────────────────────────────────────
  bot.command("cancel", async (ctx) => {
    const adminId = ctx.from?.id;
    if (!isAuthorized(adminId)) return ctx.reply("🚫 You are not authorized.");

    const k = keyOf(agentId, adminId!);

    if (activeJobs.has(k)) {
      activeJobs.delete(k); // runBroadcast checks this map and will stop
      return ctx.reply("🛑 Broadcast cancelled — current partition will finish, then stop.");
    }
    if (pending.has(k)) {
      pending.delete(k);
      return ctx.reply("❌ Broadcast cancelled.");
    }
    return ctx.reply("ℹ️ No broadcast in progress.");
  });

  // ── Capture admin reply to prompt ───────────────────────────────────────────
  bot.on("message", async (ctx) => {
    const adminId = ctx.from?.id;
    if (!isAuthorized(adminId)) return;

    const k = keyOf(agentId, adminId!);
    const state = pending.get(k);
    if (!state) return;

    const msg = ctx.message;
    const replyTo = (msg as any).reply_to_message;
    if (!replyTo || replyTo.message_id !== state.promptMessageId) return;

    if ("text" in msg && msg.text?.trim().toLowerCase() === "cancel") {
      pending.delete(k);
      return ctx.reply("❌ Broadcast cancelled.");
    }

    let sendType: SendType | undefined;
    let text = "";
    let fileId: string | undefined;

    if ("text" in msg && msg.text) {
      sendType = "text";
      text = msg.text;
    } else if ("photo" in msg && msg.photo?.length) {
      sendType = "photo";
      fileId = msg.photo[msg.photo.length - 1].file_id;
      text = msg.caption || "";
    } else if ("video" in msg && msg.video) {
      sendType = "video";
      fileId = msg.video.file_id;
      text = msg.caption || "";
    } else if ("voice" in msg && msg.voice) {
      sendType = "voice";
      fileId = msg.voice.file_id;
    }

    if (!sendType) {
      return ctx.reply("⚠️ Unsupported type. Please reply with text/photo/video/voice.");
    }

    state.sendType = sendType;
    state.text = text;
    state.fileId = fileId;
    pending.set(k, state);

    const actionSend = `bc_send:${agentId}:${adminId}`;
    const actionCancel = `bc_cancel:${agentId}:${adminId}`;

    await ctx.reply(
      `✅ <b>Preview</b>\n\n` +
        `Will broadcast in partitions of <b>${PARTITION_SIZE} users</b> with a <b>${INTER_PARTITION_GAP / 1000}s pause</b> between each.\n\n` +
        `Press <b>Send</b> to start or <b>Cancel</b> to abort.`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "✅ Send", callback_data: actionSend }],
            [{ text: "❌ Cancel", callback_data: actionCancel }],
          ],
        },
      }
    );

    switch (sendType) {
      case "text":  await ctx.reply(text, { parse_mode: "HTML" }); break;
      case "photo": await ctx.replyWithPhoto(fileId!, { caption: text, parse_mode: "HTML" }); break;
      case "video": await ctx.replyWithVideo(fileId!, { caption: text, parse_mode: "HTML" }); break;
      case "voice": await ctx.replyWithVoice(fileId!); break;
    }
  });

  // ── Cancel button ───────────────────────────────────────────────────────────
  bot.action(new RegExp(`^bc_cancel:${agentId}:(\\d+)$`), async (ctx) => {
    const adminId = Number((ctx.match as any)[1]);
    if (ctx.from?.id !== adminId) return ctx.answerCbQuery("Not allowed.");
    if (!isAuthorized(adminId)) return ctx.answerCbQuery("Not authorized.");

    pending.delete(keyOf(agentId, adminId));
    await ctx.answerCbQuery("Cancelled");
    await ctx.reply("❌ Broadcast cancelled.");
  });

  // ── Send button ─────────────────────────────────────────────────────────────
  bot.action(new RegExp(`^bc_send:${agentId}:(\\d+)$`), async (ctx) => {
    const adminId = Number((ctx.match as any)[1]);
    if (ctx.from?.id !== adminId) return ctx.answerCbQuery("Not allowed.");
    if (!isAuthorized(adminId)) return ctx.answerCbQuery("Not authorized.");

    const k = keyOf(agentId, adminId);
    const state = pending.get(k);

    if (!state?.sendType) {
      await ctx.answerCbQuery("Nothing to send.");
      return ctx.reply("⚠️ No broadcast content found. Use /broadcast again.");
    }

    // !! Answer the callback IMMEDIATELY before doing any async work.
    // This is critical — if we don't answer within ~10s Telegraf will
    // consider the handler timed out on serverless.
    await ctx.answerCbQuery("Starting…");
    pending.delete(k);

    // ── Fetch recipients ────────────────────────────────────────────────────
    let userIds: number[] = [];
    try {
      userIds = await getActiveAgentUserIds(adminId, agentId);
    } catch (e) {
      console.error(e);
      return ctx.reply("❌ Failed to load agent users.");
    }

    // Admin goes last — remove from regular list so they get it as receipt
    const regularUserIds = userIds.filter((id) => id !== adminId);
    const adminIsUser = userIds.includes(adminId);
    const totalUsers = regularUserIds.length + (adminIsUser ? 1 : 0);

    if (totalUsers === 0) {
      return ctx.reply("⚠️ No active users found to broadcast.");
    }

    const totalPartitions = Math.ceil(regularUserIds.length / PARTITION_SIZE);

    // ── Create live progress message ────────────────────────────────────────
    const progressMsg = await ctx.reply(
      `📊 <b>Broadcast Progress</b>\n\n` +
        `Agent: <b>${escapeTelegramHtml(agentName)}</b>\n` +
        `Status: <b>Starting…</b>\n` +
        `Partition: <b>1 / ${totalPartitions}</b>\n` +
        `Total users: <b>${totalUsers}</b>\n` +
        `Done: <b>0</b> (0%)\n` +
        `✅ Sent: <b>0</b>\n` +
        `❌ Failed: <b>0</b>`,
      { parse_mode: "HTML" }
    );

    const job: PartitionJob = {
      agentId,
      adminId,
      sendType: state.sendType,
      text: state.text || "",
      fileId: state.fileId,
      allUserIds: regularUserIds,
      adminIsUser,
      partitionIndex: 0,
      totalSent: 0,
      totalFailed: 0,
      progressChatId: progressMsg.chat.id,
      progressMessageId: progressMsg.message_id,
    };

    activeJobs.set(k, job);

    // ── Fire-and-forget — NOT awaited ───────────────────────────────────────
    // The action handler returns here immediately. runBroadcast runs in the
    // background independently of the serverless request lifecycle.
    runBroadcast(bot, job, agentName, adminId).catch((err) => {
      console.error("[Broadcast] Fatal error:", err);
      activeJobs.delete(k);
      bot.telegram
        .sendMessage(adminId, "❌ Broadcast crashed unexpectedly. Check server logs.")
        .catch(() => {});
    });
  });
}