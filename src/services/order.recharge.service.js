import {
    createRechargeOrderApi,
    getRechargeAmountsApi, getRechargeOrderDetailApi,
    simulateFlowResultCallbackApi, updateRechargeOrderPayTypeApi
} from "@/api/order/recharge.api.js";

/**
 * 【组件调用】获取充值金额配置（处理错误 + 提取res.data.data）
 * @returns {Promise<any>} 返回res.data.data（组件直接用的核心数据）
 * @throws {Error} 抛出统一的错误信息，方便组件catch处理
 */
export async function fetchRechargeAmounts() {
    try {
        // 调用底层接口
        const res = await getRechargeAmountsApi();

        // 1. 校验响应结构（避免后端返回异常导致组件报错）
        if (!res || !res.data) {
            throw new Error('获取充值金额配置失败：响应数据格式异常');
        }

        // 2. 提取组件需要的核心数据：res.data.data

        // 可选：如果后端有业务错误码（比如code !== 200），这里统一处理
        // if (res.data.code !== 200) {
        //     throw new Error(res.data.msg || '获取充值金额配置失败');
        // }

        // 3. 返回核心数据，组件直接用
        return res.data.data;

    } catch (error) {
        // 统一错误处理：打印日志 + 抛出友好错误
        const errorMsg = error.message || '获取充值金额配置失败，请稍后重试';
        console.error('获取充值金额配置异常：', error);

        // 抛出错误，让组件可以catch并处理（比如提示用户）
        throw new Error(errorMsg);
    }
}

/**
 * 【组件调用】创建充值订单并完成充值（测试阶段 Mock 成功）
 * 组件只需传最关心的参数：金额、备注（可选）
 * 注：支付方式相关逻辑由专门接口独立处理，本方法无需传入支付类型
 * @param amount 充值金额（必填，大于0）
 * @param remark 备注（可选）
 * @returns {Promise<?>} 返回充值订单ID
 * @throws {Error} 统一错误信息
 */
export async function createRechargeOrder(
    amount,
    remark,
) {
    // 在这里组装成后端需要的 DTO 对象（移除支付类型参数）
    const rechargeCreateDTO = {
        amount,
        remark
    };

    try {
        const res = await createRechargeOrderApi(rechargeCreateDTO);

        if (!res || !res.data) {
            throw new Error('创建充值订单失败：响应数据格式异常');
        }

        if (res.data.code !== 200) {
            throw new Error(res.data.msg || '创建充值订单失败');
        }

        // 返回订单ID
        return res.data.data;

    } catch (error) {
        const errorMsg = error.message || '充值失败，请稍后重试';
        console.error('创建充值订单异常：', error);

        if (error.message.includes('401') || error.message.includes('403')) {
            throw new Error('登录状态失效，请重新登录');
        }

        throw new Error(errorMsg);
    }
}

/**
 * 【组件调用】更新充值订单支付方式（封装上层函数，简化入参）
 * 内部自动组装DTO并调用底层API，组件只需传订单号+支付方式即可
 * @param {String} orderId - 充值订单ID（创建订单接口返回的雪花ID字符串，必填）
 * @param {Number} payType - 支付类型：1=微信 2=支付宝（仅支持这两个值，必填）
 * @returns {Promise<Object>} - 统一响应格式
 *   成功：{success: true, data: true, msg: '支付方式更新成功'}
 *   失败：{success: false, data: false, msg: '错误提示信息'}
 * @throws {Error} - 参数校验失败或接口调用异常时抛出统一错误
 */
export async function updateRechargeOrderPayType(orderId, payType) {
    // 1. 前置参数校验（适配字符串类型的雪花ID）
    if (
        !orderId || // 非空校验
        typeof orderId !== 'string' || // 必须是字符串类型
        orderId.trim() === '' || // 排除空字符串/全空格
        isNaN(Number(orderId)) || // 确保是数字组成的字符串（雪花ID特征）
        Number(orderId) <= 0 // 确保转换为数字后大于0
    ) {
        throw new Error('更新支付方式失败：订单ID必须是数字组成的非空有效字符串（雪花ID）');
    }
    if (![1, 2].includes(payType)) {
        throw new Error('更新支付方式失败：支付类型仅支持1（微信）、2（支付宝）');
    }

    // 2. 自动组装后端需要的DTO对象（组件无需关心DTO结构）
    const updatePayTypeDTO = {
        orderId: orderId, // 直接传字符串，后端会自动转为Long处理
        payType: payType
    };

    try {
        // 3. 调用底层API并返回响应
        const response = await updateRechargeOrderPayTypeApi(updatePayTypeDTO);
        // 统一响应格式兜底（防止后端返回格式不一致）
        return {
            success: response.success ?? false,
            data: response.data ?? false,
            msg: response.msg || (response.success ? '支付方式更新成功' : '支付方式更新失败')
        };
    } catch (error) {
        // 4. 统一异常处理（组件可直接捕获或使用）
        const errorMsg = error.message || '更新支付方式失败，请稍后重试';
        console.error('更新充值订单支付方式异常：', error);
        // 抛出标准化错误，组件可try/catch捕获
        throw new Error(errorMsg);
    }
}

/**
 * 【组件调用】查询充值订单详情（封装上层函数，直接返回后端VO数据）
 * 内部调用底层API，简化返回值，直接返回res.data.data（后端RechargeRecordVO）
 * @param {String} orderId - 充值订单表主键ID（雪花ID字符串，必填，需为数字组成的有效字符串）
 * @returns {Promise<Object>} - 直接返回后端的RechargeRecordVO数据（订单详情）
 *   包含字段：orderId（字符串）、amount、payType、status、createTime、updateTime等
 * @throws {Error} - 参数错误/接口调用失败时抛出统一友好错误
 */
export async function getRechargeOrderDetail(orderId) {
    // 1. 前置参数校验（适配字符串类型的雪花ID）
    if (
        !orderId || // 非空校验
        typeof orderId !== 'string' || // 必须是字符串类型
        orderId.trim() === '' || // 排除空字符串/全空格
        isNaN(Number(orderId)) || // 确保是数字组成的字符串（雪花ID特征）
        Number(orderId) <= 0 // 确保转换为数字后大于0
    ) {
        throw new Error('查询订单详情失败：订单ID必须是数字组成的非空有效字符串（雪花ID）');
    }

    try {
        // 2. 调用底层API（直接传字符串，底层拼接URL时自动处理）
        const res = await getRechargeOrderDetailApi(orderId);

        // 3. 响应格式校验（避免后端返回异常格式）
        if (!res || !res.data) {
            throw new Error('查询订单详情失败：后端响应数据格式异常');
        }

        // 4. 校验后端业务状态（非200/成功状态则抛错）
        if (res.data.code !== 200 && !res.success) {
            throw new Error(res.data.msg || '查询订单详情失败');
        }

        // 5. 直接返回后端VO数据（res.data.data）
        return res.data.data;
    } catch (error) {
        // 6. 统一异常处理（兼容401/403等鉴权错误）
        const errorMsg = error.message || '查询订单详情失败，请稍后重试';
        console.error('查询充值订单详情异常：', error);

        // 鉴权错误特殊处理（和你现有逻辑一致）
        if (errorMsg.includes('401') || errorMsg.includes('403')) {
            throw new Error('登录状态失效，请重新登录');
        }

        // 抛出最终友好错误
        throw new Error(errorMsg);
    }
}

/**
 * 【组件调用】手动模拟支付回调结果
 * 用于测试环境：前端手动触发回调，模拟支付成功或失败
 * @param orderId 订单ID（必填）
 * @param callbackType 回调类型：'SUCCESS' | 'FAIL'（必填）
 * @param failReason 失败原因（仅当 callbackType 为 'FAIL' 时建议填写，可选）
 * @param flowId 模拟流水ID（可选，后端当前不处理）
 * @returns {Promise<boolean>} 返回 true 表示回调成功（后端业务处理正常），false 表示回调失败
 * @throws {Error} 网络错误、权限问题等会抛出异常
 */
export async function simulateFlowResultCallback(
    orderId,
    callbackType,
    failReason,
    flowId,
) {
    // 内部组装 DTO
    const callbackDTO = {
        orderId,
        callbackType,
        failReason: failReason || '',
        flowId: flowId || ''
    };

    try {
        const res = await simulateFlowResultCallbackApi(callbackDTO);

        // 响应结构校验
        if (!res || !res.data) {
            throw new Error('回调请求失败：响应数据格式异常');
        }

// 重点：判断后端业务是否成功（code === 200）
        if (res.data.code === 200) {
            // 回调成功（后端已接收并处理）
            return true;
        } else {
            // 回调失败（后端返回业务错误，如参数非法、订单不存在等）
            const msg = res.data.msg || '回调处理失败';
            throw new Error(msg);
        }

    } catch (error) {
        const errorMsg = error.message || '模拟回调请求失败，请稍后重试';
        console.error('模拟支付回调异常：', error);

        // 常见错误细化提示
        if (error.message.includes('401') || error.message.includes('403')) {
            throw new Error('登录状态失效，请重新登录');
        }

        throw new Error(errorMsg);
    }
}