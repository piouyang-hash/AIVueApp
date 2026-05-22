import {getAiRechargeGoodsDetailApi, getAiRechargeGoodsListApi} from "@/api/order/ai_chat.goods.api.js";
import {handleApiResponse} from "@/api/constants/ApiFunctionCommon.js";

/**
 * 查询充值商品详情 - 业务封装
 * @param {string | number} id - 商品ID
 * @returns {Object} - 成功返回商品详情，失败抛出错误
 */
export async function getAiRechargeGoodsDetail(id) {
    return handleApiResponse(getAiRechargeGoodsDetailApi, id);
}

/**
 * 查询所有启用的积分充值商品列表 - 业务封装
 * @returns {Array<Object>} - 成功返回充值商品列表，失败抛出错误
 */
export async function getAiRechargeGoodsList() {
    return handleApiResponse(getAiRechargeGoodsListApi);
}