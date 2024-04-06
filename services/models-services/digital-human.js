import fs from "fs"
import { v4 as uuidv4 } from "uuid" 

import { callApi } from "../../utils/digital_tools.js"
import { FileBox } from "file-box" 

// 初始化输入参数
var userText = "" // 用户提供的文本
var fileBox = null // 用户提供的文件盒
var file_path = null // 文件路径
var gender = null // 生成数字人的性别
/**
 * 生成数字人的异步函数。
 * @param {object} message - 用户的消息对象。
 */
async function gen(message) {
    if (message.text() === "开始生成") {
        try {
            // 准备文件流，并调用API生成数字人视频
            const fileData = fs.createReadStream(file_path)
            await message.say("正在生成数字人，请稍后...") // 给用户反馈，表示程序正在运行
            const apiResponse = await callApi(userText, fileData, gender) // 调用API，传入用户文本、文件流和性别，获取生成的视频数据
            const name = uuidv4() // 生成唯一的文件名
            const videoFile = FileBox.fromBuffer(apiResponse, name + ".mp4") // 将视频数据封装成文件盒
            await message.say(videoFile) // 将生成的数字人视频发送给用户
            return
        } catch (error) {
            message.say("生成数字人时出错，请稍后再试。")
            console.error("生成数字人时出错：", error.message)
            return
        }
    } else if (message.text() === "男" || message.text() === "女") {
        // 处理用户选择的性别
        if (message.text() === "男") {
            gender = 1
        } else {
            gender = 2
        }
    } else if (message.type() === 7) {
        // 处理用户发送的文本消息
        userText = await message.text()
    } else if (message.type() === 6 || message.type() === 15) {
        // 处理用户发送的图片或视频消息，保存到临时文件夹
        fileBox = await message.toFileBox()
        file_path = "temp/input/" + fileBox.name
        fileBox.toFile(file_path)
    }
}

export { gen } 
