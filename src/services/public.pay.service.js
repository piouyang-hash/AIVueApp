import {
    consumeOrderPayApi,
    createConsumeOrderApi,
    generateConsumeOrderTokenApi,
    getBookPayInfoByFileHashApi, updateConsumeOrderPayTypeApi
} from "@/api/book/public.pay.api.js";
import {CONSUME_BIZ_TYPE} from "@/api/constants/consumeBizType.js";

/**
 * 根据文件哈希获取书籍支付信息（直接返回BookPayVO对象）
 * @param {string} fileHash - 书籍文件哈希值
 * @returns {Promise<Object|null>} 书籍支付信息对象（BookPayVO），失败返回null
 */
export const getBookPayInfoByFileHash = async (fileHash) => {
    try {
        // 调用底层API接口
        const response = await getBookPayInfoByFileHashApi(fileHash)
        // 直接返回AppResponse中的核心data（后端返回的BookPayVO）
        return response.data?.data || null
    } catch (error) {
        console.error('根据哈希获取书籍支付信息失败：', error.message)
        // 失败时返回null，避免上层组件因异常崩溃
        return null
    }
}

/**
 * 【业务逻辑层】生成订单Token（组件直接调用，封装参数处理 + 枚举对比校验）
 * @param {number} businessId - 业务ID（书籍ID/会员套餐ID，需>0）
 * @param {Object} bizType - 业务类型（必须是consumeBizType.js中CONSUME_BIZ_TYPE的枚举项，如CONSUME_BIZ_TYPE.BOOK）
 * @returns {Promise<string>} 生成的订单Token字符串
 */
export async function generateOrderToken(businessId, bizType) {
    // ========== 1. 提取枚举中的有效bizCode（用于对比校验） ==========
    const validBizCodes = Object.values(CONSUME_BIZ_TYPE).map(item => item.bizCode);
    const validBizTypes = Object.values(CONSUME_BIZ_TYPE); // 枚举的所有有效项

    // ========== 2. 增强参数校验（核心：和consumeBizType.js枚举对比） ==========
    // 校验业务ID
    if (!businessId || typeof businessId !== 'number' || businessId <= 0) {
        throw new Error('业务ID必须为大于0的数字（书籍ID/会员套餐ID）');
    }
    // 校验bizType是否是枚举中的有效项（核心对比逻辑）
    if (!bizType) {
        throw new Error('业务类型不能为空，请传入consumeBizType.js中的CONSUME_BIZ_TYPE枚举项（如CONSUME_BIZ_TYPE.BOOK）');
    }
    if (!validBizTypes.includes(bizType)) {
        throw new Error(`业务类型无效，仅支持：${JSON.stringify(validBizTypes.map(item => item.desc))}`);
    }
    // 兜底校验bizCode（防止枚举项格式错误）
    if (!bizType.bizCode || !validBizCodes.includes(bizType.bizCode)) {
        throw new Error(`业务类型的bizCode无效，仅支持：${validBizCodes.join('、')}`);
    }

    // ========== 3. 组装接口请求参数（确保bizKey和枚举一致） ==========
    const requestData = {
        businessId,
        bizKey: bizType.bizCode // 严格使用枚举中的bizCode，避免硬编码
    };

    // ========== 4. 调用接口并返回核心数据 ==========
    try {
        const res = await generateConsumeOrderTokenApi(requestData);
        // 适配后端AppResponse格式：{ code:200, msg:'xxx', data:'token' }
        if (res.data?.code !== 200) {
            throw new Error(res.msg || '生成订单Token失败');
        }
        return res.data?.data; // 组件直接拿到token字符串
    } catch (error) {
        console.error('生成订单Token异常：', error);
        throw new Error(`生成Token失败：${error.message}`);
    }
}

/**
 * 【业务封装】创建购买书籍的消费订单（自动填充bizCode=book，语义化参数）
 * @param {number} bookId - 书籍ID（原businessId，语义化处理，必须>0）
 * @param {string} orderToken - 订单令牌（从生成Token接口获取，必填）
 * @param {string} [remark] - 订单备注（可选，如"购买《Java编程思想》"）
 * @returns {Promise<AppResponse<string>>} 返回创建结果（data为订单ID字符串）
 */
export async function createBookConsumeOrder(bookId, orderToken, remark) {
    // 1. 参数校验（语义化提示，更贴合书籍订单场景）
    if (!bookId || typeof bookId !== 'number' || bookId <= 0) {
        throw new Error('书籍ID必须为大于0的数字（如1001）');
    }
    if (!orderToken || typeof orderToken !== 'string' || orderToken.trim() === '') {
        throw new Error('订单令牌不能为空，请先调用生成Token接口获取');
    }

    // 2. 组装底层接口请求参数（自动填充书籍场景的bizCode）
    const requestData = {
        bizCode: 'book', // 固定填充：购买书籍的业务标识，无需组件传入
        businessId: bookId, // 语义化映射：bookId → businessId
        orderToken: orderToken.trim(), // 去除首尾空格，避免无效字符
        ...(remark && { remark }) // 备注可选，有值才传入
    };

    // 3. 调用底层创建订单接口并返回结果
    try {
        console.log('开始创建书籍消费订单，书籍ID：', bookId);
        const res = await createConsumeOrderApi(requestData);
        console.log('书籍消费订单创建成功，订单ID：', res.data?.data);
        return res.data?.data;
    } catch (error) {
        console.error('创建书籍消费订单失败：', error);
        // 语义化错误提示，方便组件捕获
        throw new Error(`创建书籍订单失败：${error.message || '请检查参数或网络后重试'}`);
    }
}

/**
 * 封装：更新消费订单支付方式为「余额支付」（BALANCE）
 * 组件可直接调用，仅需传入订单ID，支付方式固定为余额（对应后端PayTypeEnum.BALANCE）
 * @param {Number|String} orderId - 消费订单ID（雪花ID/数字ID，自动转为Number）
 * @returns {Promise<Boolean>} - 返回是否更新成功（true=成功，false=失败）
 * @throws {Error} - 更新失败时抛出异常（含错误信息），组件可catch处理
 */
export async function updateConsumeOrderToBalancePay(orderId) {
    // 前置参数校验
    if (!orderId || (typeof orderId !== 'number' && typeof orderId !== 'string')) {
        const errorMsg = '订单ID不能为空，且必须为数字/字符串类型';
        throw new Error(errorMsg);
    }

    try {
        // 构造请求参数：支付方式固定为3（对应后端BALANCE枚举）
        const updatePayTypeDTO = {
            orderId: orderId, // 统一转为Number，适配后端参数类型
            payType: 3 // BALANCE=3，写死为余额支付
        };

        // 调用基础API函数
        const res = await updateConsumeOrderPayTypeApi(updatePayTypeDTO);

        // 解析返回结果：成功取res.data.data，失败抛异常
        const isSuccess = res?.data?.data ?? false;
        if (isSuccess) {
            console.log(res?.data?.data);
        } else {
            const failMsg = res?.msg || '更新支付方式失败，请稍后重试';
            throw new Error(failMsg);
        }

        return isSuccess; // 返回是否更新成功

    } catch (error) {
        // 统一异常处理：打印日志+抛异常给组件
        console.error('更新消费订单为余额支付失败：', error);
        // 组件可通过catch捕获此异常，自定义处理逻辑
        throw error;
    }
}

/**
 * 封装：消费订单余额支付（触发TCC事务）
 * 组件仅需传入orderId，payType固定为"BALANCE"（对应后端要求）
 * @param {Number|String} orderId - 消费订单ID（long类型/字符串，自动转为Number）
 * @returns {Promise<Boolean>} - 返回支付请求是否受理成功（true=成功，false=失败）
 * @throws {Error} - 支付失败时抛出异常（含错误信息），组件可catch处理
 */
export async function consumeOrderBalancePay(orderId) {
    // 前置参数校验
    if (!orderId || (typeof orderId !== 'number' && typeof orderId !== 'string')) {
        const errorMsg = '消费订单ID不能为空，且必须为数字/字符串类型';
        throw new Error(errorMsg);
    }

    try {
        // 构造请求参数：payType固定为"BALANCE"（后端仅支持此类型）
        const payDTO = {
            orderId: orderId, // 统一转为Number，适配后端long类型参数
            payType: 'BALANCE' // 写死为余额支付（后端要求字符串类型，非数字3）
        };

        // 调用基础API函数
        const res = await consumeOrderPayApi(payDTO);

        // 解析返回结果：res.data.data为订单ID（Long类型），存在则表示受理成功
        const payedOrderId = res?.data?.data;
        if (payedOrderId) {
            return true; // 返回支付受理成功
        } else {
            const failMsg = res?.msg || '支付请求受理失败，请稍后重试';
            throw new Error(failMsg);
        }

    } catch (error) {
        // 统一异常处理：打印日志+抛异常给组件
        console.error(`消费订单${orderId}余额支付失败：`, error);
        // 组件可通过catch捕获此异常，自定义兜底逻辑
        throw error;
    }
}