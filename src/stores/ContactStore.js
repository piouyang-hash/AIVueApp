// 导入Pinia创建仓库的方法 + Vue响应式API
import { defineStore } from 'pinia'
import {ref} from 'vue'
import {getMyAiRoleList} from "@/services/ai_chat.role.service.js";

// 创建会话仓库
export const useContactStore = defineStore('contact', () => {
    // 原有 AI 角色列表（保留不变）
    const aiRoleList = ref([])

    // 🔥 替换：当前选中的【完整联系人实体】（不再是 ID）
    const currentContact = ref(null)

    // 原有获取 AI 列表方法（保留不变）
    const fetchMyAiRoleList = async () => {
        const realRoleData = await getMyAiRoleList()
        aiRoleList.value = realRoleData || []
    }

    // 🔥 替换：设置当前选中的【完整联系人实体】
    const setCurrentContact = (contact) => {
        currentContact.value = contact
        console.log('已设置当前联系人实体：', contact)
    }

    // 暴露所有数据和方法
    return {
        aiRoleList,
        currentContact, // 导出完整实体
        fetchMyAiRoleList,
        setCurrentContact, // 导出设置方法
    }
})