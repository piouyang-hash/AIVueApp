import {
    addUserPointApi,
    getUserPointBalanceApi,
} from "@/api/ai_chat/ai_chat.token.api.js";
import { handleApiResponse } from "@/api/constants/ApiFunctionCommon.js";

// ===================== 封装后的工具函数（组件可直接调用） =====================
/**
 * 增加用户总可用积分
 * @returns {number} - 成功返回数据库影响行数，失败抛出错误
 */
export async function addUserPoint() {
    return handleApiResponse(addUserPointApi);
}

/**
 * 查询当前用户的积分余额
 * @returns {Object} - 成功返回积分余额信息，失败抛出错误
 */
export async function getUserPointBalance() {
    return handleApiResponse(getUserPointBalanceApi);
}
