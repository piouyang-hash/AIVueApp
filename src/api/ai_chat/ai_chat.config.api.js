import { aiChatRequest, withAuth } from "@/utils/request.js";

/**
 * 查询当前用户的AI配置信息
 * 对应后端：GET /ai/config/info
 * @returns {Promise<Object>} - 响应：{success: boolean, data: AiConfig, msg: string}
 */
export async function getUserAiConfigApi() {
    return withAuth(aiChatRequest, {
        url: '/ai/config/info',
        method: 'GET' // 对应后端@GetMapping
    })
}

/**
 * 翻转AI主动聊天模式（开关切换）
 * 对应后端：POST /ai/config/toggle/active-chat
 * @returns {Promise<Object>} - 响应：{success: boolean, data: AiConfig, msg: string}
 */
export async function toggleActiveChatModeApi() {
    return withAuth(aiChatRequest, {
        url: '/ai/config/toggle/active-chat',
        method: 'POST' // 对应后端@PostMapping
    })
}

/**
 * 翻转AI消息切分模式（开关切换）
 * 对应后端：POST /ai/config/toggle/split-ai-message
 * @returns {Promise<Object>} - 响应：{success: boolean, data: AiConfig, msg: string}
 */
export async function toggleSplitAiMessageApi() {
    return withAuth(aiChatRequest, {
        url: '/ai/config/toggle/split-ai-message',
        method: 'POST'
    })
}