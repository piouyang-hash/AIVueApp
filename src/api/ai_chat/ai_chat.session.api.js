import { aiChatRequest, withAuth } from "@/utils/request.js";

/**
 * 查询当前用户的所有正常会话（未删除）
 * 对应后端：GET /ai/chat/session/sessions/normal
 * @returns {Promise<Object>} - 响应：{success: boolean, data: Array<AiChatSession>, msg: string}
 */
export async function listUserNormalSessionsApi() {
    return withAuth(aiChatRequest, {
        url: '/ai/chat/session/sessions/normal',
        method: 'GET' // 对应后端@GetMapping
    })
}

/**
 * 查询当前用户的回收站会话（已删除）
 * 对应后端：GET /ai/chat/session/sessions/recycle
 * @returns {Promise<Object>} - 响应：{success: boolean, data: Array<AiChatSession>, msg: string}
 */
export async function listUserDeletedSessionsApi() {
    return withAuth(aiChatRequest, {
        url: '/ai/chat/session/sessions/recycle',
        method: 'GET' // 对应后端@GetMapping
    })
}

/**
 * 置顶指定AI聊天会话
 * 对应后端：POST /ai/chat/session/{sessionUuid}/top
 * @param {string} sessionUuid - 会话UUID（标准UUIDv4格式）
 * @returns {Promise<Object>} - 响应：{success: boolean, data: null, msg: string}
 */
export async function topChatSessionApi(sessionUuid) {
    return withAuth(aiChatRequest, {
        url: `/ai/chat/session/${sessionUuid}/top`,
        method: 'POST'
    })
}

/**
 * 取消置顶指定AI聊天会话
 * 对应后端：POST /ai/chat/session/{sessionUuid}/untop
 * @param {string} sessionUuid - 会话UUID（标准UUIDv4格式）
 * @returns {Promise<Object>} - 响应：{success: boolean, data: null, msg: string}
 */
export async function untopChatSessionApi(sessionUuid) {
    return withAuth(aiChatRequest, {
        url: `/ai/chat/session/${sessionUuid}/untop`,
        method: 'POST'
    })
}

/**
 * 更新指定AI聊天会话未读消息数
 * 对应后端：POST /ai/chat/session/update-unread
 * @param {Object} dto - 更新未读数请求DTO
 * @param {string} dto.sessionUuid - 会话UUID（标准UUIDv4格式）
 * @param {number|null} dto.normalUnreadCount - 非切分模式未读消息数（null不更新）
 * @param {number|null} dto.splitUnreadCount - 切分模式未读消息数（null不更新）
 * @returns {Promise<Object>} - 响应：{success: boolean, data: null, msg: string}
 */
export async function updateChatSessionUnreadApi(dto) {
    return withAuth(aiChatRequest, {
        url: `/ai/chat/session/update-unread`,
        method: 'POST',
        data: dto
    })
}

/**
 * 清空指定AI聊天会话未读消息数
 * 对应后端：POST /ai/chat/session/clear-unread
 * @param {Object} dto - 清空未读DTO对象
 * @returns {Promise<Object>} - 响应：{success: boolean, data: null, msg: string}
 */
export async function clearChatSessionUnreadApi(dto) {
    return withAuth(aiChatRequest, {
        url: `/ai/chat/session/clear-unread`,
        method: 'POST',
        data: dto // 直接传递DTO对象
    });
}

/**
 * 删除指定AI聊天会话（移入回收站）
 * 对应后端：POST /ai/chat/session/{sessionUuid}/delete
 * @param {string} sessionUuid - 会话UUID（标准UUIDv4格式）
 * @returns {Promise<Object>} - 响应：{success: boolean, data: null, msg: string}
 */
export async function deleteChatSessionApi(sessionUuid) {
    return withAuth(aiChatRequest, {
        url: `/ai/chat/session/${sessionUuid}/delete`,
        method: 'POST'
    })
}

/**
 * 复原指定AI聊天会话（移出回收站）
 * 对应后端：POST /ai/chat/session/{sessionUuid}/recover
 * @param {string} sessionUuid - 会话UUID（标准UUIDv4格式）
 * @returns {Promise<Object>} - 响应：{success: boolean, data: null, msg: string}
 */
export async function recoverChatSessionApi(sessionUuid) {
    return withAuth(aiChatRequest, {
        url: `/ai/chat/session/${sessionUuid}/recover`,
        method: 'POST'
    })
}
