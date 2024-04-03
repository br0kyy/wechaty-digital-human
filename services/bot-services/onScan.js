import qrTerm from "qrcode-terminal"
/**
 * 当扫描二维码操作完成时调用的函数。
 * @param {string} qrcode - 生成的二维码代码。
 * @param {number} status - 扫描的状态码，用于表示扫描操作的成功或失败。
 */
const onScan = qrcode => {
	// 生成一个小型的二维码
	qrTerm.generate(qrcode, { small: true })
}

export default onScan
