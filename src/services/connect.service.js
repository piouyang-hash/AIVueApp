import {APP_CONSTANTS} from "@/api/constants/appType.js";
import {initWsConnectApi} from "@/api/connect/heartbeat.api.js";

/**
 * 【Service层】初始化用户WS连接地址（自动填充appType，组件无参数调用）
 * @returns {Promise<string>} - 直接返回WS连接地址字符串（简化组件调用）
 */
export async function initWsConnectService() {
    try {
        // 自动从环境变量获取appType，无需组件传参
        const appType = APP_CONSTANTS.APP_TYPE
        if (!appType) {
            throw new Error('应用类型未配置（VITE_APP_TYPE），无法初始化WS连接')
        }

        // 调用接口（自动填充appType，和logout格式完全一致）
        const response = await initWsConnectApi(appType)

        // 统一返回连接地址（简化组件处理）
        if (response.data.code === 200) {
            return response.data.data // 直接返回WS连接地址字符串
        } else {
            throw new Error(`初始化WS连接失败：${response.data.msg}`)
        }
    } catch (error) {
        console.error('WS连接地址获取失败：', error)
        throw error // 抛出错误，让组件可捕获处理
    }
}