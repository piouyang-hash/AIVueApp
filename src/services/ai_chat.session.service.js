import {
    listUserNormalSessionsApi,
    listUserDeletedSessionsApi,
    deleteChatSessionApi,
    recoverChatSessionApi,
    listChatMessagesApi, untopChatSessionApi, topChatSessionApi,
} from "@/api/ai_chat/ai_chat.session.api.js";
import {handleApiResponse} from "@/api/constants/ApiFunctionCommon.js";

// ===================== 封装后的工具函数（组件可直接调用） =====================
/**
 * 查询当前用户的所有正常会话（未删除）
 * @returns {Array<AiChatSession>} - 成功返回会话列表，失败抛出错误
 */
export async function getUserNormalSessions() {
    return handleApiResponse(listUserNormalSessionsApi);
}

/**
 * 查询当前用户的回收站会话（已删除）
 * @returns {Array<AiChatSession>} - 成功返回回收站会话列表，失败抛出错误
 */
export async function getUserDeletedSessions() {
    return handleApiResponse(listUserDeletedSessionsApi);
}

/**
 * 置顶指定AI聊天会话
 * @param {string} sessionUuid - 会话UUID（标准UUIDv4格式）
 * @returns {null} - 成功返回null，失败抛出错误
 */
export async function topChatSession(sessionUuid) {
    return handleApiResponse(topChatSessionApi, sessionUuid);
}

/**
 * 取消置顶指定AI聊天会话
 * @param {string} sessionUuid - 会话UUID（标准UUIDv4格式）
 * @returns {null} - 成功返回null，失败抛出错误
 */
export async function untopChatSession(sessionUuid) {
    return handleApiResponse(untopChatSessionApi, sessionUuid);
}


/**
 * 删除指定AI聊天会话（移入回收站）
 * @param {string} sessionUuid - 会话UUID（标准UUIDv4格式）
 * @returns {null} - 成功返回null，失败抛出错误
 */
export async function deleteChatSession(sessionUuid) {
    return handleApiResponse(deleteChatSessionApi, sessionUuid);
}

/**
 * 复原指定AI聊天会话（移出回收站）
 * @param {string} sessionUuid - 会话UUID（标准UUIDv4格式）
 * @returns {null} - 成功返回null，失败抛出错误
 */
export async function recoverChatSession(sessionUuid) {
    return handleApiResponse(recoverChatSessionApi, sessionUuid);
}

/**
 * 查询指定会话下的所有聊天消息（封装层，统一处理接口响应）
 * @param {string} sessionUuid - 会话UUID（标准UUIDv4格式）
 * @returns {Array<AiChatMessage>} - 成功返回消息列表，失败抛出错误
 */
export async function getChatMessages(sessionUuid) {
    return handleApiResponse(listChatMessagesApi, sessionUuid);
}