import {aiChatRequest, withAuth} from "@/utils/request.js";

/**
 * 查询充值商品详情 - 底层接口请求
 * 对应后端：GET /ai/recharge/goods/detail/{id}
 * @param {string | number} id - 商品ID
 * @returns {Promise<Object>} - 响应：{success: boolean, data: 商品详情, msg: string}
 */
export async function getAiRechargeGoodsDetailApi(id) {
    return withAuth(aiChatRequest, {
        url: `/ai/recharge/goods/detail/${id}`,
        method: 'GET'
    })
}

/**
 * 查询所有启用的AI充值商品列表
 * 对应后端：GET /ai/recharge/goods/list
 * @returns {Promise<Object>} - 响应：{success: boolean, data: 商品列表, msg: string}
 */
export async function getAiRechargeGoodsListApi() {
    return withAuth(aiChatRequest, {
        url: `/ai/recharge/goods/list`,
        method: 'GET'
    })
}