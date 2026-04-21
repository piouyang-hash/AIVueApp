import {
    listChatMessagesApi,
    listLatestChatMessagesApi,
    listMoreHistoryMessagesApi
} from "@/api/ai_chat/ai_chat_message.api.js";
import {handleApiResponse} from "@/api/constants/ApiFunctionCommon.js";

/**
 * 查询指定会话下的所有聊天消息（封装层）
 * @param {string} sessionUuid - 会话UUID
 * @returns {Array<AiChatMessage>}
 */
export async function getChatMessages(sessionUuid) {
    return handleApiResponse(listChatMessagesApi, sessionUuid);
}

/**
 * 获取会话最新消息（封装层）
 * @param {string} sessionUuid - 会话UUID
 * @param {number} [limitNum=20] - 加载数量
 * @returns {Array<AiChatMessage>}
 */
export async function getLatestChatMessages(sessionUuid, limitNum = 20) {
    return handleApiResponse(listLatestChatMessagesApi, sessionUuid, limitNum);
}

/**
 * 加载历史消息（封装层）
 * @param {string} sessionUuid - 会话UUID
 * @param {number} minMessageId - 最小消息ID
 * @param {number} [limitNum=20] - 加载数量
 * @returns {Array<AiChatMessage>}
 */
export async function getMoreHistoryMessages(sessionUuid, minMessageId, limitNum = 20) {
    return handleApiResponse(listMoreHistoryMessagesApi, sessionUuid, minMessageId, limitNum);
}