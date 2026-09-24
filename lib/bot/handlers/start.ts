import axios from "axios";
import { Markup } from "telegraf";
import type { Telegraf, Context } from "telegraf";
import { showStartMenu } from "./commands";
import { getAgentConfig } from "../agent-config";
import { ADMIN_COMMANDS } from "../setup-webhooks";

/**
 * Supports both old and new invite payload formats:
 * 1) Old: /start 1961597377
 * 2) New (multi-agent safe): /start a1_r1961597377
 */

const BACKEND_ENDPOINTS_ACCESS_TOKEN = process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN;

function parseStartPayload(ctx: Context): { agentId?: number; referrerId?: number } {
  const message = ctx.message as { text?: string } | undefined;
  const text = message?.text || "";
  const parts = text.split(" ");
  if (parts.length < 2) return {};

  const payload = parts[1];

  // New format: a<agentId>_r<referrerId>
  const m = /^a(\d+)_r(\d+)$/.exec(payload);
  if (m) {
    return { agentId: Number(m[1]), referrerId: Number(m[2]) };
  }

  // Old format: plain number -> referrerId only
  const legacy = Number.parseInt(payload, 10);
  if (!Number.isNaN(legacy)) return { referrerId: legacy };

  return {};
}

async function parseAdminIds(agentId: number): Promise<number[]> {
  const config = await getAgentConfig(agentId);
  const raw = config?.adminIds || "";
  return raw
    .split(",")
    .map((x: string) => x.trim())
    .filter((x: string) => x !== "")
    .map((x: string) => Number(x))
    .filter((n: number) => Number.isFinite(n) && n > 0);
}

/**
 * Option A: Enable admin commands AFTER admin starts bot (avoids "chat not found")
 */
async function enableAdminCommandsIfAdmin(ctx: any, agentId: number) {
  const adminIds = await parseAdminIds(agentId);
  const uid = ctx.from?.id;
  if (!uid) return;

  if (adminIds.includes(uid)) {
    try {
      await ctx.telegram.setMyCommands(ADMIN_COMMANDS, {
        scope: { type: "chat", chat_id: uid },
      });
      // Optional confirmation:
      // await ctx.reply("✅ Admin commands enabled.");
    } catch (e) {
      console.error(`[Admin Commands] Failed to set admin commands for agent ${agentId} admin ${uid}`, e);
    }
  }
}

export function registerStartHandlers(bot: Telegraf, agentId: number) {
  bot.start(async (ctx: any) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    // ✅ Enable admin commands on /start (Option A)
    await enableAdminCommandsIfAdmin(ctx, agentId);

    // Extract referrerId from /start payload
    const { agentId: payloadAgentId, referrerId } = parseStartPayload(ctx);

    // If payload includes agentId, ensure it matches THIS bot's agent
    // (prevents cross-agent referral mixups)
    if (payloadAgentId && payloadAgentId !== agentId) {
      console.warn(
        `[Start] Payload agent mismatch. payload=${payloadAgentId} expected=${agentId} user=${userId}`
      );
    }

    ctx.session = ctx.session || {};
    if (referrerId && referrerId !== userId) {
      ctx.session.referrerId = referrerId;
      // console.log(`Stored referrerId ${referrerId} for user ${userId} in agent ${agentId}`);
    }

    let isRegistered = false;
    try {
      const res = await axios.get(`${process.env.BACKEND_BASE_URL}/api/v1/secured/user-profile/${userId}`, {
        params: { agentId },
        headers: {
          "X-Access-Token": BACKEND_ENDPOINTS_ACCESS_TOKEN ?? "",
        },
      });
      isRegistered = res.data?.success && res.data?.data?.telegramId === userId;
    } catch {}

    // Welcome image
    const config = await getAgentConfig(agentId);
    if (config?.logoName) {
      const logoUrl = /^https?:\/\//.test(config.logoName)
        ? config.logoName
        : `${process.env.APP_URL}/${config.logoName}`;
      await ctx.replyWithPhoto(
        { url: logoUrl },
        { caption: `Welcome to (${config.name})` }
      );
    } else {
      await ctx.reply(`Welcome to (${config?.name ?? "Bingo"})`);
    }

    if (!isRegistered) {
      await ctx.reply(
        "Welcome! Please share your phone number to continue.",
        Markup.keyboard([[Markup.button.contactRequest("Register To Play")]])
          .resize()
          .oneTime(false)
      );

      await ctx.reply(
        "Click this to show share contact",
        Markup.inlineKeyboard([[Markup.button.callback("Register To Play", "cmd_register")]])
      );

      return;
    }

    await showStartMenu(ctx, agentId);
  });

  // ✅ ONLY fires for contact messages (won't block commands)
  bot.on("contact", async (ctx: any) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    const contact = ctx.message?.contact;
    if (!contact?.phone_number) return ctx.reply("Could not get your phone number.");

    const firstName = contact.first_name || ctx.from.first_name;
    if (!firstName) return ctx.reply("Please set a first name in your Telegram profile.");

    const referrerId = ctx.session?.referrerId || null;

    const payload = {
      telegramId: userId,
      firstName,
      lastName: contact.last_name || ctx.from.last_name,
      phoneNumber: contact.phone_number,
      referrerId,
      agentId,
    };

    try {
      const response = await axios.post(`${process.env.BACKEND_BASE_URL}/api/v1/public/user-profile/register`, payload, {
        headers: {
          "X-Access-Token": BACKEND_ENDPOINTS_ACCESS_TOKEN ?? "",
        },
      });

      if (!response.data.success) {
        const errors = response.data.errors;
        if (errors && typeof errors === "object") {
          const errorMessages = Object.entries(errors)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join("\n");
          return ctx.reply(`Registration failed:\n${errorMessages}`);
        }
        return ctx.reply(`Registration failed: ${response.data.message || "Unknown error"}`);
      }

      let welcomeMessage = `Registration complete! Welcome, ${firstName}.`;
      if (referrerId) {
        try {
          const referrerRes = await axios.get(
            `${process.env.BACKEND_BASE_URL}/api/v1/secured/user-profile/${referrerId}`,
            {
              params: { agentId },
              headers: {
                "X-Access-Token": BACKEND_ENDPOINTS_ACCESS_TOKEN ?? "",
              },
            }
          );
          if (referrerRes.data?.success && referrerRes.data?.data?.firstName) {
            welcomeMessage += ` You were referred by ${referrerRes.data.data.firstName}!`;
          }
        } catch {}
      }

      // Clear referrer after registration
      ctx.session.referrerId = null;

      await ctx.reply(welcomeMessage, Markup.removeKeyboard());
      await showStartMenu(ctx, agentId);
    } catch (err: any) {
      console.error("Registration error:", err.response?.data || err.message);
      const errorMsg = err.response?.data?.message || "Failed to register. Please try again.";
      await ctx.reply(errorMsg);
    }
  });
}
