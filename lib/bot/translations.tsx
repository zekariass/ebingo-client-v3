import { changeLanguage } from "i18next"

export const allowedPaymentHours = 96

export const availableLanguages = ["en", "am"]

export const translations: Record<string, Record<string, string>> = {
  en: {
    greeting: "✅ Welcome to Bingo Family!",
    noRooms: "❌ No rooms available right now.",
    fetchError: "❌ Failed to load rooms. Please try again later.",
    chooseRoom: "🎲 Choose a Bingo game room:",
    openingWebview: "🌐 Opening Web View",
    startGame: "🎮 Start Game selected!",
    deposit: "💰 Deposit here:",
    transfer: "🔁 Transfer here:",
    withdraw: "💸 Withdraw here:",
    instructions: "📖 Instructions:",
    support: "🧑‍💻 Contact support:",
    changeLanguageInstructions: "🌐 Select your language:",
    languageChanged: "🌐 Language changed to",
    wallet: "💰 Your Wallet",
    btnBalance: "💵 Wallet Balance",
    btnWebview: "🌐 Web View",
    btnGameRooms: "🎲 Game Rooms",
    btnStartGame: "🎮 Start Game",
    btnDeposit: "💰 Deposit Fund",
    btnTransfer: "🔁 Transfer Fund",
    btnWithdraw: "💸 Withdraw Money",
    btnInstructions: "📖 Instructions",
    nicknameChangeInstructions: "👤 Enter new nickname:",
    btnChangeNickname: "👤 Change Your Nickname",
    invalidNickName: "❌ Invalid nickname entered!",
    nicknameChanged: "✅ Nickname changed successfully",
    nicknameChangeFailed: "❌ Nickname change has failed",
    nicknameChangeError: "❌ Nickname change has failed",
    walletInfo: "💰 *Your Wallet*\n\n• Total Available Balance: *{total}*\n• Withdrawable Balance: *{withdrawable}*",
    walletNotFound: "❌ Wallet not found. Please try again later.",
    walletFetchFailed: "⚠️ Failed to fetch wallet. Please try again later.",
    walletFetchError: "⚠️ An unexpected error occurred while fetching your wallet.",
    chooseCommand: "Choose an option:",
    btnSupport: "🧑‍💻 Have Questions❓ Write us here!",
    btnLanguage: "🌐 Change Bot Language",
    currency: "Birr",
    prev: "⬅️ Prev",
    next: "Next ➡️",
    telebirr: "Telebirr",
    cbeOnlineBank: "CBE Online Banking",
    payTeleInstructions: `<blockquote>Telebirr Deposit Instructions\n\n1️⃣ Open Telebirr and send the payment to: \n\n<code><b>     Phone Numebr: {phone}</b></code>\n<code><b>     Name: {name}</b></code>.\n\n2️⃣ Paste the full confirmation message with the transaction number. \n\n3️⃣ Your balance will be updated in less than 30 seconds </blockquote>`,

    payCBEInstructions: `<blockquote>CBE Online Bank Deposit Instructions\n\n1️⃣ Send the payment in CBE Mobile Banking App to: \n\n<code><b>     Account: {accountNumber}</b></code>\n<code><b>     Name: {name}</b></code>.\n\n2️⃣ Paste the full confirmation message including the transaction reference and your account number.\n\n3️⃣ Your balance will be updated in 30 seconds </blockquote>`,

    telebirrPaymetExpireMessage: `⏰ Your Telebirr payment has expired. Payments must be made within ${allowedPaymentHours} hours. Please try again.`,

    cbeonlinePaymetExpireMessage: `⏰ Your CBE payment has expired. Payments must be made within ${allowedPaymentHours} hours. Please try again.`,

    paymentMethod: "Choose Payment Method:",
  },
  am: {
    greeting: "✅ እንኳን ወደ ቢንጎ ቤተሰብ በደህና መጡ!",
    noRooms: "❌ አሁን ጨዋታዎች አልተገኙም",
    fetchError: "❌ ጨዋታዎችን ማግኘት አልተቻለም። እባክዎ ደግመው ይሞክሩ።",
    chooseRoom: "🎲 ጨዋታዎችን ይምረጡ:",
    openingWebview: "🌐 ድህረገፁ እየተከፈተ ነው",
    startGame: "🎮 ጨዋታ ጀምር",
    deposit: "💰 ገንዘብ አስቀምጥ:",
    transfer: "🔁 ገንዘብ ለጓደኛ ይላኩ:",
    withdraw: "💸 ገንዘብ ያውጡ:",
    instructions: "📖 የጨዋታ መመሪያዎች፡",
    support: "🧑‍💻 ድጋፍ ያግኙ:",
    changeLanguageInstructions: "🌐 ቋንቋ ይምረጡ:",
    languageChanged: "🌐 ቋንቋ ተቀይሯል: ",
    wallet: "💰 ቀሪ ገንዘብ",
    btnBalance: "💵 ቀሪ ገንዘብ",
    btnWebview: "🌐 ድህረገፁን ይክፈቱ",
    btnGameRooms: "🎲 ጨዋታዎች",
    btnStartGame: "🎮 ጨዋታ ጀምር",
    btnDeposit: "💰 ገንዘብ አስቀምጥ",
    btnTransfer: "🔁 ገንዘብ ለጓደኛ ላክ",
    btnWithdraw: "💸 ገንዘብ ያውጡ",
    btnInstructions: "📖 የጨዋታ መመሪያዎች",
    nicknameChangeInstructions: "👤 አዲስ ቅጽል ስም ያስገቡ:",
    btnChangeNickname: "👤 ቅጽል ስም ቀይር",
    invalidNickName: "❌ ያስገቡት ቅጽል ስም ልክ አይደለም",
    nicknameChanged: "✅ ቅጽል ስም በትክክል ተቀይሯል",
    nicknameChangeFailed: "❌ ቅጽል ስም ቅያሪ አልተሳካም",
    nicknameChangeError: "❌ ቅጽል ስም ቅያሪ አልተሳካም",
    walletInfo: "💰 *ያለዎት ገንዝብ*\n\n• አጠቃላይ ቀሪ ገንዘብ: *{total}*\n• የሚወጣ ገንዘብ: *{withdrawable}*",
    walletNotFound: "❌ Wallet not found. Please try again later.",
    walletFetchFailed: "⚠️ Failed to fetch wallet. Please try again later.",
    walletFetchError: "⚠️ An unexpected error occurred while fetching your wallet.",
    btnSupport: "🧑‍💻 ጥያቄ አለዎት❓ በዚህ ይጻፉልን!",
    btnLanguage: "🌐 የቦት ቋንቋ ይቀይሩ",
    chooseCommand: "ይምረጡ፡",
    currency: "ብር",
    prev: "⬅️ ቀዳሚ",
    next: "ቀጣይ ➡️",

    telebirr: "ቴሌብር",
    telebirrTxnNumber: "የቴሌብር Transaction Number ማግኘት አልተቻለም። እባክዎ ከቴሌብር ያገኙትን የክፍያ ማረጋገጫ መልዕክት ሙሉ በሙሉ ያስገቡ እና ይላኩ። እናመሰግናለን!",
    telebirrVerificationFailed: "የቴሌብር ክፍያን ማረጋገጥ አልተቻለም። እባክዎ ትክክለኛውን የቴሌብር የጽሁፍ መልዕክት ያስገቡ!",
    cbeOnlineBank: "ንግድ ባንክ",
    
    payTeleInstructions:"<blockquote>የቴሌብር ክፍያ መመሪያ፡\n\n1️⃣ ክፍያውን በ ቴሌብር መተግበሪያ ወደ ስልክ ቁጥር ይላኩ:\n\n<code><b>     ስልክ ቁጥር፡ 0918041046</b></code>\n<code><b>     ስም፡ ሙላት ታረቀኝ</b></code> \n\n2️⃣ የቴሌብር ክፍያ ማረጋገጫ መልእክት ሲደርስዎት ሙሉ በሙሉ Copy ያድርጉና፣ ታች ባለው መጻፊያ ላይ Paste አድርገው ይላኩት። \n\n3️⃣ በ30 ሰከንድ ውስጥ Approve ይሆንልዎታል</blockquote>",

    payCBEInstructions:"<blockquote>የንግድ ባንክ ክፍያ መመሪያ፡\n\n1️⃣ ክፍያውን በንግድ ባንክ ሞባይል መተግበሪያ በሚቀጥለው አካውንት ቁጥር ይላኩ፡\n\n<code><b>     አካውንት ቁጥር፡ 1000736196372</b></code>\n<code><b>     ስም፡ ሙላት ታረቀኝ</b></code>\n\n2️⃣ የCBE ክፍያ ማረጋገጫ መልእክት ሲደርስዎት ሙሉ በሙሉ Copy ያድርጉና፣ ታች ባለው መጻፊያ ላይ Paste አድርገው ይላኩት። \n\n3️⃣ በ30 ሰከንድ ውስጥ Approve ይሆንልዎታል</blockquote>",

    cbeTxnNumber: "የንግድ ባንክ FT ቁጥር ማግኘት አልተቻለም። እባክዎ ከንግድ ባንክ የደረስዎትን የክፍያ ማረጋገጫ መልዕክት ሙሉ በሙሉ ያስገቡ እና ይላኩ። እናመሰግናለን!",

    cbeVerificationFailed: "የንግድ ባንክ ክፍያን ማረጋገጥ አልተቻለም። እባክዎ ትክክለኛውን ክንግድ ባንክ የደረስዎትን የጽሁፍ መልዕክት ያስገቡ!",

    pastePaymentMessage: "እባክዎ የክፍያዎን *ማረጋገጫ መልእክት* ሙሉ በሙሉ Copy ያድርጉና፣ ታች ባለው መጻፊያ ላይ Paste አድርገው ይላኩት። በ30 ሰከንድ ውስጥ Approve ይሆንልዎታል 👇👇👇👇 \n\n ችግር ካጋጠምዎት የማረጋገጫ መልእክቱን ደጋግመው ይላኩት. ምክንያቱም ችግሩ የሲስተም መጨናነቅ ሊሆን ስለሚችል ነው። \n\nወይም ይጻፉልን እና ወዲያውኑ እንፈታልዎታለን።",

    paymentSessionExpired: "🕐 እባክዎ ደግመው *Paste Payment Message* ይጫኑ።",
    paymentMethod: "የክፍያ አማራጭ ይምረጡ፡",

    telebirrPaymetExpireMessage: `የቴሌብር ክፍያ ${allowedPaymentHours} ሰዓት አልፎታል። እባክዎ በ 24 ሰዓት ውስጥ የተከፈለ መሆኑን ያረጋግጡ።`,

    cbeonlinePaymetExpireMessage: `የንግድ ባንክ ክፍያ ${allowedPaymentHours} ሰዓት አልፎታል። እባክዎ በ 24 ሰዓት ውስጥ የተከፈለ መሆኑን ያረጋግጡ።`

  }
}
