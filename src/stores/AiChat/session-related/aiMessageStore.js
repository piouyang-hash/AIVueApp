// 导入Pinia创建仓库的方法 + Vue响应式API
import { defineStore } from 'pinia'
import {computed, ref} from 'vue'
import {useBaseSessionStore} from "@/stores/AiChat/baseSessionStore.js";
import {getChatMessages} from "@/services/ai_chat.message.service.js";

// 创建会话仓库
export const useAiMessageStore = defineStore('aiMessage', () => {

    const baseSessionStore = useBaseSessionStore()

    // 🔥 核心新增：会话消息映射
    const sessionMessages = ref({})

    // 🔥 最终正确结构：会话UUID → { 任务ID: AI正在回复的消息 }
    const streamingAiMessage = ref({})

    // 🔥 最终正确结构：会话UUID → { taskId: 等待回复的用户消息 }
    const waitingUserMessage = ref({})

    // 🔥 逆天核心：自动合并【历史消息 + 多任务等待用户消息 + 多任务流式消息】
    const mergedSessionMessages = computed(() => {
        const merged = {}

        const messageMap = sessionMessages.value || {}
        Object.keys(messageMap).forEach(sessionUuid => {
            const historyMessages = Array.isArray(messageMap[sessionUuid])
                ? messageMap[sessionUuid]
                : []

            const historyUserTaskIds = new Set(
                historyMessages
                    .filter(item => item.role === 'USER' && item.taskId)
                    .map(item => item.taskId)
            )

            const waitingTaskMap = waitingUserMessage.value[sessionUuid] || {}
            const userWaitingMessages = Object.values(waitingTaskMap).filter(msg => {
                return !historyUserTaskIds.has(msg.taskId)
            })

            const streamingTaskMap = streamingAiMessage.value[sessionUuid] || {}
            const streamingMessages = Object.values(streamingTaskMap)

            merged[sessionUuid] = [
                ...historyMessages,
                ...userWaitingMessages,
                ...streamingMessages
            ]
        })

        return merged
    })

    // 🔥 便捷方法：获取【当前会话】合并后的完整消息数组
    const getCurrentMergedMessages = computed(() => {
        const uuid = baseSessionStore.currentSessionUuid
        // ✅ 修复：必须加 .value
        return mergedSessionMessages.value[uuid] || []
    })

    // 🔥 新增1：给指定会话 设置/覆盖 完整消息数组
    const setSessionMessages = (sessionUuid, messagesArray) => {
        // ✅ 修复：必须加 .value
        sessionMessages.value[sessionUuid] = messagesArray || []
        console.log(`会话${sessionUuid} 消息数组已赋值：`, messagesArray)
    }

    // 🔥 新增2：给指定会话 追加单条消息（发消息时用）
    const pushMessageToSession = (sessionUuid, messageItem) => {
        const finalMessage = {
            ...messageItem,
            ...(!messageItem.messageId && { tempMessage: true })
        };

        // ✅ 修复：所有地方加 .value
        if (!sessionMessages.value[sessionUuid]) {
            sessionMessages.value[sessionUuid] = [];
        }

        sessionMessages.value[sessionUuid].push(finalMessage);

        // ✅ 修复：响应式更新
        sessionMessages.value = { ...sessionMessages.value };
    };

    // 最终版：填充临时消息
    const fillTempMessage = (sessionUuid, meta, taskId) => {
        // ✅ 修复：必须加 .value
        if (!waitingUserMessage.value[sessionUuid]) return;
        const sessionTaskMap = waitingUserMessage.value[sessionUuid];
        const waitingMsg = sessionTaskMap[taskId];
        if (!waitingMsg) return;

        waitingMsg.messageId = meta.userMessageId;
        waitingMsg.content = meta.userMessage;
        waitingMsg.sessionUuid = meta.sessionUuid;
        waitingMsg.userId = meta.userId;
        waitingMsg.isComplete = true;
        delete waitingMsg.tempMessage;

        waitingUserMessage.value = { ...waitingUserMessage.value };
    };

    // 修正：创建等待中用户消息
    const createUserWaitingMessage = (sessionUuid, content, taskId, messageId) => {
        const userMessage = {
            content: content,
            role: 'USER',
            createTime: new Date().toLocaleString(),
            sortTimestamp: Date.now(),
            isComplete: false,
            taskId: taskId,
            messageId: messageId,
        };

        // ✅ 修复：必须加 .value
        if (!waitingUserMessage.value[sessionUuid]) {
            waitingUserMessage.value[sessionUuid] = {};
        }
        waitingUserMessage.value[sessionUuid][taskId] = userMessage;
        waitingUserMessage.value = { ...waitingUserMessage.value };

        baseSessionStore.updateSessionLastMessage(sessionUuid, content);

        return `user_${Date.now()}`;
    };

    // 🔥 修正：创建AI回复消息
    const createAiReplyMessage = (sessionUuid, meta, taskId) => {
        const aiMessage = {
            content: meta.aiReplyContent || '',
            role: 'ASSISTANT',
            createTime: new Date().toISOString(),
            messageId: meta.aiMessageId,
            sessionUuid: meta.sessionUuid,
            sortTimestamp: Date.now(),
            splitContent: meta.aiReplyContent
                ? [{
                    content: meta.aiReplyContent,
                    timestamp: Date.now(),
                    isRead: false
                }]
                : [],
            isComplete: false,
            taskId: taskId,
            isRead: false
        };

        // ✅ 修复：必须加 .value
        if (!streamingAiMessage.value[sessionUuid]) {
            streamingAiMessage.value[sessionUuid] = {};
        }
        streamingAiMessage.value[sessionUuid][taskId] = aiMessage;
        streamingAiMessage.value = { ...streamingAiMessage.value };

        baseSessionStore.updateSessionLastMessage(sessionUuid, aiMessage.content);

        return meta.aiMessageId;
    };

    // 更新AI回复消息
    const updateAiReplyMessage = (sessionUuid, text, taskId) => {
        // ✅ 修复：必须加 .value
        const sessionTaskMap = streamingAiMessage.value[sessionUuid];
        if (!sessionTaskMap) return;

        const aiMessage = sessionTaskMap[taskId];
        if (!aiMessage) return;

        aiMessage.content += text;
        if (!aiMessage.sortTimestamp) {
            aiMessage.sortTimestamp = Date.now();
        }

        aiMessage.splitContent.push({
            content: text,
            timestamp: Date.now(),
            isRead: false
        });

        streamingAiMessage.value = { ...streamingAiMessage.value };

        baseSessionStore.updateSessionLastMessage(sessionUuid, text);
    };

    // 🔥 最终版：回写+清理流式消息
    const clearStreamingMessageByUuid = (sessionUuid, taskId) => {
        // ✅ 修复：必须加 .value
        if (!sessionUuid || !taskId || !streamingAiMessage.value[sessionUuid]) return;

        const sessionTaskMap = streamingAiMessage.value[sessionUuid];
        const completeMessage = sessionTaskMap[taskId];

        if (!completeMessage) return;

        completeMessage.isComplete = true;

        pushMessageToSession(sessionUuid, completeMessage);

        delete sessionTaskMap[taskId];
        streamingAiMessage.value = { ...streamingAiMessage.value };

        console.log(`✅ 流式消息[任务ID:${taskId}]已回写历史：会话【${sessionUuid}】`);
    };

    // 🔥 新增：清空所有会话的流式AI消息
    const clearAllStreamingMessages = () => {
        streamingAiMessage.value = {};
        console.log('✅ 已清空所有会话的流式AI消息');
    }

    // 🔥 核心新增：无参数获取【当前会话】的消息列表
    const fetchCurrentSessionMessages = async () => {
        const sessionUuid = baseSessionStore.currentSessionUuid

        if (!sessionUuid) {
            console.warn('未选中任何会话，无法获取消息');
            return;
        }

        try {
            console.log(`开始获取会话【${sessionUuid}】的消息...`);
            const messageList = await getChatMessages(sessionUuid);
            console.log(`会话【${sessionUuid}】消息获取成功：`, messageList);

            setSessionMessages(sessionUuid, messageList);
        } catch (error) {
            console.error(`获取会话【${sessionUuid}】消息失败：`, error);
            setSessionMessages(sessionUuid, []);
        }
    }

    return {
        sessionMessages,
        mergedSessionMessages,
        waitingUserMessage,
        streamingAiMessage,
        fetchCurrentSessionMessages,
        setSessionMessages,
        pushMessageToSession,
        getCurrentMergedMessages,
        clearStreamingMessageByUuid,
        fillTempMessage,
        createUserWaitingMessage,
        createAiReplyMessage,
        updateAiReplyMessage,
        clearAllStreamingMessages
    }
})