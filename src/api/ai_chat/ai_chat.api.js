import {aiChatRequest, withAuth, withStream} from "@/utils/request.js";

/**
 * 登录态AI对话（关联用户记忆）
 * 对应后端：POST /ai/chat
 * 需携带JWT Token，入参包含用户消息和会话ID
 * @param {Object} params - 对话请求参数
 * @param {string} params.message - 用户输入的对话消息
 * @param {string} params.sessionId - 会话ID
 * @returns {Promise<Object>} - 响应：{success: boolean, data: string(AI回复内容), msg: string}
 */
export async function userChatWithMemoryApi(params) {
    return withAuth(aiChatRequest, {
        url: '/ai/main-model/chat', // 匹配后端登录态对话接口路径
        method: 'POST',  // 对应后端@PostMapping
        data: params     // POST请求参数放在data中（后端@RequestBody接收）
    })
}

/**
 * 登录态滑动窗口流式AI对话接口（适配fetch版withStream，移除axios依赖）
 * 对应后端：POST /ai/chat/sliding-window
 * 需携带JWT Token，入参包含用户消息和会话UUID，流式接收AI回复
 * @param {Object} params - 对话请求参数
 * @param {string} params.message - 用户输入的对话消息
 * @param {string|null|undefined} params.sessionUuid - 会话UUID（标准UUIDv4格式，允许null/undefined，后端处理新建会话）
 * @param {Function} onData - 流式数据回调（每次收到chunk触发，参数为解析后的文本）
 * @param {Function} [onEnd] - 可选，流结束回调
 * @param {Function} [onError] - 可选，错误回调（鉴权失败/网络错误/流异常等）
 * @returns {Function} 取消请求的函数（用于手动终止流式请求）
 */
export function userSlidingWindowStreamChatApi(params, onData, onEnd, onError) {
    // 1. 核心校验：仅保留消息非空校验（sessionUuid的格式校验已在上层函数完成）
    if (!params?.message || typeof params.message !== 'string' || params.message.trim() === '') {
        const error = new Error('用户消息不能为空，且必须为字符串类型');
        onError?.(error);
        return () => {}; // 返回空取消函数，避免报错
    }

    // 2. 构建流式请求配置：替换sessionId为sessionUuid，UUID与message同级传递
    const streamRequestConfig = {
        url: '/ai/chat/sliding-window',
        method: 'POST',
        data: {
            sessionUuid: params.sessionUuid, // UUID与message同级，保留原始值
            message: params.message.trim(),   // 处理消息首尾空格
            roleId: params.roleId
        }
    };

    // 存储流式请求的取消函数（因鉴权是异步，需先初始化）
    let cancelStream = null;

    // 3. 先执行鉴权 → 再调用withStream（核心：集成登录态鉴权）
    withAuth(streamRequestConfig) // Fetch版鉴权：仅返回带鉴权头的配置
        .then((authConfig) => {
            // 鉴权成功：传入带Authorization头的配置调用withStream
            cancelStream = withStream(
                authConfig, // 替换为带鉴权头的配置
                onData,
                onEnd,
                onError
            );
        })
        .catch((authError) => {
            // 鉴权失败（未登录/Token失效）：触发错误回调，终止流程
            const error = new Error(`鉴权失败：${authError.message}`);
            onError?.(error);
            onEnd?.(); // 触发结束回调，避免前端等待
            cancelStream = () => {}; // 重置取消函数
        });

    // 4. 返回取消请求的函数（兼容异步鉴权场景）
    return () => {
        if (cancelStream) {
            cancelStream(); // 调用实际的流式请求取消函数
        }
    };
}

/**
 * 接收字符流TestDTO的流式接口（适配fetch版withStream）
 * 对应后端：GET /char/flux/dto
 * 无入参，流式接收TestDTO数据
 * @param {Function} onData - 流式数据回调（每次收到chunk触发，参数为解析后的TestDTO对象）
 * @param {Function} [onEnd] - 可选，流结束回调
 * @param {Function} [onError] - 可选，错误回调
 * @returns {Function} 取消请求的函数
 */
export function getCharFluxDtoApi(onData, onEnd, onError) {
    // 构建GET流式请求配置（无参数，method为GET）
    const streamRequestConfig = {
        url: '/char/flux/dto', // 后端接口地址，无前缀
        method: 'GET', // 后端是GET请求
        // GET请求无需data，若有鉴权token，withStream内部需处理请求头（比如Authorization）
    };

    // 调用withStream，返回取消函数
    return withStream(
        streamRequestConfig,
        onData,
        onEnd,
        onError
    );
}

/**
 * 公共AI对话（无用户记忆）
 * 对应后端：GET /ai/public/chat
 * 无需登录，入参仅为用户消息
 * @param {string} msg - 用户输入的公共对话消息
 * @returns {Promise<Object>} - 响应：{success: boolean, data: string(AI回复内容), msg: string}
 */
export async function publicChatApi(msg) {
    return aiChatRequest({
        url: '/ai/public/chat', // 匹配后端公共对话接口路径
        method: 'GET',          // 对应后端@GetMapping
        params: { msg }         // GET请求参数放在params中（后端@RequestParam接收）
    })
}