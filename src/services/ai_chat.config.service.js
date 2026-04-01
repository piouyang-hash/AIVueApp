
import {handleApiResponse} from "@/api/constants/ApiFunctionCommon.js";
import {
    getUserAiConfigApi,
    toggleActiveChatModeApi,
    toggleSplitAiMessageApi
} from "@/api/ai_chat/ai_chat.config.api.js";

// ===================== AI配置 封装业务函数（组件直接调用） =====================
/**
 * 查询当前用户的AI配置信息
 * @returns {AiConfig} - 成功返回AI配置对象，失败抛出错误
 */
export async function getUserAiConfig() {
    return handleApiResponse(getUserAiConfigApi);
}

/**
 * 翻转AI主动聊天模式（开关切换）
 * @returns {AiConfig} - 成功返回最新的AI配置对象，失败抛出错误
 */
export async function toggleActiveChatMode() {
    return handleApiResponse(toggleActiveChatModeApi);
}

/**
 * 翻转AI消息切分模式（开关切换）
 * @returns {AiConfig} - 成功返回最新的AI配置对象，失败抛出错误
 */
export async function toggleSplitAiMessage() {
    return handleApiResponse(toggleSplitAiMessageApi);
}