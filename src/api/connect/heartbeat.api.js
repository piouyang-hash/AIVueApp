import { connectRequest, withAuth } from '@/utils/request'

/**
 * 初始化用户WS连接地址（需登录）
 * @param {string} appType - 应用类型枚举值，可选：APP/PC/H5（对应后端01/02/03）
 * @returns {Promise<AxiosResponse>} - 响应结果，data为WS连接地址
 */
export async function initWsConnectApi(appType) {
    return withAuth(connectRequest, {
        url: '/user/ws/init-connect', // 后端接口路径，有前缀则补充（如：/api/connect/init-connect）
        method: 'POST',       // 和后端@PostMapping严格对应
        params: { appType }   // 对应后端@RequestParam的appType参数（查询参数）
    })
}