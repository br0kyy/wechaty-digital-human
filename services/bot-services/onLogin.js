/**
 * 处理用户登录事件的函数
 * @param {Object} user 包含用户信息的对象，此对象应至少包含一个名为user的属性，代表用户名
 * @returns 无返回值
 */
const onLogin = async user => {
    // 打印用户登录信息
    console.log(`User ${user.name()} logged in`)
}

export default onLogin;