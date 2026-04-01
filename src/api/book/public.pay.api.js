import {bookRequest, orderRequest, withAuth} from "@/utils/request.js";

/**
 * 根据文件哈希查询书籍支付信息（基础信息+价格信息）
 * @param {string} fileHash - 书籍文件哈希值（不能为空）
 * @returns {Promise<Object>} 包含书籍支付信息的响应数据（BookPayVO）
 */
export async function getBookPayInfoByFileHashApi(fileHash) {
    // 参数校验：哈希值不能为空且必须为字符串类型
    if (!fileHash || typeof fileHash !== 'string') {
        throw new Error('文件哈希值不能为空且必须为字符串类型');
    }

    return bookRequest({
        url: `/api/public/book/pay/file-hash/${fileHash}`, // 匹配后端@RequestMapping + @GetMapping路径
        method: 'GET' // 后端@GetMapping对应GET请求
    })
}

/**
 * 生成消费订单JWT令牌接口（需登录）
 * @param {Object} requestData - 请求参数
 * @param {number} requestData.businessId - 业务ID（书籍ID/会员套餐ID，需>0）
 * @param {string} requestData.bizKey - 业务场景（book=购买书籍，member=购买会员）
 */
export async function generateConsumeOrderTokenApi(requestData) {
    // 调用后端接口（需登录，用withAuth包装）
    return withAuth(orderRequest, {
        method: 'POST',
        url: '/order/token/consume/generate', // 匹配后端接口路径
        data: requestData, // 传入业务ID+业务场景
        headers: {
            'Content-Type': 'application/json' // 指定JSON格式
        }
    });
}

/**
 * 创建消费订单接口（需登录）
 * @param {Object} requestData - 请求参数
 * @param {string} requestData.bizCode - 业务标识（book=购买书籍，member=购买会员，必填）
 * @param {number} requestData.businessId - 业务ID（书籍ID/会员套餐ID，需>0，必填）
 * @param {string} requestData.orderToken - 订单令牌（从生成Token接口获取，必填）
 * @param {string} [requestData.remark] - 消费备注（可选，如"购买《传统十论》"）
 */
export async function createConsumeOrderApi(requestData) {
    // 调用后端创建订单接口（需登录，用withAuth包装）
    return withAuth(orderRequest, {
        method: 'POST',
        url: '/api/order/consume/create', // 匹配后端@PostMapping("/create")，若后端有上级@RequestMapping需补充（如/consume/create）
        data: requestData, // 传入前端入参（bizCode/businessId/orderToken/remark）
        headers: {
            'Content-Type': 'application/json' // 指定JSON格式，和后端@RequestBody适配
        }
    });
}

/**
 * 更新消费订单支付方式
 * 对应后端：PUT /api/order/consume/update-pay-type
 * 需要携带 JWT token（由 withAuth 自动处理）
 * @param {Object} updatePayTypeDTO - 更新消费订单支付方式参数
 * @param {Number} updatePayTypeDTO.orderId - 消费订单ID（创建订单接口返回的雪花ID）
 * @param {Number} updatePayTypeDTO.payType - 支付类型：1=微信 2=支付宝 3=余额（前端传数字，后端自动转PayTypeEnum枚举）
 * @returns {Promise<Object>} - 接口响应：{success: boolean, data: boolean, msg: string}
 * @throws {Error} - 接口调用失败时抛出异常（如网络错误、401/403/404等）
 * @description 注意事项：
 * 1. 仅能更新「待选择支付方式」状态的自有订单，修改他人订单/非待选状态订单会返回403；
 * 2. 支付类型仅支持1/2/3，传其他值会返回400参数错误；
 * 3. 接口30秒内最多调用5次，超出会触发限流；
 * 4. 更新成功后订单状态自动从「待选择支付方式」改为「等待付款」；
 * 5. Token失效/未携带会返回401，需重新登录获取Token；
 * 6. 订单不存在/已支付/已关闭会返回404。
 */
export async function updateConsumeOrderPayTypeApi(updatePayTypeDTO) {
    return withAuth(orderRequest, {
        url: '/api/order/consume/update-pay-type', // 后端接口路径（consume前缀区分消费订单）
        method: 'PUT', // 必须与后端@PutMapping注解一致
        data: updatePayTypeDTO // 传参结构与后端ConsumeUpdatePayTypeDTO对应
    })
}


/**
 * 消费订单支付（触发TCC全局事务）
 * 对应后端：POST /api/order/consume/pay
 * 需要携带 JWT token（由 withAuth 自动处理）
 * @param {Object} payDTO - 消费订单支付参数
 * @param {Number} payDTO.orderId - 消费订单ID（long类型，创建订单接口返回）
 * @param {String} payDTO.payType - 支付类型：仅支持"BALANCE"（余额支付）
 * @returns {Promise<Object>} - 接口响应：{success: boolean, data: Long, msg: string}
 * @description 注意：
 * 1. 仅支持余额支付（payType固定为"BALANCE"）；
 * 2. 订单ID需提前创建且状态为INIT；
 * 3. 接口返回data为消费订单ID（Long类型）；
 * 4. 30秒内最多调用5次，防止重复支付/恶意请求。
 */
export async function consumeOrderPayApi(payDTO) {
    return withAuth(orderRequest, {
        url: '/api/order/consume/pay', // 后端接口路径（consume前缀+pay）
        method: 'POST', // 与后端@PostMapping一致
        data: payDTO // 传参结构与后端ConsumeOrderPayDTO对应
    })
}


/**
 * 查询当前登录用户的单个消费订单
 * 对应后端：GET /api/order/consume/orders/{orderId}
 * 需要携带 JWT Token（由 withAuth 自动处理）
 * @param {Number|String} orderId - 消费订单ID（Long类型，支持数字/字符串）
 * @returns {Promise<Object>} - 接口响应：{success: boolean, data: ConsumeRecordVO, msg: string}
 * @description 注意：
 * 1. 用户身份从Token解析，前端无需传userId；
 * 2. 仅返回当前用户名下的订单，非本人订单/不存在订单返回null；
 * 3. res.data.data 为 ConsumeRecordVO 完整对象；
 * 4. consumeSubType 仅在 businessType=2 时有效。
 */
export async function queryUserConsumeOrderByIdApi(orderId) {
    // 路径参数拼接（后端要求@PathVariable传orderId）
    const url = `/api/order/consume/orders/${orderId}`;
    return withAuth(orderRequest, {
        url: url,
        method: 'GET', // 与后端@GetMapping一致
        // GET请求无需传data，路径参数已拼入url
    });
}