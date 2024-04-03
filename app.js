import { WechatyBuilder } from "wechaty"

import onScan from "./services/bot-services/onScan.js"
import onLogin from "./services/bot-services/onLogin.js"
import onFriendship from "./services/bot-services/onFriendship.js"
import onMessage from "./services/bot-services/onMessage.js"
import welcome from "./services/bot-services/welcome.js"

welcome()
const bot = WechatyBuilder.build({ name: "BOT" })

bot.on("scan", onScan)
bot.on("login", onLogin)
bot.on("friendship", onFriendship)
bot.on("message", onMessage)

bot.start().then(() => console.log("Bot started."))
