import { aiChatRequest, withAuth } from "@/utils/request.js";

/**
 * 查询当前用户的所有AI角色列表
 * 对应后端：GET /ai/role/my/list
 * @returns {Promise<Object>} - 响应：{success: boolean, data: Array<AiRoleVO>, msg: string}
 */
export async function getMyAiRoleListApi() {
    return withAuth(aiChatRequest, {
        url: '/ai/role/my/list',
        method: 'GET'
    })
}