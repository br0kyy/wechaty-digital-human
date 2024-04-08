import { WechatyBuilder } from "wechaty"
import { FileBox } from "file-box"
import fs from "fs"
import { v4 as uuidv4 } from "uuid"

import { generator, faceSwap } from "./utils/digital_tools.js"

import onScan from "./services/bot-services/onScan.js"
import onLogin from "./services/bot-services/onLogin.js"
import onFriendship from "./services/bot-services/onFriendship.js"
import welcome from "./services/bot-services/welcome.js"

welcome()
const bot = WechatyBuilder.build({ name: "BOT" })

var model = null
/*******************************************初始化 <数字人生成> 输入参数************************************************ */
var userText = null // 用户提供的文本
var gender = null // 生成数字人的性别

var input_path = null // 用于生成的视频/图片路径
var face_path = null // 人脸图片路径
var media_path = null // 目标文件路径

var faceData = null
var mediaData = null
var fileData = null

var face = null
var media = null
var input = null

var FACE_SWAP = -1 // 是否进行人脸替换

/*************************************************主函数************************************************************** */
bot.on("scan", onScan)
bot.on("login", onLogin)
bot.on("friendship", onFriendship)
bot.on("message", async (message) => {
	// 判断消息是否来自用户自身
	if (message.self()) {
		return
	}
	const user = message.talker()

	/***
	 * 数字人生成功能
	 */
	if (message.text() === "数字人生成") {
		model = 1
		console.log("数字人生成功能\nmodel = 1")
		// 监听用户发送的消息，准备生成数字人视频
		await message.say(`✅已开启数字人生成功能✅\n用户：${user.name()}`)
		await message.say("是否需要进行人脸替换\n请输入“是/否”")

		// 接收媒体文件（包含脸部替换模块）
	} else if (model === 1 && message.text() === "是") {
		FACE_SWAP = 1
		await message.say("请发送用于更换的人脸图片")
	} else if (model === 1 && message.text() === "否") {
		FACE_SWAP = 0
		await message.say("请发送媒体文件")
	} else if (model === 1 && FACE_SWAP === -1) {
		await message.say("是否需要进行人脸替换\n请输入“是/否”")
	} else if (
		model === 1 &&
		message.type() === 6 &&
		FACE_SWAP === 1 &&
		!face_path
	) {
		// 接收并处理用户发送的人脸图片
		face = await message.toFileBox()
		face_path = "file/digital_human/face/" + face.name
		await face.toFile(face_path)
		console.log(`face_path:${face_path}`)
		faceData = fs.createReadStream(face_path)
		await message.say("请发送媒体文件")
	} else if (
		model === 1 &&
		(message.type() === 6 || message.type() === 15) &&
		FACE_SWAP === 1 &&
		face_path &&
		!media_path
	) {
		// 接收并处理用户发送的媒体文件，进行人脸替换
		media = await message.toFileBox()
		media_path = "file/digital_human/media/" + media.name
		await media.toFile(media_path)
		console.log(`media_path:${media_path}`)
		mediaData = fs.createReadStream(media_path)
		await message.say("正在替换人脸请稍后！")
		input_path = "file/digital_human/input/" + media.name
		console.log(`input_path:${input_path}`)

		if (message.type() === 6) {
			// 处理图片类型媒体文件
			const timetamp = Date.now()
			const response = await faceSwap(faceData, mediaData, 6)
			const name = user.name() + "_" + timetamp + "_" + "input" // 生成唯一的文件名
			var inputFile = FileBox.fromBuffer(response, name + ".png")
		} else {
			// 处理视频类型媒体文件
			const timetamp = Date.now()
			const response = await faceSwap(faceData, mediaData, 15)
			const name = user.name() + "_" + timetamp + "_" + "input" // 生成唯一的文件名
			var inputFile = FileBox.fromBuffer(response, name + ".mp4")
		}
		inputFile.toFile(input_path)
		await message.say("人脸替换完成！")
		await message.say(inputFile)
		await message.say("请输入文案（上限10,000字）")
	} else if (model === 1 && message.type() === 6 && FACE_SWAP === 0) {
		// 接收不需要人脸替换的媒体文件
		input = await message.toFileBox()
		input_path = "file/digital_human/input/" + input.name
		input.toFile(input_path)
		await message.say("请输入文案（上限10,000字）")

		// 接收文案
	} else if (
		model === 1 &&
		message.type() === 7 &&
		FACE_SWAP != -1 &&
		input_path &&
		!userText
	) {
		userText = message.text()
		await message.say("请输入数字人性别")

		// 接收性别，开始合成
	} else if (
		model === 1 &&
		message.type() === 7 &&
		FACE_SWAP != -1 &&
		input_path &&
		(message.text() === "男" || message.text() === "女") &&
		userText
	) {
		// 根据用户输入的性别进行数字人视频合成
		gender = message.text() === "男" ? 1 : 2
		await message.say("正在生成数字人，请稍后...")

		fileData = fs.createReadStream(input_path)
		var response = await generator(userText, fileData, gender)
		const timetamp = Date.now()
		const name = user.name() + "_" + timetamp + "_" + "output" // 生成唯一的文件名
		const videoFile = FileBox.fromBuffer(response, name + ".mp4") // 将视频数据封装成文件盒
		await message.say(videoFile) // 将生成的数字人视频发送给用户
	}

	/***
	 * 换脸功能
	 */
	if (message.text() === "换脸") {
		model = 2
		console.log("换脸功能\nmodel = 2")
		// 监听用户发送的消息，准备生成数字人视频
		await message.say(`✅已开启换脸功能✅\n用户：${user.name()}`)

		await message.say("请发送用于更换的人脸图片")
	} else if (model === 2 && message.type() === 6 && !face_path) {
		// 接收并处理用户发送的人脸图片
		face = await message.toFileBox()
		face_path = "file/digital_human/face/" + face.name
		await face.toFile(face_path)
		console.log(`face_path:${face_path}`)

		faceData = fs.createReadStream(face_path)
		await message.say("请发送需要更换人脸的图片/视频")
	} else if (
		model === 2 &&
		(message.type() === 6 || message.type() === 15) &&
		face_path &&
		!media_path
	) {
		// 接收并处理用户发送的需要更换人脸的媒体文件
		media = await message.toFileBox()
		media_path = "file/digital_human/media/" + media.name
		await media.toFile(media_path)
		console.log(`media_path:${media_path}`)

		mediaData = fs.createReadStream(media_path)
		await message.say("正在替换人脸请稍后！")
		input_path = "file/digital_human/input/" + media.name
		console.log(`input_path:${input_path}`)

		if (message.type() === 6) {
			// 处理图片类型媒体文件
			const response = await faceSwap(faceData, mediaData, 6)
			const name = uuidv4() // 生成唯一的文件名
			var inputFile = FileBox.fromBuffer(response, name + ".png")
		} else {
			// 处理视频类型媒体文件
			const response = await faceSwap(faceData, mediaData, 15)
			const name = uuidv4() // 生成唯一的文件名
			var inputFile = FileBox.fromBuffer(response, name + ".mp4")
		}
		inputFile.toFile(input_path)
		await message.say("人脸替换完成！")
		await message.say(inputFile)
		return
	}
})

bot.start().then(() => console.log("Bot started."))
