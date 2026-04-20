// 导入Pinia创建仓库的方法 + Vue响应式API
import { defineStore } from 'pinia'
import {computed} from 'vue'
import {useAiRoleStore} from "@/stores/AiChat/aiRoleStore.js";
import {useAiMessageStore} from "@/stores/AiChat/session-related/aiMessageStore.js";
import {useBaseSessionStore} from "@/stores/AiChat/baseSessionStore.js";
import {useAiChatInputConfigStore} from "@/stores/AiChat/session-related/aiChatInputConfigStore.js";

// 创建会话仓库
export const useChatDomainStore = defineStore('chatDomain', () => {

    const baseSessionStore = useBaseSessionStore()
    const aiRoleStore = useAiRoleStore()
    const aiMessageStore = useAiMessageStore()
    const aiChatInputConfigStore = useAiChatInputConfigStore()

    // 🔥 核心：computed 自动构建【roleId => 会话数组】映射
    // 自动依赖 chatList，数据变化时实时更新！
    const roleSessionMap = computed(() => {
        const map = {}
        // 遍历所有会话，按角色ID分组
        baseSessionStore.chatList.forEach(session => {
            const roleId = session.roleId
            // 不存在则初始化空数组
            if (!map[roleId]) {
                map[roleId] = []
            }
            // 推入当前会话（包含sessionUuid/roleId等全部信息）
            map[roleId].push(session)
        })
        return map
    })

    /**
     * 设置【占位符会话】
     * @param {string} sessionUuid - 传入的会话UUID
     * @description 创建仅包含会话ID+角色ID的极简占位会话，推入聊天列表，自动去重
     * 🔥 新增：同时为该会话初始化 空消息数组，解决消息无渲染位置的问题
     */
    const setPlaceholderSession = (sessionUuid) => {
        // 安全校验：传入的UUID不能为空
        if (!sessionUuid) return

        // 🔴 核心去重：检查会话列表中是否已存在
        const isExist = baseSessionStore.chatList.some(item => item.sessionUuid === sessionUuid)
        if (isExist) return

        // 🎯 1. 创建占位会话（原有逻辑不变）
        const placeholderSession = {
            sessionUuid: sessionUuid,
            roleId: aiRoleStore.currentRoleId
        }

        // ✅ 2. 将占位符添加到会话列表（原有逻辑不变）
        baseSessionStore.chatList.push(placeholderSession)

        // 🔥 3. 核心新增：为该会话初始化【空消息数组】，保证消息能正常渲染
        // 如果会话不存在消息映射，则赋值空数组
        if (!aiMessageStore.sessionMessages[sessionUuid]) {
            aiMessageStore.sessionMessages[sessionUuid] = []
        }

        // ✅ 4. 自动将该占位符设为当前选中会话（原有逻辑不变）
        baseSessionStore.currentSessionUuid = sessionUuid
    }

    // ====================== 【新增】根据UUID删除会话 ======================
    const deleteSessionByUuid = (sessionUuid) => {
        if (!sessionUuid) return

        // 1. 从会话列表中过滤掉当前删除的会话
        baseSessionStore.chatList = baseSessionStore.chatList.filter(item => item.sessionUuid !== sessionUuid)

        // 2. 如果删除的是当前选中的会话，清空选中状态
        if (baseSessionStore.currentSessionUuid === sessionUuid) {
            baseSessionStore.currentSessionUuid = ''
        }

        // 3. 清理该会话对应的消息数据（避免内存冗余）
        if (aiMessageStore.sessionMessages[sessionUuid]) {
            delete aiMessageStore.sessionMessages[sessionUuid]
        }

        // 4. 清理该会话对应的输入框配置数据
        if (aiChatInputConfigStore.sessionInputConfig[sessionUuid]) {
            delete aiChatInputConfigStore.sessionInputConfig[sessionUuid]
        }

        console.log(`会话【${sessionUuid}】删除并清理完成`);
    }

    // 暴露所有数据和方法
    return {
        roleSessionMap,
        setPlaceholderSession,
        deleteSessionByUuid
    }
})