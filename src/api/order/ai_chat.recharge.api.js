import { aiChatRequest, withAuth } from "@/utils/request.js";

/**
 * 查询积分充值档位（金额数组）
 * 对应后端：GET /ai/user/point/recharge/tiers
 * 需要携带 JWT token（由 withAuth 自动处理）
 * @returns {Promise<Object>} - 接口响应：{success: boolean, data: [5,10,20,100,200], msg: string}
 */
export async function getRechargeTiersApi() {
    return withAuth(aiChatRequest, {
        url: '/ai/recharge/order/recharge/tiers',
        method: 'GET'
    })
}

/**
 * 创建AI积分充值订单
 * 对应后端：POST /ai/recharge/order/create
 * @param {Object} dto - 后端DTO对象 { amount: number }
 * @returns {Promise<Object>} - 响应：{success: boolean, data: 订单号, msg: string}
 */
export async function createAiRechargeOrderApi(dto) {
    return withAuth(aiChatRequest, {
        url: `/ai/recharge/order/create`,
        method: 'POST',
        // 传递完整DTO对象
        data: dto
    })
}

/**
 * 查询AI充值订单详情 - 底层接口请求
 * 对应后端：GET /ai/recharge/order/detail/{orderId}
 * @param {string | number} orderId - 订单ID
 * @returns {Promise<Object>} - 响应：{success: boolean, data: 订单详情, msg: string}
 */
export async function getAiRechargeOrderDetailApi(orderId) {
    return withAuth(aiChatRequest, {
        url: `/ai/recharge/order/detail/${orderId}`,
        method: 'GET'
    })
}

/**
 * 查询当前用户所有AI充值订单列表
 * 对应后端：GET /ai/recharge/order/list
 * @returns {Promise<Object>} - 响应：{success: boolean, data: 订单列表, msg: string}
 */
export async function getAiRechargeOrderListApi() {
    return withAuth(aiChatRequest, {
        url: `/ai/recharge/order/list`,
        method: 'GET'
    })
}

/**
 * 查询当前用户待支付AI充值订单
 * 对应后端：GET /ai/recharge/order/unpaid/detail
 * @returns {Promise<Object>} - 响应：{success: boolean, data: 待支付订单, msg: string}
 */
export async function getUnpaidRechargeOrderApi() {
    return withAuth(aiChatRequest, {
        url: `/ai/recharge/order/unpaid/detail`,
        method: 'GET'
    })
}

/**
 * 关闭待支付AI充值订单 - 底层接口请求
 * 对应后端：POST /ai/recharge/order/close
 * @param {string | number} id - 待支付订单ID
 * @returns {Promise<Object>} - 响应：{success: boolean, data: null, msg: string}
 */
export async function closeUnpaidRechargeOrderApi(id) {
    return withAuth(aiChatRequest, {
        url: `/ai/recharge/order/close`,
        method: 'POST',
        params: { id }
    })
}