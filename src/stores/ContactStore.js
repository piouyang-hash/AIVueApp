// 导入Pinia创建仓库的方法 + Vue响应式API
import { defineStore } from 'pinia'
import {ref} from 'vue'
import {getMyAiRoleList} from "@/services/ai_chat.role.service.js";

// 创建会话仓库
export const useContactStore = defineStore('contact', () => {
    // ============== 原有 AI 角色列表（保留不变） ==============
    const aiRoleList = ref([])

    // ============== 当前选中的联系人实体（保留不变） ==============
    const currentContact = ref(null)

    // ============== 智能体创建/编辑 响应式表单实体（核心） ==============
    // 字段完全对齐：页面表单 + 后端 AiRole 实体
    const agentForm = ref({
        roleDesc: '',                // 智能体名称（对应页面 name）
        personaCore: '',             // 核心人设（对应页面 corePersona）
        personaTone: '',              // 语气风格（对应页面 tone）
        visibleScope: 0,             // 可见范围：0-私有 1-公开（对应页面isPublic）
        roleStatus: 0,               // 角色状态：0-草稿 1-发布
    })

    // ============== AI 角色列表获取方法（保留不变） ==============
    const fetchMyAiRoleList = async () => {
        const realRoleData = await getMyAiRoleList()
        aiRoleList.value = realRoleData || []
    }

    // ============== 设置当前选中联系人（保留不变） ==============
    const setCurrentContact = (contact) => {
        currentContact.value = contact
        console.log('已设置当前联系人实体：', contact)
    }

    // ============== 设置智能体表单（编辑时赋值） ==============
    const setAgentForm = (agent) => {
        agentForm.value = {
            ...agentForm.value,
            ...agent
        }
    }

    // ============== 重置智能体表单（创建完成/取消时清空） ==============
    const resetAgentForm = () => {
        agentForm.value = {
            roleDesc: '',
            personaCore: '',
            personaTone: '',
            visibleScope: 0, // 默认私有
            roleStatus: 0,
        }
    }

    // ============== 便捷开关（公开/私有切换） ==============
    const toggleAgentPublic = () => {
        agentForm.value.visibleScope = agentForm.value.visibleScope === 1 ? 0 : 1
    }

    // 暴露所有数据和方法
    return {
        // 原有数据
        aiRoleList,
        currentContact,
        // 智能体表单核心数据
        agentForm,
        // 原有方法
        fetchMyAiRoleList,
        setCurrentContact,
        // 智能体表单操作方法
        setAgentForm,
        resetAgentForm,
        toggleAgentPublic,
    }
})