import FormData from "form-data"
import cfg from "../config/dev.js"
import axios from "axios"


/**
 * 异步生成语音文件的函数
 * @param {string} text 要转换为语音的文字内容
 * @param {File} file 要合并到语音文件的背景音乐文件
 * @param {string} gender 语音的性别类型（例如：'male', 'female'）
 * @returns {Promise<ArrayBuffer>} 返回一个Promise，解析为生成的语音文件的ArrayBuffer
 */
async function generator(text, file, gender) {
	// 创建FormData对象以附加我们的数据
	const form = new FormData()
	form.append("text", text)
	form.append("file", file) // 将文件添加到表单
	form.append("gender", gender) // 添加性别字段

	try {
		// 配置axios请求
		const config = {
			method: "post", // 使用POST方法
			maxBodyLength: Infinity, // 设置请求体的最大长度为无限
			url: `${cfg.digital_human.url}`, // API的URL
			headers: {
				...form.getHeaders(), // 自动获取并设置表单的headers
			},
			data: form, // 设置请求体数据为我们的表单
			responseType: "arraybuffer", // 将响应数据以字节数组形式返回
		}

		// 发起请求并等待响应
		const response = await axios.request(config)
		return response.data // 返回响应数据
	} catch (error) {
		console.error("下载视频时出错:", error) // 在发生错误时打印错误信息
		// 根据错误类型进行更详细的错误处理
		if (error.response) {
			// 请求已发送，但是服务器返回了错误
			console.error("服务器返回错误:", error.response.status)
		} else if (error.request) {
			// 请求发送失败，可能是网络问题
			console.error("请求发送失败:", error.request)
		} else {
			// 其他错误
			console.error("其他错误:", error.message)
		}

		throw error // 抛出错误，让调用者处理
	}
}

/**
 * 使用Axios发送带有表单数据的POST请求，进行人脸替换操作。
 * @param {File} source - 源图片文件，要替换的人脸图片。
 * @param {File} target - 目标图片文件，用来替换的人脸图片。
 * @param {string} typ - 操作类型，定义如何进行人脸替换。
 * @returns {Promise<ArrayBuffer>} 返回一个Promise，解析为服务器返回的字节数组。
 */
async function faceSwap(source, target, typ) {
	// 创建FormData对象，用于封装我们的请求数据
	const form = new FormData()
	form.append("source", source)
	form.append("target", target)
	form.append("typ", typ)

	try {
		// 配置axios请求设置
		const config = {
			method: "post", // 使用POST方法发送请求
			maxBodyLength: Infinity, // 设置请求体的最大长度为无限
			url: `${cfg.face_swap.url}`, // 定义请求的URL
			headers: {
				...form.getHeaders(), // 自动获取并设置表单的headers
			},
			data: form, // 将我们的FormData对象设置为请求体
			responseType: "arraybuffer", // 期望响应的数据类型为arraybuffer
		}

		// 发起HTTP请求并等待响应
		const response = await axios.request(config)
		return response.data // 返回从服务器获取的数据
	} catch (error) {
		console.error("替换人脸时出错:", error) // 打印错误信息
		// 根据错误的类型输出更详细的错误信息
		if (error.response) {
			// 请求已发送但服务器返回错误
			console.error("服务器返回错误:", error.response.status)
		} else if (error.request) {
			// 请求发送失败，可能是网络问题
			console.error("请求发送失败:", error.request)
		} else {
			// 其他类型的错误
			console.error("其他错误:", error.message)
		}

		throw error // 抛出错误，让调用者处理
	}
}

export { generator, faceSwap }
