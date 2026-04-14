import { handleApiResponse } from "@/api/constants/ApiFunctionCommon.js";
import {getMyAiRoleListApi} from "@/api/ai_chat/ai_chat.role.api.js";
import {createAiRoleApi} from "@/api/ai_chat/ai_chat.role.api.js";

/**
 * 查询当前用户的所有AI角色列表
 * @returns {Array<AiRoleVO>} - 成功返回角色VO列表，失败抛出错误
 */
export async function getMyAiRoleList() {
    return handleApiResponse(getMyAiRoleListApi);
}

/**
 * 创建AI智能体（业务方法）
 * @param {Object} aiRoleDTO - AI角色表单数据（roleDesc/personaCore/personaTone/visibleScope）
 * @param {File|undefined} [roleAvatar] - 头像文件（可选，不传则不更新头像）
 */
export async function createAiRole(aiRoleDTO, roleAvatar) {
    try {
        // 1. 构建 FormData（完全匹配后端 @RequestPart 格式）
        const formData = new FormData()

        // 追加 AI角色JSON数据（后端接收 key：aiRoleDTO）
        const aiRoleBlob = new Blob(
            [JSON.stringify(aiRoleDTO)],
            { type: 'application/json' }
        )
        formData.append('aiRoleDTO', aiRoleBlob, 'aiRoleDTO.json')

        // 有头像文件时追加（后端接收 key：roleAvatar）
        if (roleAvatar) {
            formData.append('roleAvatar', roleAvatar, roleAvatar.name)
        }

        // 2. 调用创建接口
        await createAiRoleApi(formData)

        console.log('✅ AI智能体创建成功！')
    } catch (error) {
        console.error('❌ 创建AI智能体失败:', error)
        throw error // 抛出错误供页面处理
    }
}