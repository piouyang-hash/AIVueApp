// 导入Pinia创建仓库的方法 + Vue响应式API
import { defineStore } from 'pinia'
import {computed} from 'vue'
// 导入配置仓库
import { useAiSoftwareConfigStore } from '@/stores/aiSoftwareConfig.js'
import {useAiMessageStore} from "@/stores/AiChat/session-related/aiMessageStore.js";
import {useBaseSessionStore} from "@/stores/AiChat/baseSessionStore.js";

// 创建会话仓库
export const useUnReadMessageStore = defineStore('unReadMessage', () => {

    // 初始化配置仓库
    const configStore = useAiSoftwareConfigStore()
    const baseSessionStore = useBaseSessionStore()
    const aiMessageStore = useAiMessageStore()

    // 🔥 核心优化1：自动给【每个会话】赋值后端同款字段：normalUnreadCount / splitUnreadCount
    // 遍历会话 → 计算未读数 → 直接挂载到会话对象上（和后端字段名完全一致）
    const fillSessionUnreadCount = computed(() => {
        baseSessionStore.chatList.forEach(session => {
            const sessionUuid = session.sessionUuid
            if (!sessionUuid) return

            // 获取当前会话消息
            const messages = aiMessageStore.mergedSessionMessages[sessionUuid] || []

            // 1. 非切分未读：匹配后端字段 normalUnreadCount
            const normalUnreadCount = messages.filter(msg => msg.isRead === false).length

            // 2. 切分未读：匹配后端字段 splitUnreadCount
            let splitUnreadCount = 0
            messages.forEach(msg => {
                const splits = msg.splitContent || []
                splitUnreadCount += splits.filter(s => s.isRead === false).length
            })

            // 🔥 关键：直接给会话对象赋值（和后端字段名1:1对齐）
            session.normalUnreadCount = normalUnreadCount
            session.splitUnreadCount = splitUnreadCount
        })
        return baseSessionStore.chatList
    })

    // 核心优化2：极简版全会话未读数（直接从会话字段读取，无需重复计算）
    const sessionAllUnreadCount = computed(() => {
        const result = {}
        // 直接取已经计算好的会话字段，0计算成本
        fillSessionUnreadCount.forEach(session => {
            result[session.sessionUuid] = {
                normalUnreadCount: session.normalUnreadCount,
                splitUnreadCount: session.splitUnreadCount
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

        // 获取未读数据
        const unread = sessionAllUnreadCount[sessionUuid]
        if (!unread) return 0

        // 🔥 核心：匹配后端标准字段名
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

    // 🔥 清空指定会话的所有未读
    const clearSessionUnread = (sessionUuid) => {
        const messages = aiMessageStore.mergedSessionMessages[sessionUuid] || []
        messages.forEach(msg => {
            msg.isRead = true
            msg.splitContent?.forEach(s => s.isRead = true)
        })
    }

    // 暴露所有数据和方法
    return {
        // ======================================
        // 🔥 4. 未读消息管理（核心未读功能）
        // ======================================
        sessionAllUnreadCount,   // 全会话未读总数
        getSessionUnread,        // 查询单个会话未读数
        markMessageAsRead,       // 标记单条消息已读
        markSingleSplitMessageAsRead, // 标记拆分消息已读
        clearSessionUnread,      // 清空会话未读
    }
})