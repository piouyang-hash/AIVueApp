// 导入Pinia创建仓库的方法 + Vue响应式API
import { defineStore } from 'pinia'
import {ref} from 'vue'
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
        // ✅ 修复1：ref 数组必须用 .value 判断长度
        if (aiRoleList.value && aiRoleList.value.length > 0) {
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
        // ✅ 修复2：ref 变量判断必须加 .value
        expandedRoleId.value = expandedRoleId.value === roleId ? null : roleId;
        // 同时设置当前选中角色
        setCurrentRoleId(roleId);
        console.log('切换角色展开状态，角色ID：', roleId);
    };

    // 暴露所有数据和方法
    return {
        aiRoleList,
        currentRoleId,
        expandedRoleId,
        fetchMyAiRoleList,
        setCurrentRoleId,
        toggleExpandRole,
    }
})