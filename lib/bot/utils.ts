
//TEST

// import { getActiveAgents } from "../agent-bot-manager"
// import { translations, allowedPaymentHours } from "./translations"
// import { getUserLang } from "./userLangMap"

// export function t(ctx: any, key: string) {
//   const userId = ctx.from?.id
//   const lang = getUserLang(userId)
//   return translations[lang]?.[key] || translations["en"][key] || key
// }


// export const agentsData: Record<number, any> = {
//   1: {
//     name: "Redfox Bingo",
//     adminIds: "1961597377,702124837", 
//     logoName: "logo_redfox.png",
//     supportContact: "support@redfoxbingo.com",
//     supportUsername: "RedfoxSupportBot",
//     supportChannel: "redfoxbingo",
//     bankDetails: {
//       telebirr: {
//         "recieverName": "Mulat Tarekegn Mersha",
//         "phoneNumber": "251918041046",
//       },
//       cbeonline: {
//         "accountName": "Mr Mulat Tarekegn Mersha",
//         "accountNumber": "1000736196372",
//       }
//     },
//     translations: {},
//   },
//   2: {
//     name: "Awash Bingo",
//     adminIds: "1961597377,312661397",
//     logoName: "logo_abex.png",
//     supportContact: "",
//     supportUsername: "AbexSupportBot",
//     supportChannel: "abexbingo",
//     bankDetails: {
//       telebirr: { 
//         "recieverName": "bezawite tadele zenebe",
//         "phoneNumber": "251902493104",
//       },
//       cbeonline: {
//         "accountName": "Bezawit Tadele Zenebe",
//         "accountNumber": "1000210696354",
//       }
//     },
//     translations: {},
//   },

//   4: {
//     name: "Agent 3 Bingo",
//     adminIds: "1961597377,2726262727",
//     logoName: "bot_hero.png",
//     supportContact: "",
//     supportUsername: "AbexSupportBot",
//     supportChannel: "abexbingo",
//     bankDetails: {
//       telebirr: { 
//         "recieverName": "bezawite tadele zenebe",
//         "phoneNumber": "251902493104",
//       },
//       cbeonline: {
//         "accountName": "Bezawit Tadele Zenebe",
//         "accountNumber": "1000210696354",
//       }
//     },
//     translations: {},
//   }
// }





// type Lang = keyof typeof translations;

// export function escapeTelegramHtml(value: unknown) {
//   // Telegram HTML needs &, <, > escaped in dynamic values
//   return String(value)
//     .replaceAll("&", "&amp;")
//     .replaceAll("<", "&lt;")
//     .replaceAll(">", "&gt;");
// }



// export function renderDepositTemplate(
//   lang: Lang,
//   key: string,
//   params: Record<string, unknown> = {}
// ) {
//   const template = translations[lang]?.[key] ?? translations.en?.[key] ?? key;

//   return template.replace(/\{(\w+)\}/g, (_, k) =>
//     params[k] == null ? `{${k}}` : escapeTelegramHtml(params[k])
//   );
// }




// PRODUCTION

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
    adminIds: "1961597377,702124837", 
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
    name: "Awash Bingo",
    adminIds: "1342999830,312661397",
    logoName: "logo_abex.png",
    supportContact: "",
    supportUsername: "awashbingo",
    supportChannel: "awashbingo",
    bankDetails: {
      telebirr: { 
        "recieverName": "bezawite tadele zenebe",
        "phoneNumber": "251902493104",
      },
      cbeonline: {
        "accountName": "Bezawit Tadele Zenebe",
        "accountNumber": "1000210696354",
      }
    },
    translations: {},
  },
  3: {
    name: "Great Bingo",
    adminIds: "7579293471,752191099",
    logoName: "great_bingo.png",
    supportContact: "",
    supportUsername: "Great_BING",
    supportChannel: "Great_BING",
    bankDetails: {
      telebirr: { 
        "recieverName": "Andargachew Awoke Demeke",
        "phoneNumber": "251947061304",
      },
      cbeonline: {
        "accountName": "Andargachew Awoke Demeke",
        "accountNumber": "1000097184546",
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
