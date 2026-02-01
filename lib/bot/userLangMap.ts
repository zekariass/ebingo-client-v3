const userLanguageMap = new Map<number, string>()

export function getUserLang(userId?: number) {
  if (!userId) return "am"
  return userLanguageMap.get(userId) || "am"
  // return "en"
}

export function setUserLang(userId: number, lang: string) {
  userLanguageMap.set(userId, lang)
}

export function setUserLangFromCtx(ctx: any, lang: string) {
  const userId = ctx.from?.id
  if (!userId) return
  userLanguageMap.set(userId, lang)
}

export default { getUserLang, setUserLang, setUserLangFromCtx }
