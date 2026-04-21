import {aiChatRequest, withAuth} from "@/utils/request.js";

/**
 * 查询指定会话下的所有聊天消息
 * 对应后端：GET /ai/chat/message/{sessionUuid}
 * @param {string} sessionUuid - 会话UUID
 * @returns {Promise<Object>}
 */
export async function listChatMessagesApi(sessionUuid) {
    return withAuth(aiChatRequest, {
        url: `/ai/chat/message/${sessionUuid}`,
        method: 'GET'
    })
}

/**
 * 查询会话最新消息（首屏加载）
 * 对应后端：GET /ai/chat/message/latest/{sessionUuid}
 * @param {string} sessionUuid - 会话UUID
 * @param {number} [limitNum=20] - 加载数量
 * @returns {Promise<Object>}
 */
export async function listLatestChatMessagesApi(sessionUuid, limitNum = 20) {
    return withAuth(aiChatRequest, {
        url: `/ai/chat/message/latest/${sessionUuid}`,
        method: 'GET',
        params: { limitNum }
    })
}

/**
 * 上拉加载历史消息（分页）
 * 对应后端：GET /ai/chat/message/history/{sessionUuid}
 * @param {string} sessionUuid - 会话UUID
 * @param {number} minMessageId - 最小消息ID
 * @param {number} [limitNum=20] - 加载数量
 * @returns {Promise<Object>}
 */
export async function listMoreHistoryMessagesApi(sessionUuid, minMessageId, limitNum = 20) {
    return withAuth(aiChatRequest, {
        url: `/ai/chat/message/history/${sessionUuid}`,
        method: 'GET',
        params: { minMessageId, limitNum }
    })
}