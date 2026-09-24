import { Markup } from "telegraf";
import type { Telegraf, Context } from "telegraf";
import { AGENT_THEMES, DEFAULT_THEME_KEY, isThemeKey } from "../../themes";
import { getAgentConfig } from "../agent-config";
import { escapeTelegramHtml } from "../utils";

const API_BASE_URL = process.env.BACKEND_BASE_URL!;
const TOKEN = process.env.BACKEND_ENDPOINTS_ACCESS_TOKEN;
const PAGE_SIZE = 10; // 5 rows x 2 columns

function headers() {
  return {
    "Content-Type": "application/json",
    "X-Access-Token": TOKEN ?? "",
  };
}

interface AgentConfigDto {
  agentId?: number | null;
  name?: string | null;
  adminIds?: string | null;
  logoName?: string | null;
  supportContact?: string | null;
  supportUsername?: string | null;
  supportChannel?: string | null;
  bankDetails?: Record<string, any> | null;
  themeKey?: string | null;
}

async function fetchConfig(agentId: number): Promise<AgentConfigDto | null> {
  const res = await fetch(`${API_BASE_URL}/api/v1/admin/agents/${agentId}/config`, {
    headers: headers(),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json?.data ?? null;
}

// PUT is replace-semantics on the backend, so send the whole config back
// with only themeKey changed — otherwise other fields get nulled.
// Whitelist only the updatable fields: the GET response includes read-only
// fields like agentId, which the backend rejects on deserialization.
async function saveTheme(agentId: number, themeKey: string): Promise<boolean> {
  const current = (await fetchConfig(agentId)) ?? {};
  const res = await fetch(`${API_BASE_URL}/api/v1/admin/agents/${agentId}/config`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({
      name: current.name ?? null,
      adminIds: current.adminIds ?? null,
      logoName: current.logoName ?? null,
      supportContact: current.supportContact ?? null,
      supportUsername: current.supportUsername ?? null,
      supportChannel: current.supportChannel ?? null,
      bankDetails: current.bankDetails ?? null,
      themeKey,
    }),
  });
  return res.ok;
}

function previewUrl(agentId: number, themeKey: string) {
  return `${process.env.APP_URL}/en?agentId=${agentId}&theme=${themeKey}`;
}

function themeKeyboard(current: string, page: number) {
  const total = Math.ceil(AGENT_THEMES.length / PAGE_SIZE);
  const pageItems = AGENT_THEMES.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const rows = [];
  for (let i = 0; i < pageItems.length; i += 2) {
    const pair = pageItems.slice(i, i + 2).map((t) =>
      Markup.button.callback(
        `${t.key === current ? "✅ " : ""}${t.label}`,
        `theme_set_${t.key}`
      )
    );
    rows.push(pair);
  }

  const nav = [];
  if (page > 0) nav.push(Markup.button.callback("◀️ Prev", `theme_pg_${page - 1}`));
  nav.push(Markup.button.callback(`${page + 1}/${total}`, "theme_noop"));
  if (page < total - 1) nav.push(Markup.button.callback("Next ▶️", `theme_pg_${page + 1}`));
  rows.push(nav);

  return Markup.inlineKeyboard(rows);
}

export function registerThemeHandler(bot: Telegraf<Context>, agentId: number) {
  async function isAdmin(userId: number): Promise<boolean> {
    const config = await getAgentConfig(agentId);
    const adminIds = (config?.adminIds || "")
      .split(",")
      .map((id: string) => Number(id.trim()))
      .filter((n: number) => Number.isFinite(n) && n > 0);
    return adminIds.includes(userId);
  }

  async function menuText(): Promise<string> {
    const cfg = await fetchConfig(agentId);
    const current = isThemeKey(cfg?.themeKey) ? cfg!.themeKey! : DEFAULT_THEME_KEY;
    const label = AGENT_THEMES.find((t) => t.key === current)?.label ?? current;
    return (
      `🎨 <b>App Theme — Agent ${escapeTelegramHtml(agentId)}</b>\n\n` +
      `Current: <b>${escapeTelegramHtml(label)}</b> (<code>${current}</code>)\n\n` +
      "Pick a theme below — it applies to your web app instantly.\n" +
      `Preview any theme: <code>/theme &lt;key&gt;</code>`
    );
  }

  bot.command("theme", async (ctx) => {
    try {
      const userId = ctx.from?.id;
      console.log(`[/theme] command from user ${userId} on agent ${agentId}`);
      if (!userId) return;
      if (!(await isAdmin(userId))) {
        return ctx.reply("🚫 You are not authorized. This command is for agent admins.");
      }

      // /theme <key> — direct set
      const arg = ctx.message.text.split(/\s+/)[1]?.trim().toLowerCase();
      if (arg) {
      if (!isThemeKey(arg)) {
        return ctx.reply(
          `⚠️ Unknown theme <code>${escapeTelegramHtml(arg)}</code>. Use /theme to browse the list.`,
          { parse_mode: "HTML" }
        );
      }
      if (!(await saveTheme(agentId, arg))) {
        return ctx.reply("❌ Couldn't save the theme. Try again later.");
      }
      const label = AGENT_THEMES.find((t) => t.key === arg)?.label ?? arg;
      return ctx.reply(
        `✅ Theme set to <b>${escapeTelegramHtml(label)}</b>.\n` +
          `Preview: ${previewUrl(agentId, arg)}`,
        { parse_mode: "HTML" }
      );
    }

      const cfg = await fetchConfig(agentId);
      const current = isThemeKey(cfg?.themeKey) ? cfg!.themeKey! : DEFAULT_THEME_KEY;
      const page = Math.max(0, Math.floor(AGENT_THEMES.findIndex((t) => t.key === current) / PAGE_SIZE));
      await ctx.reply(await menuText(), {
        parse_mode: "HTML",
        ...themeKeyboard(current, page),
      });
    } catch (err) {
      console.error(`[/theme] error for agent ${agentId}:`, err);
      await ctx.reply("❌ Something went wrong loading themes. Check server logs.").catch(() => {});
    }
  });

  bot.action("theme_noop", async (ctx) => ctx.answerCbQuery());

  bot.action(/^theme_pg_(\d+)$/, async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId || !(await isAdmin(userId))) {
      return ctx.answerCbQuery("Not authorized");
    }
    const page = Number(ctx.match[1]);
    const cfg = await fetchConfig(agentId);
    const current = isThemeKey(cfg?.themeKey) ? cfg!.themeKey! : DEFAULT_THEME_KEY;
    await ctx.answerCbQuery();
    await ctx.editMessageReplyMarkup(themeKeyboard(current, page).reply_markup);
  });

  bot.action(/^theme_set_([a-z0-9-]+)$/, async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId || !(await isAdmin(userId))) {
      return ctx.answerCbQuery("Not authorized");
    }
    const key = ctx.match[1];
    if (!isThemeKey(key)) {
      return ctx.answerCbQuery("Unknown theme");
    }
    if (!(await saveTheme(agentId, key))) {
      return ctx.answerCbQuery("Save failed — try again");
    }
    const label = AGENT_THEMES.find((t) => t.key === key)?.label ?? key;
    await ctx.answerCbQuery(`Theme: ${label}`);
    await ctx.editMessageText(
      `🎨 <b>App Theme — Agent ${escapeTelegramHtml(agentId)}</b>\n\n` +
        `Current: <b>${escapeTelegramHtml(label)}</b> (<code>${key}</code>)\n\n` +
        `✅ Saved. Preview: ${previewUrl(agentId, key)}\n` +
        `Use /theme to change it again.`,
      { parse_mode: "HTML" }
    );
  });
}
