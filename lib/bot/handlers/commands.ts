import { Markup } from "telegraf"
import type { Telegraf } from "telegraf"
import { getUserLang, setUserLang } from "../userLangMap"
import { availableLanguages, translations } from "../translations"
import { agentsData, t } from "../utils"
import { showRooms } from "./rooms"
import axios from "axios"

const languageFullName = {
  en: "English",
  am: "Amharic",
}

function getTranslationForLang(lang: string, key: string) {
  return translations[lang]?.[key] || translations["am"][key] || key
}

function getUserLangFromCtx(ctx: any) {
  return getUserLang(ctx.from?.id) || "am"
}


export async function showStartMenu(ctx: any, agentId: number) {
  const lang = getUserLangFromCtx(ctx)

  await ctx.reply(
    getTranslationForLang(lang, "chooseCommand"),
    Markup.inlineKeyboard([
      // [Markup.button.callback(getTranslationForLang(lang, "btnGameRooms"), "cmd_gamerooms")],
      // [Markup.button.callback(getTranslationForLang(lang, "btnBalance"), "my_wallet")],
      // [Markup.button.callback(getTranslationForLang(lang, "btnDeposit"), "cmd_deposit")],
      // [Markup.button.callback(getTranslationForLang(lang, "btnWithdraw"), "cmd_withdraw")],
      // [Markup.button.callback(getTranslationForLang(lang, "btnTransfer"), "cmd_transfer")],
      // [Markup.button.callback(getTranslationForLang(lang, "btnWebview"), "cmd_webview")],
      // [Markup.button.callback(getTranslationForLang(lang, "btnInstructions"), "cmd_instructions")],
      // [
      //   Markup.button.callback(getTranslationForLang(lang, "btnSupport"), "cmd_support"),
      //   Markup.button.callback(getTranslationForLang(lang, "btnLanguage"), "cmd_language"),
      // ],

      [
          Markup.button.callback(getTranslationForLang(lang, "btnStartGame"), 'cmd_gamerooms'),
          // Markup.button.callback(tr.btnGameRooms, 'cmd_gamerooms'),
          Markup.button.webApp(getTranslationForLang(lang, "btnWebview"), `${process.env.APP_URL}/en/game-options?agentId=${agentId}`),
        ],
    
        // Row 3 (three buttons)
        [
          Markup.button.callback(getTranslationForLang(lang, "btnDeposit"), `cmd_deposit`),
          Markup.button.webApp(getTranslationForLang(lang, "btnWithdraw"), `${process.env.APP_URL}/en/withdraw?agentId=${agentId}`),
          Markup.button.webApp(getTranslationForLang(lang, "btnTransfer"), `${process.env.APP_URL}/en/transfer?agentId=${agentId}`),
          
        ],
    
        // Row 4
        [
            Markup.button.callback(getTranslationForLang(lang, "btnBalance"), `my_wallet`)
        ],
    
        // Row 5
        [
            Markup.button.webApp(getTranslationForLang(lang, "btnInstructions"), `${process.env.APP_URL}/en/instructions?agentId=${agentId}`),
            Markup.button.callback(getTranslationForLang(lang, "btnChangeNickname"), `change_name`)
    
        ],
    
        // Row 6 (two buttons)
        [
          Markup.button.callback(getTranslationForLang(lang, "btnLanguage"), 'cmd_language'),
        ],
        [
          // Markup.button.url(tr.btnSupport, 'https://t.me/M104610'),
          Markup.button.url(getTranslationForLang(lang, "btnSupport"), `https://t.me/${agentsData[agentId].supportChannel}?direct`),
        ],

        [Markup.button.url("🔔 Join Channel For Notification", `https://t.me/${agentsData[agentId].supportChannel}`)],
    ]),
  )
}


export function registerCommandHandlers(bot: Telegraf, agentId: number) {
  

  bot.action("cmd_webview", async (ctx: any) => {
    await ctx.answerCbQuery()
    const lang = getUserLangFromCtx(ctx)
    await ctx.reply(
      getTranslationForLang(lang, "openingWebview"),
      Markup.inlineKeyboard([Markup.button.webApp("Open Web", `${process.env.APP_URL}/${lang}?agentId=${agentId}`)]),
    )
  })

  bot.action("cmd_gamerooms", async (ctx: any) => {
    await ctx.answerCbQuery()
    await showRooms(ctx, 1, agentId)
  })

  bot.action("cmd_startgame", async (ctx: any) => {
    await ctx.answerCbQuery()
    await showStartMenu(ctx, agentId)
  })

  bot.action("cmd_deposit", async (ctx) => {
    await ctx.answerCbQuery()
    await ctx.reply(`💰 ${t(ctx, "paymentMethod")}`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: t(ctx, "telebirr"), callback_data: "deposit.telebirr" }],
          [{ text: t(ctx, "cbeOnlineBank"), callback_data: "deposit.cbeonline" }],
        ],
      },
    })
  })

  bot.action("cmd_transfer", async (ctx: any) => {
    await ctx.answerCbQuery()
    const lang = getUserLangFromCtx(ctx)
    await ctx.reply(
      getTranslationForLang(lang, "transfer"),
      Markup.inlineKeyboard([
        Markup.button.webApp("Transfer Fund", `${process.env.APP_URL}/${lang}/transfer?agentId=${agentId}`),
      ]),
    )
  })

  bot.action("cmd_withdraw", async (ctx: any) => {
    await ctx.answerCbQuery()
    const lang = getUserLangFromCtx(ctx)
    await ctx.reply(
      getTranslationForLang(lang, "withdraw"),
      Markup.inlineKeyboard([
        Markup.button.webApp("Withdraw Money", `${process.env.APP_URL}/${lang}/withdraw?agentId=${agentId}`),
      ]),
    )
  })

  bot.action("cmd_instructions", async (ctx: any) => {
    await ctx.answerCbQuery()
    const lang = getUserLangFromCtx(ctx)
    await ctx.reply(
      getTranslationForLang(lang, "instructions"),
      Markup.inlineKeyboard([
        Markup.button.webApp("How to Play", `${process.env.APP_URL}/${lang}/instructions?agentId=${agentId}`),
      ]),
    )
  })

  bot.action("cmd_language", async (ctx: any) => {
    const lang = getUserLangFromCtx(ctx)
    await ctx.answerCbQuery()
    const inlineButtons = ["am", "en"].map((lang) => Markup.button.callback(lang.toUpperCase(), `set_language_${lang}`))
    await ctx.reply(getTranslationForLang(lang, "changeLanguageInstructions"), Markup.inlineKeyboard(inlineButtons, { columns: 2 }))
  })

  bot.action(/set_language_(.+)/, async (ctx) => {
    await ctx.answerCbQuery()
    const selectedLang = ctx.match?.[1]
    const userId = ctx.from?.id
    if (!userId || !selectedLang) return
    setUserLang(userId, selectedLang)
    const langKey = selectedLang as keyof typeof languageFullName
    await ctx.reply(`${t(ctx, "languageChanged")} ${languageFullName[langKey]}`)
    await showStartMenu(ctx, agentId)
  })

  bot.command("register", async (ctx: any) => {
    const userId = ctx.from.id

    let isRegistered = false
    try {
      const res = await axios.get(`${process.env.BACKEND_BASE_URL}/api/v1/secured/user-profile/${userId}`, {
        params: { agentId },
      })
      isRegistered = res.data?.success && res.data?.data?.telegramId === userId
    } catch (err) {
      console.error("Error checking registration")
    }

    if (isRegistered) {
      return ctx.reply("✅ You are already registered and can play anytime!")
    }

    await ctx.reply(
      "👋 Please share your phone number to register and start playing!",
      Markup.keyboard([[Markup.button.contactRequest("📱 Share Phone Number")]])
        .resize()
        .oneTime(false),
    )
  })

  bot.command("webview", async (ctx) => {
    await ctx.reply(
      t(ctx, "openingWebview"),
      Markup.inlineKeyboard([
        Markup.button.webApp("Open Web", `${process.env.APP_URL}/${getUserLangFromCtx(ctx)}?agentId=${agentId}`),
      ]),
    )
  })

  bot.command("menu", async (ctx) => await showStartMenu(ctx, agentId))
  bot.command("gamerooms", async (ctx) => await showRooms(ctx, 1, agentId))
  bot.command("startgame", async (ctx) => await showRooms(ctx, 1, agentId))
 
  bot.command('wallet', async (ctx) => await ctx.reply(t(ctx, 'wallet'), Markup.inlineKeyboard([
    Markup.button.callback(t(ctx, 'btnBalance'), `my_wallet`)
  ])));

  bot.command("withdraw", async (ctx: any) => {
    const lang = getUserLangFromCtx(ctx);
    await ctx.reply(
      getTranslationForLang(lang, "withdraw"),
      Markup.inlineKeyboard([
        Markup.button.webApp(
          "Withdraw Money",
          `${process.env.APP_URL}/${lang}/withdraw?agentId=${agentId}`
        ),
      ])
    );
  });

  bot.command('support', async (ctx) => {
      await ctx.reply(
        t(ctx, 'support'),
        Markup.inlineKeyboard([
          Markup.button.url(
            'Get Support',
            `https://t.me/${agentsData[agentId].supportUsername}?direct` // replace with your private Telegram username
          )
        ])
      );
    });

    bot.command('instructions', async (ctx) => await ctx.reply(t(ctx, 'instructions'), Markup.inlineKeyboard([
      Markup.button.webApp('How to Play', `${process.env.APP_URL}/${getUserLangFromCtx(ctx)}/instructions`)
    ])));

    bot.command('language', async (ctx) => {
      const lang = getUserLangFromCtx(ctx);
      const inlineButtons = availableLanguages.map(lang =>
        Markup.button.callback(lang.toUpperCase(), `set_language_${lang}`)
      );
      await ctx.reply(`${getTranslationForLang(lang, "changeLanguageInstructions")}`, Markup.inlineKeyboard(inlineButtons, { columns: 2 }));
    });
}
