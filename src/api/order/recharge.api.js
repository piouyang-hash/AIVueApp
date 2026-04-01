import {orderRequest, withAuth} from "@/utils/request.js";

/**
 * 获取充值金额配置（需携带JWT token，对应后端@CheckJwt）
 */
export async function getRechargeAmountsApi() {
    return withAuth(orderRequest, {
        url: '/api/order/recharge/amounts', // 完整接口路径：前缀 + 接口名
        method: 'GET' // 对应后端 @GetMapping，必须用 GET 请求
    })
}

/**
 * 创建充值订单（测试阶段 Mock 支付成功）
 * 对应后端：POST /api/order/recharge/create
 * 需要携带 JWT token（由 withAuth 自动处理）
 */
export async function createRechargeOrderApi(rechargeCreateDTO) {
    return withAuth(orderRequest, {
        url: '/api/order/recharge/create',
        method: 'POST',
        data: rechargeCreateDTO   // 直接传整个对象，不关心里面有什么字段
    })
}

/**
 * 更新充值订单支付方式
 * 对应后端：PUT /api/order/recharge/update-pay-type
 * 需要携带 JWT token（由 withAuth 自动处理）
 * @param {Object} updatePayTypeDTO - 更新支付方式参数
 * @param {Number} updatePayTypeDTO.orderId - 充值订单ID（创建订单接口返回的雪花ID）
 * @param {Number} updatePayTypeDTO.payType - 支付类型：1=微信 2=支付宝（前端传数字，后端自动转枚举）
 * @returns {Promise<Object>} - 接口响应：{success: boolean, data: boolean, msg: string}
 */
export async function updateRechargeOrderPayTypeApi(updatePayTypeDTO) {
    return withAuth(orderRequest, {
        url: '/api/order/recharge/update-pay-type', // 后端接口路径，和创建订单同前缀
        method: 'PUT', // 必须和后端@PutMapping一致
        data: updatePayTypeDTO // 传订单ID+支付类型，结构和后端RechargeUpdatePayTypeDTO对应
    })
}

/**
 * 查询充值订单详情（底层API函数，不建议组件直接调用）
 * 对应后端：GET /api/order/recharge/detail/{orderId}
 * 需要携带 JWT token（由 withAuth 自动处理）
 * @param {String} orderId - 充值订单表主键ID（雪花ID字符串，必填，需为数字组成的有效字符串）
 * @returns {Promise<Object>} - 接口响应：{success: boolean, data: RechargeRecordVO, msg: string}
 *   RechargeRecordVO 包含字段：orderId（字符串）、amount（充值金额）、payType（支付类型：1=微信/2=支付宝）、status（订单状态）、createTime（创建时间）等订单详情字段
 */
export async function getRechargeOrderDetailApi(orderId) {
    // 前置参数校验（适配字符串类型的雪花ID）
    if (
        !orderId || // 非空校验
        typeof orderId !== 'string' || // 必须是字符串类型
        orderId.trim() === '' || // 排除空字符串/全空格
        isNaN(Number(orderId)) || // 确保是数字组成的字符串（雪花ID特征）
        Number(orderId) <= 0 // 确保转换为数字后大于0
    ) {
        throw new Error('查询订单详情失败：订单ID必须是数字组成的非空有效字符串（雪花ID）');
    }

    return withAuth(orderRequest, {
        url: `/api/order/recharge/detail/${orderId}`, // 直接拼接字符串ID，后端自动兼容
        method: 'GET', // 严格对应后端@GetMapping
        // GET请求无需传data，参数通过URL路径传递
    })
}

/**
 * 模拟账户流水结果回调（前端手动触发，用于测试支付回调）
 * 对应后端：POST /api/order/recharge/flow-result
 * 需要携带 JWT token（由 withAuth 自动处理）
 */
export async function simulateFlowResultCallbackApi(callbackDTO) {
    return withAuth(orderRequest, {
        url: '/api/order/recharge/flow-result',
        method: 'POST',
        data: callbackDTO   // 直接传整个对象，不关心字段
    })
}