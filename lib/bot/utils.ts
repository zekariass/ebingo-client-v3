import { getActiveAgents } from "../agent-bot-manager"
import { translations, allowedPaymentHours } from "./translations"
import { getUserLang } from "./userLangMap"

export function t(ctx: any, key: string) {
  const userId = ctx.from?.id
  const lang = getUserLang(userId)
  return translations[lang]?.[key] || translations["en"][key] || key
}


export const agentsData: Record<number, any> = {
  1: {
    name: "Redfox Bingo",
    adminIds: "1961597377,987654321",
    logoName: "logo_redfox.png",
    supportContact: "support@redfoxbingo.com",
    supportUsername: "RedfoxSupportBot",
    supportChannel: "redfoxbingo",
    bankDetails: {
      telebirr: {
        "recieverName": "Mulat Tarekegn Mersha",
        "phoneNumber": "251918041046",
      },
      cbeonline: {
        "accountName": "Mr Mulat Tarekegn Mersha",
        "accountNumber": "1000736196372",
      }
    },
    translations: {},
  },
  2: {
    name: "Abex Bingo",
    adminIds: "1961597377,6655443322",
    logoName: "logo_abex.png",
    supportContact: "",
    supportUsername: "AbexSupportBot",
    supportChannel: "abexbingo",
    bankDetails: {
      telebirr: {
        "recieverName": "Abebaw Yohannes",
        "phoneNumber": "0923456789",
      },
      cbeonline: {
        "accountName": "Abebaw Yohannes",
        "accountNumber": "1000123456789",
      }
    },
    translations: {},
  }
}





type Lang = keyof typeof translations;

export function escapeTelegramHtml(value: unknown) {
  // Telegram HTML needs &, <, > escaped in dynamic values
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}



export function renderDepositTemplate(
  lang: Lang,
  key: string,
  params: Record<string, unknown> = {}
) {
  const template = translations[lang]?.[key] ?? translations.en?.[key] ?? key;

  return template.replace(/\{(\w+)\}/g, (_, k) =>
    params[k] == null ? `{${k}}` : escapeTelegramHtml(params[k])
  );
}
