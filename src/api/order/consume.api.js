import {orderRequest, withAuth} from "@/utils/request.js";

/**
 * 查询当前登录用户的单个消费订单
 * 对应后端：GET /api/order/consume/orders/{orderId}
 * 需要携带 JWT Token（由 withAuth 自动处理）
 * @param {Number|String} orderId - 消费订单ID（Long类型，支持数字/字符串）
 * @returns {Promise<Object>} - 接口响应：{success: boolean, data: ConsumeRecordVO, msg: string}
 * @description 注意：
 * 1. 用户身份从Token解析，前端无需传userId；
 * 2. 仅返回当前用户名下的订单，非本人订单/不存在订单返回null；
 * 3. res.data.data 为 ConsumeRecordVO 完整对象；
 * 4. consumeSubType 仅在 businessType=2 时有效。
 */
export async function queryUserConsumeOrderByIdApi(orderId) {
    // 路径参数拼接（后端要求@PathVariable传orderId）
    const url = `/api/order/consume/orders/${orderId}`;
    return withAuth(orderRequest, {
        url: url,
        method: 'GET', // 与后端@GetMapping一致
        // GET请求无需传data，路径参数已拼入url
    });
}