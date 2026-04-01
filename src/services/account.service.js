import {getMyAccountBalanceApi} from "@/api/account/my.account.api.js";

/**
 * 封装后的查询当前用户余额接口
 * 组件可直接调用，自动处理错误提示，返回干净的余额数值
 * @returns {Promise<number|null>} - 成功返回余额数值（如 100.00），失败返回null
 */
export async function fetchMyAccountBalance() {
    try {
        // 调用原始接口
        const res = await getMyAccountBalanceApi()

        // 统一响应处理：先判断接口是否请求成功
        if (res) {
            // 提取核心的余额金额（res.data.data 对应后端返回的BigDecimal）
            const balance = res.data?.data || 0
            // 可选：成功提示（如果不需要可删除）
            // ElMessage.success('余额查询成功')
            return Number(balance) // 转为数字类型，方便前端计算/展示
        } else {
            // 接口返回失败（如账户不存在）
            const errorMsg = res?.msg || '余额查询失败'
            console.error(errorMsg)
            return null
        }
    } catch (error) {
        // 捕获网络错误、Token失效等异常
        console.error('查询余额异常：', error)
        // 区分不同异常类型，给出友好提示
        const errorMsg = error?.response?.data?.msg
            || error?.message
            || '网络异常，余额查询失败，请稍后重试'
        console.error(errorMsg)
        return null
    }
}