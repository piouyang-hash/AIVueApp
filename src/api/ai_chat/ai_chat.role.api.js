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

/**
 * 新增AI角色（底层接口）
 * @param {FormData} formData - 表单数据（JSON对象+头像文件）
 */
export async function createAiRoleApi(formData) {
    return withAuth(aiChatRequest, {
        url: '/ai/role/add',
        method: 'POST',
        data: formData
    })
}