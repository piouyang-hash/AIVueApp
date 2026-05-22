// ============== 测试：支付宝支付接口 ==============
import {testRequest, withAuth} from "@/utils/request.js";

// ====================== 纯测试：支付宝支付接口（无需登录） ======================
/**
 * 测试专用 - 调用支付宝支付接口
 * 后端地址：POST /alipay/pay
 * 无登录校验、无Token、纯测试使用
 */
export function testAlipayPay() {
    return testRequest({
        url: '/alipay/pay',
        method: 'GET', // 后端改了 GET，这里也要改
        responseType: 'text' // 明确告诉 axios 返回的是文本(HTML)
    })
}