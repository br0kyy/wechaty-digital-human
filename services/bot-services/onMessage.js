import { FileBox } from "file-box"
import { gen } from "./services/models-services/digital-human.js"
/**
 * 当接收到消息时触发的异步函数。
 * @param {Object} message - 接收到的消息对象。
 * 该函数主要负责处理非自身发送的消息，并在接收到特定指令时，回复用户并引导其使用数字人生成功能。
 */
async function onMessage(message) {
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
}

export default onMessage
