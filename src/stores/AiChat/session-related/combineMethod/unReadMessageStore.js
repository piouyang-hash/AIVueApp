// 导入Pinia创建仓库的方法 + Vue响应式API
import { defineStore } from 'pinia'
import {computed} from 'vue'
// 导入配置仓库
import { useAiSoftwareConfigStore } from '@/stores/aiSoftwareConfig.js'
import {useAiMessageStore} from "@/stores/AiChat/session-related/aiMessageStore.js";
import {useBaseSessionStore} from "@/stores/AiChat/baseSessionStore.js";
import {clearChatSessionUnread} from "@/services/ai_chat.session.service.js";

// 创建会话仓库
export const useUnReadMessageStore = defineStore('unReadMessage', () => {

    // 初始化配置仓库
    const configStore = useAiSoftwareConfigStore()
    const baseSessionStore = useBaseSessionStore()
    const aiMessageStore = useAiMessageStore()

    // 🔥 核心优化1：自动给【每个会话】赋值后端同款字段：normalUnreadCount / splitUnreadCount
    // 遍历会话 → 计算未读数 → 直接挂载到会话对象上（和后端字段名完全一致）
    // 🔥 修复：计算属性 - 带未读数的会话列表（响应式正常生效）
    const fillSessionUnreadCount = computed(() => {
        // 核心：基于原列表 映射新数组（不修改原数据，触发响应式）
        return baseSessionStore.chatList.map(session => {
            const sessionUuid = session.sessionUuid
            if (!sessionUuid) return session

            // 获取当前会话所有消息
            const messages = aiMessageStore.mergedSessionMessages[sessionUuid] || []

            // 1. 普通未读消息数（本次新增的未读数）
            const normalUnreadCount = messages.filter(msg => msg.isRead === false).length

            // 2. 分段消息未读数（本次新增的未读数）
            let splitUnreadCount = 0
            messages.forEach(msg => {
                const splits = msg.splitContent || []
                splitUnreadCount += splits.filter(s => s.isRead === false).length
            })

            // ✅ 关键修改：原有字段值 + 新计算的未读数（兼容undefined，默认0）
            return {
                ...session,
                // 原会话未读数 + 本次计算的普通未读数
                normalUnreadCount: (session.normalUnreadCount || 0) + normalUnreadCount,
                // 原会话分段未读数 + 本次计算的分段未读数
                splitUnreadCount: (session.splitUnreadCount || 0) + splitUnreadCount
            }
        })
    })

    // 核心优化2：极简版全会话未读数（直接从会话字段读取，无需重复计算）
    const sessionAllUnreadCount = computed(() => {
        const result = {}
        // 🔥 修复：computed 属性必须加 .value 取值！
        fillSessionUnreadCount.value.forEach(session => {
            // 防御性判断，避免异常
            if (!session?.sessionUuid) return

            result[session.sessionUuid] = {
                normalUnreadCount: session.normalUnreadCount || 0,
                splitUnreadCount: session.splitUnreadCount || 0
            }
        })
        return result
    })

    // 简化版查询函数：自动匹配切分/普通模式
    // @param {string} sessionUuid 会话ID
    // @return {number} 未读数量
    const getSessionUnread = (sessionUuid) => {
        // 无会话直接返回0
        if (!sessionUuid) return 0
        const isSplit = configStore.isSplitMessageEnabled

        // 🔥 修复：computed 计算属性必须加 .value ！！！
        const unread = sessionAllUnreadCount.value[sessionUuid]
        if (!unread) return 0

        // 核心：匹配后端标准字段名
        return isSplit
            ? unread.splitUnreadCount || 0
            : unread.normalUnreadCount || 0
    }

    // 🔥 标记单条消息已读（主消息+全分片）【精简最终版】
    const markMessageAsRead = (sessionUuid, messageId) => {
        // 获取当前会话的消息数组
        const messages = aiMessageStore.mergedSessionMessages[sessionUuid] || []
        // 查找目标消息
        const targetMessage = messages.find(msg => msg.messageId === messageId)

        // 无消息 / 已读 直接退出
        if (!targetMessage || targetMessage.isRead) return

        // 标记主消息为已读
        targetMessage.isRead = true

        // 标记所有切分分片为已读（仅修改 false 的项）
        targetMessage.splitContent?.forEach(splitItem => {
            if (splitItem.isRead === false) {
                splitItem.isRead = true
            }
        })
    }

    // 🔥 增强版：标记单个切分消息 + 全部分片读完自动标记主消息
    const markSingleSplitMessageAsRead = (sessionUuid, messageId, splitIndex) => {
        const messages = aiMessageStore.mergedSessionMessages[sessionUuid] || []
        const targetMessage = messages.find(msg => msg.messageId === messageId)

        if (!targetMessage || !targetMessage.splitContent || splitIndex < 0 || splitIndex >= targetMessage.splitContent.length) {
            return
        }

        // 标记单个分片
        const targetSplit = targetMessage.splitContent[splitIndex]
        if (targetSplit.isRead === false) {
            targetSplit.isRead = true
        }

        // 🔥 优化：检查所有分片是否都已读，是则标记主消息为已读
        const allSplitRead = targetMessage.splitContent.every(s => s.isRead === true)
        if (allSplitRead) {
            targetMessage.isRead = true
        }
    }

    // 🔥 清空指定会话的所有未读（优化版：非0才执行，同步调用接口）
    const clearSessionUnread = async (sessionUuid) => {
        // 1. 查找目标会话
        const targetSession = baseSessionStore.chatList.find(item => item.sessionUuid === sessionUuid)
        // 无会话 / 两个未读数都为0 → 直接跳过，不执行任何操作
        if (!targetSession || (targetSession.normalUnreadCount === 0 && targetSession.splitUnreadCount === 0)) {
            return
        }

        // 👇 只有未读数 > 0 时，才会执行以下逻辑
        // 2. 原有逻辑：标记所有消息和分段消息为已读
        const messages = aiMessageStore.mergedSessionMessages[sessionUuid] || []
        messages.forEach(msg => {
            msg.isRead = true
            msg.splitContent?.forEach(s => s.isRead = true)
        })

        // 3. 将会话未读数强制置 0
        targetSession.normalUnreadCount = 0
        targetSession.splitUnreadCount = 0

        // 4. ✅ 调用后端接口，同步清空未读状态
        await clearChatSessionUnread(sessionUuid)
    }

    // 暴露所有数据和方法
    return {
        // ======================================
        // 🔥 4. 未读消息管理（核心未读功能）
        // ======================================
        fillSessionUnreadCount,
        sessionAllUnreadCount,   // 全会话未读总数
        getSessionUnread,        // 查询单个会话未读数
        markMessageAsRead,       // 标记单条消息已读
        markSingleSplitMessageAsRead, // 标记拆分消息已读
        clearSessionUnread,      // 清空会话未读
    }
})