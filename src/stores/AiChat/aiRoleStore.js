// 导入Pinia创建仓库的方法 + Vue响应式API
import { defineStore } from 'pinia'
import {computed, ref} from 'vue'
import {getChatMessages, getUserNormalSessions} from "@/services/ai_chat.session.service.js";
import {getMyAiRoleList} from "@/services/ai_chat.role.service.js";


// 创建会话仓库
export const useAiRoleStore = defineStore('aiRole', () => {
    // 🔥 【新增】AI角色列表（你的需求）
    const aiRoleList = ref([])

    // 🔥 【新增】当前选中的角色ID（参照你写法来的）
    const currentRoleId = ref(null)

    // 🔥 新增：当前展开的角色ID（控制下拉会话）
    const expandedRoleId = ref(null);

    // 🔥 修改后：有数据就不请求接口（AI角色列表）
    const fetchMyAiRoleList = async () => {
        // ✅【核心新增】开头判断：已有数据，直接return，不发请求
        if (aiRoleList && aiRoleList.length > 0) {
            console.log('AI角色列表已有数据，跳过接口请求');
            return;
        }

        console.log('开始调用getMyAiRoleList接口...')
        const realRoleData = await getMyAiRoleList()
        console.log('从接口获取的AI角色数据：', realRoleData)
        aiRoleList.value = realRoleData || []
    }

    // 🔥 【新增】设置当前选中角色ID（完全对标你的格式）
    const setCurrentRoleId = (roleId) => {
        currentRoleId.value = roleId
    }

    // 🔥 新增：切换角色展开/收起（核心方法）
    const toggleExpandRole = (roleId) => {
        // 点击当前已展开角色 → 收起；点击其他角色 → 展开新角色
        expandedRoleId.value = expandedRoleId === roleId ? null : roleId;
        // 同时设置当前选中角色
        setCurrentRoleId(roleId);
        console.log('切换角色展开状态，角色ID：', roleId);
    };

    // 暴露所有数据和方法
    return {
        // ======================================
        // 🔥 1. 核心列表数据（页面主数据）
        // ======================================
        aiRoleList,              // AI角色列表

        // ======================================
        // 🔥 2. 当前选中状态（页面激活项）
        // ======================================
        currentRoleId,           // 当前角色ID
        expandedRoleId,          // 展开的角色ID

        // ======================================
        // 🔥 7. 数据获取（接口请求）
        // ======================================
        fetchMyAiRoleList,       // 获取AI角色列表

        // ======================================
        // 🔥 8. 会话核心操作
        // ======================================
        setCurrentRoleId,        // 设置当前角色ID
        toggleExpandRole,        // 切换角色展开/收起
    }
})