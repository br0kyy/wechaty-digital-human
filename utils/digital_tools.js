import FormData from "form-data"
import cfg from "../config/config.js"
import axios from "axios"

/**
 * 异步调用API函数
 * @param {string} text 要传递的文本参数
 * @param {string} file 要上传的文件路径
 * @param {int} gender 数字人性别
 * @returns {Promise<any>} 返回API响应数据的Promise
 */
async function callApi(text, file, gender) {
	// 创建一个FormData对象来附加我们的数据
	const form = new FormData()
	form.append("text", text)
	form.append("file", file) // 将文件添加到表单
	form.append("gender", gender) // 添加性别字段

	try {
		// 配置axios请求
		const config = {
			method: "post", // 使用POST方法
			maxBodyLength: Infinity, // 设置请求体的最大长度为无限
			url: `${cfg.digital_human.url}/api/videos/syth/`, // API的URL
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



export { callApi }
