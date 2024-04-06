import { WechatyBuilder } from "wechaty"
import { FileBox } from "file-box"
import { gen } from "./services/models-services/digital-human.js"

import onScan from "./services/bot-services/onScan.js"
import onLogin from "./services/bot-services/onLogin.js"
import onFriendship from "./services/bot-services/onFriendship.js"
import welcome from "./services/bot-services/welcome.js"

welcome()
const bot = WechatyBuilder.build({ name: "BOT" })

bot.on("scan", onScan)
bot.on("login", onLogin)
bot.on("friendship", onFriendship)
bot.on("message", async message => {
    // 判断消息是否来自用户自身
    if (message.self()) {
        return
    }

    // 当接收到"数字人生成"指令时，回复用户并提供示例
    if (message.text() === "数字人生成") {
        // 监听用户发送的消息，准备生成数字人视频
        await message.say(
            "✅已开启数字人生成功能✅\n请输入:\n1.文案(上限10,000字)\n2.媒体文件\n3.数字人性别\n请在发送完之后输入“开始生成”\n例如⬇️"
        )
        const example = FileBox.fromFile("example/example.jpg")
        await message.say(example)
        // 设置当接收到"开始生成"指令时，调用生成数字人视频的函数
        bot.on("message", gen)
    }
})

bot.start().then(() => console.log("Bot started."))
