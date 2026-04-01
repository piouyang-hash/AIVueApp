import {ElMessage} from "element-plus";
import {queryUserConsumeOrderByIdApi} from "@/api/order/consume.api.js";

/**
 * 封装：查询当前用户的单个消费订单
 * 组件仅需传入orderId，自动处理参数校验、异常、提示
 * @param {Number|String} orderId - 消费订单ID（Long类型，支持数字/字符串）
 * @throws {Error} - 查询失败时抛出异常（含错误信息），组件可catch处理
 */
export async function getUserConsumeOrderById(orderId) {
    // 前置参数校验
    if (!orderId || (typeof orderId !== 'number' && typeof orderId !== 'string')) {
        const errorMsg = '消费订单ID不能为空，且必须为数字/字符串类型';
        ElMessage.error(errorMsg);
        throw new Error(errorMsg);
    }

    try {
        // 调用基础API函数
        const res = await queryUserConsumeOrderByIdApi(orderId);

        // 解析返回结果：res.data.data 即为ConsumeRecordVO（后端返回的单个订单VO）
        const consumeRecordVO = res?.data?.data ?? null;

        if (consumeRecordVO) {
            console.log(`查询消费订单${orderId}成功：`, consumeRecordVO);
        } else {
            ElMessage.warning(`未查询到订单${orderId}，或该订单不属于当前用户`);
        }

        return consumeRecordVO; // 返回订单VO（null表示无数据）

    } catch (error) {
        // 统一异常处理：打印日志+抛异常给组件
        console.error(`查询消费订单${orderId}失败：`, error);
        ElMessage.error('查询订单信息失败，请稍后重试');
        // 组件可通过catch捕获此异常，自定义兜底逻辑
        throw error;
    }
}