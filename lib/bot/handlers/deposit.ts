// import type { Telegraf, Context } from "telegraf"
// import { message } from "telegraf/filters"
// import { agentsData, renderDepositTemplate, t } from "../utils"

// type DepositMethod = "telebirr" | "cbeonline"

// type UserState = {
//   step: "waiting_notification"
//   method: DepositMethod
// }

// const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL!
// const userState = new Map<number, UserState>()
// const depositTimeouts = new Map<number, NodeJS.Timeout>()

// function clearTimeoutForUser(userId: number) {
//   const t = depositTimeouts.get(userId)
//   if (t) clearTimeout(t)
//   depositTimeouts.delete(userId)
// }

// export function registerDepositHandler(bot: Telegraf<Context>, agentId: number) {
//   bot.command("deposit", async (ctx) => {
//     await ctx.reply(`💰 ${t(ctx, "paymentMethod")}`, {
//       reply_markup: {
//         inline_keyboard: [
//           [{ text: t(ctx, "telebirr"), callback_data: "deposit.telebirr" }],
//           [{ text: t(ctx, "cbeOnlineBank"), callback_data: "deposit.cbeonline" }],
//         ],
//       },
//     })
//   })

//   bot.action(/^deposit\.(telebirr|cbeonline)$/i, async (ctx) => {
//     const userId = ctx.from!.id
//     const method = ctx.match![1] as DepositMethod

//     userState.set(userId, { step: "waiting_notification", method })

//     await ctx.reply(t(ctx, method === "telebirr" ? renderDepositTemplate("en", "payTeleInstructions", {phone: agentsData[agentId].bankDetails.telebirr.phoneNumber, name: agentsData[agentId].bankDetails.telebirr.recieverName}) : renderDepositTemplate("en", "payCBEInstructions", {accountNumber: agentsData[agentId].bankDetails.cbeonline.accountNumber, name: agentsData[agentId].bankDetails.cbeonline.accountName})), {
//       parse_mode: "HTML",
//       reply_markup: {
//         inline_keyboard: [[{ text: "Cancel Deposit", callback_data: "deposit.cancel" }]],
//       },
//     })

//     clearTimeoutForUser(userId)
//     depositTimeouts.set(
//       userId,
//       setTimeout(
//         async () => {
//           userState.delete(userId)
//           await ctx.reply(`💰 ${t(ctx, "paymentMethod")}`, {
//             reply_markup: {
//               inline_keyboard: [
//                 [{ text: t(ctx, "telebirr"), callback_data: "deposit.telebirr" }],
//                 [{ text: t(ctx, "cbeOnlineBank"), callback_data: "deposit.cbeonline" }],
//               ],
//             },
//           })
//         },
//         60 * 60 * 1000,
//       ),
//     )

//     await ctx.answerCbQuery()
//   })

//   bot.action("deposit.cancel", async (ctx) => {
//     const userId = ctx.from!.id
//     userState.delete(userId)
//     clearTimeoutForUser(userId)
//     await ctx.editMessageText("❌ Deposit cancelled.")
//     await ctx.answerCbQuery()
//   })

//   bot.on(message("text"), async (ctx, next) => {
//     const text = ctx.message.text
//     const userId = ctx.from!.id

//     if (text.startsWith("/")) return next()

//     const st = userState.get(userId)
//     if (!st) return next()

//     clearTimeoutForUser(userId)

//     try {
//       await ctx.reply("💰 Processing deposit for agent: " + agentId)
//       // Implementation similar to original but with agentId parameter
//       userState.delete(userId)
//     } catch (err: any) {
//       console.error("Deposit error:", err)
//       await ctx.reply("❌ Deposit failed")
//       userState.delete(userId)
//     }

//     return next()
//   })
// }


import type { Telegraf, Context } from "telegraf";
import { message } from "telegraf/filters";
import axios from "axios";
import { veritas } from "@/lib/veritas";
import { renderDepositTemplate, t } from "../utils";
import { getAgentConfig } from "../agent-config";
import { allowedPaymentHours } from "../translations";
import { fetchAndSendWallet } from "./wallet-handler";

type DepositMethod = "telebirr" | "cbeonline";

type UserState = {
  step: "waiting_notification";
  method: DepositMethod;
};

type TelebirrVerifyResponse = {
  success: boolean;
  data?: Record<string, any>;
};

type CBEVerifyResponse = {
  success: boolean;
  payer?: string;
  payerAccount?: string;
  receiver?: string;
  receiverAccount?: string;
  amount?: number;
  date?: string;
  paymentDate?: string;
  reference?: string;
  reason?: string;
};

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL!;
const BACKEND_ENDPOINTS_ACCESS_TOKEN = process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN;

const userState = new Map<string, UserState>(); // key = `${agentId}:${userId}`
const depositTimeouts = new Map<string, NodeJS.Timeout>();

const keyOf = (agentId: number, userId: number) => `${agentId}:${userId}`;

function clearTimeoutForKey(key: string) {
  const tmr = depositTimeouts.get(key);
  if (tmr) clearTimeout(tmr);
  depositTimeouts.delete(key);
}

/** Language for templates */
function getLang(ctx: any): string {
  // Prefer your own stored setting (recommended)
  if (ctx.session?.lang) return String(ctx.session.lang);

  // Telegram user language code fallback
  const lc = ctx.from?.language_code;
  if (lc === "am" || lc?.startsWith("am")) return "am";

  return "en";
}

/** TELEBIRR parser (same as your working version) */
function parseTelebirrRef(text: string): string | null {
  const splits = text.trim().split(/[\s\/]+/);
  if (splits.length === 1) {
    const token = splits[0].trim();
    return token;
  }
  const urlMatch = text.match(/\/receipt\/([A-Z0-9]{7,13})\b/);
  if (urlMatch) return urlMatch[1];
  return null;
}

/** CBE parser — accepts full SMS text, the receipt URL, a bare token, or legacy "FT..." refs */
function parseCBERef(text: string): { ref: string; acc: string } | null {
  // New receipt format: full URL pasted alone or inside the SMS
  const link = text.match(/https?:\/\/mbreciept\.cbe\.com\.et\/\S+/i);
  if (link) return { ref: link[0], acc: "" };

  // New receipt format: bare token — the last segment of the receipt URL (v2-<token>)
  const token = text.match(/\bv2-[A-Za-z0-9]+\b/i);
  if (token) return { ref: token[0], acc: "" };

  // Legacy format: FT<reference><8-digit account suffix>
  const m = text.match(/FT[A-Z0-9]+/i);
  if (!m) return null;
  const ft = m[0];
  if (ft.length <= 8) return null;
  return { ref: ft.slice(0, -8), acc: ft.slice(-8) };
}

async function verifyTelebirr(reference: string): Promise<TelebirrVerifyResponse> {
  try {
    return await veritas<TelebirrVerifyResponse>("/verify-telebirr", {
      method: "POST",
      body: JSON.stringify({ reference }),
    });
  } catch {
    return { success: false };
  }
}

async function verifyCBE(reference: string, accountSuffix: string): Promise<CBEVerifyResponse> {
  try {
    // New receipt links/tokens don't require accountSuffix — the API auto-routes on the input
    const body = accountSuffix ? { reference, accountSuffix } : { reference };
    return await veritas<CBEVerifyResponse>("/verify-cbe", {
      method: "POST",
      body: JSON.stringify(body),
    });
  } catch {
    return { success: false };
  }
}

export function parsePaymentDate(dateStr: string): Date {
  // CBE format: ISO
  if (dateStr.includes("T")) return new Date(dateStr);

  // Telebirr format: "dd-MM-yyyy HH:mm:ss"
  const [datePart, timePart] = dateStr.split(" ");
  const [dd, MM, yyyy] = datePart.split("-").map(Number);
  const [HH, mm, ss] = timePart.split(":").map(Number);
  return new Date(yyyy, MM - 1, dd, HH, mm, ss);
}

export function isWithinDays(paymentDate: Date, days: number): boolean {
  const now = new Date();
  const diffMs = now.getTime() - paymentDate.getTime();
  const limitMs = days * 24 * 60 * 60 * 1000;
  return diffMs <= limitMs;
}

const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^a-z\s]/g, "")
    .trim();

/**
 * Send deposit to backend
 * NOTE: include agentId so backend knows which agent
 */
async function sendDepositToBackend(
  telegramId: number,
  agentId: number,
  amount: number,
  paymentProviderRef: string,
  paymentMethodCode: string,
  metadata: Record<string, any>
) {
  const body = {
    telegramId,
    agentId,
    amount,
    paymentMethodCode,
    paymentMethodId: null,
    instructionsUrl: null,
    paymentProviderRef,
    metadata,
  };

  const res = await axios.post(
    `${BACKEND_BASE_URL}/api/v1/secured/payment-orders/offline/offline-deposit`,
    body,
    { headers: 
      { 
        "Content-Type": "application/json",
        "X-Access-Token": BACKEND_ENDPOINTS_ACCESS_TOKEN ?? "",

      } }
  );

  if (res.status > 299) return res.data?.message || "Unknown error";
  return `You successfully deposited ETB ${amount}`;
}

/** Build HTML instructions (keeps your templates) */
async function buildInstructionsHtml(ctx: any, agentId: number, method: DepositMethod): Promise<string> {
  const lang = getLang(ctx);
  const config = await getAgentConfig(agentId);

  if (method === "telebirr") {
    const phone = config?.bankDetails?.telebirr?.phoneNumber ?? "";
    const name = config?.bankDetails?.telebirr?.recieverName ?? "";
    return renderDepositTemplate(lang, "payTeleInstructions", { phone, name });
  }

  const accountNumber = config?.bankDetails?.cbeonline?.accountNumber ?? "";
  const name = config?.bankDetails?.cbeonline?.accountName ?? "";
  return renderDepositTemplate(lang, "payCBEInstructions", { accountNumber, name });
}

export function registerDepositHandler(bot: Telegraf<Context>, agentId: number) {
  // /deposit
  bot.command("deposit", async (ctx) => {
    await ctx.reply(`💰 ${t(ctx, "paymentMethod")}`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: t(ctx, "telebirr"), callback_data: "deposit.telebirr" }],
          [{ text: t(ctx, "cbeOnlineBank"), callback_data: "deposit.cbeonline" }],
        ],
      },
    });
  });

  // method selected
  bot.action(/^deposit\.(telebirr|cbeonline)$/i, async (ctx) => {
    const userId = ctx.from!.id;
    const method = ctx.match![1] as DepositMethod;

    const k = keyOf(agentId, userId);
    userState.set(k, { step: "waiting_notification", method });

    // ✅ FIX: send the rendered template directly (no t() around it)
    const html = await buildInstructionsHtml(ctx, agentId, method);

    await ctx.reply(html, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[{ text: "Cancel Deposit", callback_data: "deposit.cancel" }]],
      },
    });

    clearTimeoutForKey(k);
    depositTimeouts.set(
      k,
      setTimeout(async () => {
        userState.delete(k);
        await ctx.reply(`💰 ${t(ctx, "paymentMethod")}`, {
          reply_markup: {
            inline_keyboard: [
              [{ text: t(ctx, "telebirr"), callback_data: "deposit.telebirr" }],
              [{ text: t(ctx, "cbeOnlineBank"), callback_data: "deposit.cbeonline" }],
            ],
          },
        });
      }, 60 * 60 * 1000)
    );

    await ctx.answerCbQuery();
  });

  // cancel
  bot.action("deposit.cancel", async (ctx) => {
    const userId = ctx.from!.id;
    const k = keyOf(agentId, userId);

    userState.delete(k);
    clearTimeoutForKey(k);

    await ctx.editMessageText("❌ Deposit cancelled.");
    await ctx.answerCbQuery();
  });

  // text handler for payment confirmation messages
  bot.on(message("text"), async (ctx, next) => {
    const text = ctx.message.text;
    const userId = ctx.from!.id;
    const k = keyOf(agentId, userId);

    // skip commands
    if (text.startsWith("/")) return next();

    const st = userState.get(k);
    if (!st) return next();

    clearTimeoutForKey(k);

    const method = st.method;

    try {
      const agent = await getAgentConfig(agentId);
      if (!agent?.bankDetails) {
        userState.delete(k);
        return ctx.reply("❌ Agent configuration not found.");
      }

      let verify: any;
      let amount = 0;
      let metadata: any = {};
      let paymentProviderRef = "";
      let paymentMethodCode = "";

      // ---------- TELEBIRR ----------
      if (method === "telebirr") {
        const ref = parseTelebirrRef(text);
        if (!ref) return ctx.reply(`❌ ${t(ctx, "telebirrTxnNumber")}`);

        await ctx.reply(`⏳ Verifying Telebirr With Ref: ${ref}...`);
        verify = await verifyTelebirr(ref);
        if (!verify.success) return ctx.reply(`❌ ${t(ctx, "telebirrVerificationFailed")}`);

        const expectedName = agent.bankDetails.telebirr?.recieverName ?? "";
        const expectedPhone = agent.bankDetails.telebirr?.phoneNumber ?? "";

        const recv = String(verify.data?.["creditedPartyName"] || "").trim();
        const last4 = String(verify.data?.["creditedPartyAccountNo"] || "").slice(-4);

        const date = String(verify.data?.["paymentDate"] || "");
        const telebirrDate = parsePaymentDate(date);

        if (!isWithinDays(telebirrDate, allowedPaymentHours / 24)) {
          return ctx.reply(`❌ ${t(ctx, "telebirrPaymetExpireMessage")}`);
        }

        // Display mismatch
        // await ctx.reply(`Debug: recv='${recv}' last4='${last4}' expectedName='${expectedName}' expectedPhone='${expectedPhone}'`);

        // match receiver name + last4 of phone
        if (recv.toLowerCase() !== expectedName.toLowerCase() || last4 !== expectedPhone.slice(-4)) {
          return ctx.reply("❌ Telebirr details mismatch.");
        }

        amount = Number(String(verify.data?.settledAmount || "").replace(" Birr", "")) || 0;
        metadata = verify;
        paymentProviderRef = ref;
        paymentMethodCode = "telebirr";
      }

      // ---------- CBE ----------
      if (method === "cbeonline") {
        const parsed = parseCBERef(text);
        if (!parsed) return ctx.reply(`❌ ${t(ctx, "cbeTxnNumber")}`);

        await ctx.reply("⏳ Verifying CBE Online...");
        verify = await verifyCBE(parsed.ref, parsed.acc);
        if (!verify.success) return ctx.reply(`❌ ${t(ctx, "cbeVerificationFailed")}`);

        const expectedName = agent.bankDetails.cbeonline?.accountName ?? "";
        const expectedAcc = agent.bankDetails.cbeonline?.accountNumber ?? "";

        const recv = String(verify.receiver || "").trim();
        const receiverAcc = String(verify.receiverAccount || "");
        const last4 = receiverAcc.slice(-4);

        const date = String(verify.date || verify.paymentDate || "");
        const cbeDate = parsePaymentDate(date);

        if (!isNaN(cbeDate.getTime()) && !isWithinDays(cbeDate, allowedPaymentHours / 24)) {
          return ctx.reply(`❌ ${t(ctx, "cbeonlinePaymetExpireMessage")}`);
        }

        // Display mismatch
        // await ctx.reply(`Debug: recv='${recv}' last4='${last4}' expectedName='${expectedName}' expectedAcc='${expectedAcc}'`);

        // New-format receipts may omit/mask the receiver account — enforce last4 only when present
        const accMatches = !receiverAcc || last4 === expectedAcc.slice(-4);
        if (normalize(recv) !== normalize(expectedName) || !accMatches) {
          return ctx.reply("❌ CBE details mismatch.");
        }

        amount = Number(verify.amount) || 0;
        metadata = verify;
        paymentProviderRef = parsed.ref;
        paymentMethodCode = "cbebank";
      }

      // send to backend
      await ctx.reply("💰 Adding deposit to your balance...");
      const result = await sendDepositToBackend(userId, agentId, amount, paymentProviderRef, paymentMethodCode, metadata);

      await ctx.reply(`✅ ${result}`);

      // refresh wallet
      await fetchAndSendWallet(ctx, agentId, userId);

      userState.delete(k);
    } catch (err: any) {
      let errorMessage = "Unexpected error occurred";

      if (axios.isAxiosError(err)) {
        if (err.response?.data?.message) errorMessage = err.response.data.message;
        else if (typeof err.response?.data === "string") errorMessage = err.response.data;
        else errorMessage = err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      errorMessage = errorMessage.replace(/^[a-zA-Z0-9_.]+Exception:\s*/, "");
      console.error("Deposit error:", err);

      await ctx.reply(`❌ ${errorMessage}`);
      userState.delete(k);
    }

    return next();
  });
}
