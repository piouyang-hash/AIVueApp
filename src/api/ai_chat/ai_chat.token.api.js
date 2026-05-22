import { aiChatRequest, withAuth } from "@/utils/request.js";

/**
 * 增加用户总可用积分
 * 对应后端：POST /ai/user/point/add
 * 需要携带 JWT token（由 withAuth 自动处理）
 * @returns {Promise<Object>} - 接口响应：{success: boolean, data: 影响行数, msg: string}
 */
export async function addUserPointApi() {
    return withAuth(aiChatRequest, {
        url: '/ai/user/point/add',
        method: 'POST'
    })
}

/**
 * 查询当前登录用户的积分余额
 * 对应后端：GET /ai/user/point/balance
 * 需要携带 JWT token（由 withAuth 自动处理）
 * @returns {Promise<Object>} - 接口响应：{success: boolean, data: 积分余额实体, msg: string}
 */
export async function getUserPointBalanceApi() {
    return withAuth(aiChatRequest, {
        url: '/ai/user/point/balance',
        method: 'GET'
    })
}
