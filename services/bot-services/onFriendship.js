/**
 * 监听并自动处理好友添加事件
 * @param {Object} friendship - 好友对象。
 */
async function onFriendship(friendship) {
	// 初始化日志消息变量
	let logMessage
	// 加载文件助手联系人
	const fileHelper = bot.Contact.load("filehelper")
	// 引用Friendship类以供后续判断与操作

	try {
		// 记录接收到的好友请求事件源
		logMessage = "Received friend request from " + friendship.contact().name()
		await fileHelper.say(logMessage)
		console.log(logMessage)

		// 根据不同的好友关系事件类型进行处理
		switch (friendship.type()) {
			/**
			 * 1. 新的好友请求
			 *
			 * 当接收到好友请求时，可以通过`request.hello`获取验证消息，
			 * 并通过`request.accept()`来接受这个请求
			 */
			case bot.Friendship.Type.Receive:
				if (friendship.hello() === "ding") {
					logMessage =
						'Accepted automatically because the verification message is "ding"'
					console.log("Before accepting the request...")
					await friendship.accept()

					// 若需发送欢迎消息，需稍作延迟
					const welcomeMessage =
						"早上中午晚上好！\n我是你的数字人生成小助手！\n向我发送“数字人生成”开始使用吧！"
					await new Promise((resolve) => setTimeout(resolve, 3000))

					try {
						await friendship.contact().say(welcomeMessage)
						console.log("Welcome message sent successfully.")
					} catch (error) {
						logMessage = "Failed to send welcome message: " + error.message
						console.error(logMessage)
					}
					console.log("After accepting the request...")
				} else {
					logMessage =
						"Not auto-accepted; the verification message was: " +
						friendship.hello()
				}
				break

			/**
			 * 2. 好友关系已确认
			 */
			case bot.Friendship.Type.Confirm:
				logMessage = "Friendship confirmed with " + friendship.contact().name()
				break
		}
	} catch (error) {
		logMessage = error.message
	}

	// 输出最终日志消息并在控制台显示及发送给文件助手
	console.log(logMessage)
	await fileHelper.say(logMessage)
}

export default onFriendship
