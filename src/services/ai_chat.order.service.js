import {
    closeUnpaidRechargeOrderApi,
    createAiRechargeOrderApi,
    getAiRechargeOrderDetailApi,
    getAiRechargeOrderListApi, getRechargeTiersApi, getUnpaidRechargeOrderApi
} from "@/api/order/ai_chat.recharge.api.js";
import {handleApiResponse} from "@/api/constants/ApiFunctionCommon.js";

/**
 * 查询积分充值档位（金额数组）
 * @returns {Array<number>} - 成功返回充值金额列表 [5,10,20,100,200]，失败抛出错误
 */
export async function getRechargeTiers() {
    return handleApiResponse(getRechargeTiersApi);
}

/**
 * 创建AI积分充值订单 - 业务封装
 * @param {string} goodId - 充值商品ID（如："1000000000000000001"）
 * @returns {Object} - 成功返回订单号，失败抛出错误
 */
export async function createAiRechargeOrder(goodsId) {
    // 🔥 构建后端所需的DTO对象：将amount改为goodId（适配后端商品ID参数）
    const dto = {
        goodsId
    };
    return handleApiResponse(createAiRechargeOrderApi, dto);
}

/**
 * 查询AI充值订单详情 - 业务封装
 * @param {string | number} orderId - 订单ID
 * @returns {Object} - 成功返回订单详情，失败抛出错误
 */
export async function getAiRechargeOrderDetail(orderId) {
    return handleApiResponse(getAiRechargeOrderDetailApi, orderId);
}

/**
 * 查询当前用户所有AI充值订单列表（业务封装）
 * @returns {Object} - 成功返回订单列表，失败抛出错误
 */
export async function getAiRechargeOrderList() {
    return handleApiResponse(getAiRechargeOrderListApi);
}

/**
 * 查询当前用户待支付AI充值订单（业务封装）
 * @returns {Object} - 成功返回待支付订单，失败抛出错误
 */
export async function getUnpaidRechargeOrder() {
    return handleApiResponse(getUnpaidRechargeOrderApi);
}

/**
 * 关闭待支付AI充值订单（业务封装）
 * @param {string | number} id - 待支付订单ID
 * @returns {null} - 成功无返回数据，失败抛出错误
 */
export async function closeUnpaidRechargeOrder(id) {
    return handleApiResponse(closeUnpaidRechargeOrderApi, id);
}