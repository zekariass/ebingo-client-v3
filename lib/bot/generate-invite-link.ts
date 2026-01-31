// export function generateInviteLink(botUsername: string, telegramId: number | string) {
//   if (!botUsername) throw new Error("Bot username is required.")
//   return `https://t.me/${botUsername}?start=${telegramId}`
// }


export function generateInviteLink(botUsername: string, agentId: number, referrerId: number | string) {
  if (!botUsername) throw new Error("Bot username is required.");
  const payload = `a${agentId}_r${referrerId}`;
  return `https://t.me/${botUsername}?start=${payload}`;
}
