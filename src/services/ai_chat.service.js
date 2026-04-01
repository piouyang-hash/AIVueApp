import {userChatWithMemoryApi, publicChatApi, userSlidingWindowStreamChatApi} from "@/api/ai_chat/ai_chat.api.js"; // 接口函数路径
import { handleApiResponse } from "@/api/constants/ApiFunctionCommon.js";
import {useSessionStore} from "@/stores/sessionStore.js";
import {storeToRefs} from "pinia";

/**
 * 登录态AI对话（关联用户记忆）
 * 自动组装实体参数，适配userChatWithMemoryApi的入参要求
 * @param {string} msg - 用户输入的对话消息（对应实体的message字段）
 * @param {string} sessionId - 会话ID（对应实体的sessionId字段）
 * @returns {string} - 成功返回AI回复内容，失败抛出错误
 */
export async function userChatWithMemory(msg, sessionId) {
    // 核心修正：手动组装成接口要求的实体对象（params）
    const requestParams = {
        message: msg,     // 映射到实体的message字段
        sessionId: sessionId // 映射到实体的sessionId字段
    };
    // 把组装好的实体对象作为参数传给apiFunc，适配handleApiResponse的...args
    return handleApiResponse(userChatWithMemoryApi, requestParams);
}

/**
 * 【上层封装】登录态滑动窗口流式AI对话（极简调用版）
 * 自动组装请求参数，屏蔽底层参数结构，让业务侧直接传核心值即可
 * @param {string} msg - 用户输入的对话消息（核心值，无需手动映射字段）
 * @param {string|null|undefined} sessionUuid - 会话UUID（标准UUIDv4格式，允许null/undefined用于新建会话）
 * @param {Function} onData - 必传！流式数据回调（每次收到AI回复片段触发）
 * @param {Function} [onEnd] - 可选，流结束回调（AI回复完成后触发）
 * @param {Function} [onError] - 可选，错误回调（鉴权/网络/流异常时触发）
 * @returns {Function} 取消请求的函数（用于手动终止AI回复）
 * @example
 */
export function userSlidingWindowStreamChat(msg, sessionUuid, onData, onEnd, onError) {
    // ========== 🔥 新增：从 Pinia 仓库获取当前角色 ID（无侵入，不修改函数参数） ==========
    const sessionStore = useSessionStore()
    const { currentRoleId } = storeToRefs(sessionStore)

    // ========== 1. 核心校验：保留原有 + 新增UUID格式校验 ==========
    // 校验1：消息非空且为字符串
    if (typeof msg !== 'string' || msg.trim() === '') {
        const error = new Error('用户消息不能为空，且必须为字符串类型');
        if (onError) {
            onError(error);
            return () => {};
        } else {
            throw error;
        }
    }

    // 校验2：onData必须是函数
    if (typeof onData !== 'function') {
        const error = new Error('onData回调必须传入（用于接收流式AI回复）');
        if (onError) {
            onError(error);
            return () => {};
        } else {
            throw error;
        }
    }

    // 校验3：UUID格式校验（仅当sessionUuid不为null/undefined时校验）
    const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (sessionUuid !== null && sessionUuid !== undefined) {
        // 先校验类型必须是字符串
        if (typeof sessionUuid !== 'string') {
            const error = new Error('会话UUID必须为字符串类型（标准UUIDv4格式），或传入null/undefined用于新建会话');
            if (onError) {
                onError(error);
                return () => {};
            } else {
                throw error;
            }
        }
        // 再校验UUID格式（忽略大小写）
        if (!UUID_V4_REGEX.test(sessionUuid)) {
            const error = new Error(`会话UUID格式错误（需符合标准UUIDv4），当前值：${sessionUuid}`);
            if (onError) {
                onError(error);
                return () => {};
            } else {
                throw error;
            }
        }
    }

    // ========== 2. 组装参数：保留原有 + 🔥 新增 currentRoleId 参数 ==========
    const requestParams = {
        sessionUuid: sessionUuid, // 保留原始值（null/undefined/合法UUID字符串）
        message: msg.trim(), // 仅处理消息空格
        roleId: currentRoleId.value // 🔥 从Store自动获取，无值则为 undefined，不影响接口
    };

    // ========== 3. 调用底层接口，返回取消函数 ==========
    return userSlidingWindowStreamChatApi(
        requestParams,
        onData,
        onEnd,
        onError
    );
}

/**
 * 【配套专属解析器】AI流式对话分片解析（适配ChatStreamMetaDTO）
 * 后端首帧content = ChatStreamMetaDTO对象，后续帧content = 文本字符串
 * 自动识别、自动解析，业务侧直接拿结构化数据
 * @param {Object} chunk - 后端返回的原始ChatChunkDTO
 * @param {Function} onMeta - 首帧回调：返回完整ChatStreamMetaDTO（核心！）
 * @param {Function} onText - 文本帧回调：返回AI纯文本片段
 * @param {Function} [onFinish] - 流结束回调
 * @param {Function} [onParseError] - 解析异常回调
 * @example
 * parseChatChunk(chunk, (meta) => {
 *   // 直接拿到所有元数字段！
 *   console.log(meta.sessionUuid, meta.userMessageId, meta.aiMessageId, meta.userMessage)
 * }, (text) => {
 *   // 直接拿到AI回复文本
 *   console.log(text)
 * })
 */
export function parseChatChunk(chunk, onMeta, onText, onFinish, onParseError) {
    try {
        if (!chunk) {
            throw new Error('流式分片数据为空');
        }

        let realData;
        // 处理后端返回的 "data: {...}" 字符串，转为JSON对象
        if (typeof chunk === 'string' && chunk.startsWith('data: ')) {
            const jsonStr = chunk.replace('data: ', '').trim();

            // 👇 【核心修复】给JSON.parse加容错，解析失败不抛错，当成纯文本
            try {
                realData = JSON.parse(jsonStr);
            } catch (e) {
                // 解析失败：说明是纯文本，直接作为content返回
                realData = { content: jsonStr };
            }
        } else {
            // 非data:格式，直接作为纯文本
            realData = { content: chunk };
        }

        // 适配后端字段：isFirst / isEnd
        const { content, isFirst, isEnd } = realData;

        // 1. 结束帧
        if (isEnd === true) {
            onFinish && typeof onFinish === 'function' && onFinish();
            return;
        }

        // 2. 首帧（元数据）
        if (isFirst === true) {
            if (!content || typeof content !== 'object' || Array.isArray(content)) {
                throw new Error('首帧格式错误：非ChatStreamMetaDTO对象');
            }
            onMeta && typeof onMeta === 'function' && onMeta(content);
            return;
        }

        // 3. 普通文本帧
        if (content != null && typeof onText === 'function') {
            const text = String(content).trim();
            onText(text);
        }

    } catch (err) {
        onParseError && typeof onParseError === 'function'
            ? onParseError(err)
            : console.warn('流式解析失败：', err);
    }
}

// 这个是示例
// // 调用流式对话
// userSlidingWindowStreamChat(
//     "你好，AI能做什么？",
//     null,
//     // 流式回调：直接使用解析器
//     (chunk) => {
//         parseChatChunk(
//             chunk,
//             // 1. 首帧：拿到完整元数据（你要的所有字段都在这）
//             (meta) => {
//                 console.log('✅ 首帧元数据', meta);
//                 console.log('会话UUID：', meta.sessionUuid);
//                 console.log('用户消息ID：', meta.userMessageId);
//                 console.log('AI消息ID：', meta.aiMessageId);
//                 console.log('用户提问：', meta.userMessage);
//             },
//             // 2. 中间帧：拿到AI文本
//             (text) => {
//                 console.log('🤖 AI回复：', text);
//             },
//             // 3. 结束帧
//             () => {
//                 console.log('🔚 流式传输完成');
//             }
//         );
//     },
//     (err) => console.error('请求失败：', err)
// );



/**
 * 公共AI对话（无用户记忆）
 * 适配publicChatApi的入参要求
 * @param {string} msg - 用户输入的公共对话消息
 * @returns {string} - 成功返回AI回复内容，失败抛出错误
 */
export async function publicChat(msg) {
    // 把msg作为参数传给publicChatApi，适配其入参要求
    return handleApiResponse(publicChatApi, msg);
}