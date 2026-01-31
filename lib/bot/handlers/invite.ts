// import type { Telegraf } from "telegraf"
// import { generateInviteLink } from "../generate-invite-link"

// export function registerInviteHandler(bot: Telegraf, agentId: number) {
//   bot.command("invite", async (ctx: any) => {
//     try {
//       const userId = ctx.from.id
//       if (!userId) return ctx.reply("❌ Could not get your user ID.")

//       const botInfo = await bot.telegram.getMe()
//       const inviteLink = generateInviteLink(botInfo.username, userId)

//       await ctx.reply(`🎉 Invite your friends to Bingo!\n\nShare this link:\n${inviteLink}`)
//     } catch (err: any) {
//       console.error("Error generating invite link:", err)
//       await ctx.reply("❌ Failed to generate invite link. Please try again later.")
//     }
//   })
// }

import type { Telegraf } from "telegraf";
import { generateInviteLink } from "../generate-invite-link";

export function registerInviteHandler(bot: Telegraf, agentId: number) {
  bot.command("invite", async (ctx: any) => {
    try {
      const userId = ctx.from?.id;
      if (!userId) return ctx.reply("❌ Could not get your user ID.");

      const botInfo = await bot.telegram.getMe();
      const inviteLink = generateInviteLink(botInfo.username!, agentId, userId);

      await ctx.reply(`🎉 Invite your friends to Bingo!\n\nShare this link:\n${inviteLink}`);
    } catch (err: any) {
      console.error("Error generating invite link:", err?.response?.data || err?.message || err);
      await ctx.reply("❌ Failed to generate invite link. Please try again later.");
    }
  });
}
