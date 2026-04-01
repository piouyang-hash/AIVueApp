import { handleApiResponse } from "@/api/constants/ApiFunctionCommon.js";
import {getMyAiRoleListApi} from "@/api/ai_chat/ai_chat.role.api.js";

/**
 * 查询当前用户的所有AI角色列表
 * @returns {Array<AiRoleVO>} - 成功返回角色VO列表，失败抛出错误
 */
export async function getMyAiRoleList() {
    return handleApiResponse(getMyAiRoleListApi);
}