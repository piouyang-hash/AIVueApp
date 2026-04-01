import {accountRequest, withAuth} from "@/utils/request.js";

/**
 * 查询当前登录用户的账户余额
 * 对应后端：GET /account/my/balance
 * 需要携带 JWT token（由 withAuth 自动处理）
 * @returns {Promise<Object>} - 接口响应：{success: boolean, data: BigDecimal(余额数值), msg: string}
 */
export async function getMyAccountBalanceApi() {
    return withAuth(accountRequest, {
        url: '/account/my/balance', // 对应后端接口路径
        method: 'GET', // 必须和后端@GetMapping一致
        // GET请求无需传data，参数从UserContext获取，前端无需传参
    })
}