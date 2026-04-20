// 导入Pinia创建仓库的方法 + Vue响应式API
import { defineStore } from 'pinia'
import {computed, ref} from 'vue'
import {getChatMessages} from "@/services/ai_chat.session.service.js";
import {useBaseSessionStore} from "@/stores/AiChat/baseSessionStore.js";

// 创建会话仓库
export const useAiMessageStore = defineStore('aiMessage', () => {

    const baseSessionStore = useBaseSessionStore()

    // 🔥 核心新增：会话消息映射
    // 结构：{ sessionUuid1: [消息1, 消息2], sessionUuid2: [消息数组] }
    const sessionMessages = ref({})

    // 🔥 最终正确结构：会话UUID → { 任务ID: AI正在回复的消息 }
    // 一个会话可以同时存在多个 taskId 任务（插队/连发场景）
    const streamingAiMessage = ref({})

    // 🔥 最终正确结构：会话UUID → { taskId: 等待回复的用户消息 }
    // 对齐AI多任务结构，支持taskId维度存储
    const waitingUserMessage = ref({})

    // 🔥 逆天核心：自动合并【历史消息 + 多任务等待用户消息 + 多任务流式消息】
    // 规则：正常合并 → 全局去重（相同messageId只保留一个，删除重复）
    const mergedSessionMessages = computed(() => {
        const merged = {}

        Object.keys(sessionMessages).forEach(sessionUuid => {
            // 1. 历史消息
            const historyMessages = sessionMessages[sessionUuid] || []

            // 🔥 核心：提取【历史消息中 所有用户消息的 taskId】（只针对USER）
            const historyUserTaskIds = new Set(
                historyMessages
                    .filter(item => item.role === 'USER' && item.taskId)
                    .map(item => item.taskId)
            )

            // 2. 等待用户消息：过滤掉【和历史用户消息taskId相同】的项
            const waitingTaskMap = waitingUserMessage[sessionUuid] || {}
            const userWaitingMessages = Objects(waitingTaskMap).filter(msg => {
                // 如果等待消息的taskId，在历史用户消息里存在 → 删掉
                return !historyUserTaskIds.has(msg.taskId)
            })

            // 3. AI流式消息（不变）
            const streamingTaskMap = streamingAiMessage[sessionUuid] || {}
            const streamingMessages = Objects(streamingTaskMap)

            // 正常合并
            merged[sessionUuid] = [
                ...historyMessages,
                ...userWaitingMessages,
                ...streamingMessages
            ]
        })

        return merged
    })

    // 🔥 便捷方法：获取【当前会话】合并后的完整消息列表（组件直接用）
    const getCurrentMergedMessages = computed(() => {
        const uuid = baseSessionStore.currentSessionUuid
        return mergedSessionMessages[uuid] || []
    })

    // 🔥 新增1：给指定会话 设置/覆盖 完整消息数组
    const setSessionMessages = (sessionUuid, messagesArray) => {
        // 直接赋值：键是sessionUuid，值是消息数组
        sessionMessages[sessionUuid] = messagesArray || []
        console.log(`会话${sessionUuid} 消息数组已赋值：`, messagesArray)
    }

    // 🔥 新增2：给指定会话 追加单条消息（发消息时用）
    const pushMessageToSession = (sessionUuid, messageItem) => {
        // 🔧 核心处理：校验messageId，无则添加临时消息标记
        // 展开原消息所有标准字段，无messageId时自动追加 tempMessage: true
        const finalMessage = {
            ...messageItem,
            ...(!messageItem.messageId && { tempMessage: true })
        };

        // 如果这个会话还没有消息数组，先初始化空数组
        if (!sessionMessages[sessionUuid]) {
            sessionMessages[sessionUuid] = [];
        }

        // 追加处理完成的标准消息
        sessionMessages[sessionUuid].push(finalMessage);

        // 强制触发 Vue 响应式更新
        sessionMessages.value = { ...sessionMessages };
    };

    // 最终版：填充临时消息（按 sessionUuid + taskId 精准定位，彻底解耦）
    // 对标 AI：update + clear 二合一，仅操作指定taskId的等待用户消息
    const fillTempMessage = (sessionUuid, meta, taskId) => {
        // 1. 双重校验：必须拿到会话 + taskId 容器
        if (!waitingUserMessage[sessionUuid]) return;
        const sessionTaskMap = waitingUserMessage[sessionUuid];
        const waitingMsg = sessionTaskMap[taskId];
        if (!waitingMsg) return;

        // 2. 填充字段
        waitingMsg.messageId = meta.userMessageId;
        waitingMsg.content = meta.userMessage;
        waitingMsg.sessionUuid = meta.sessionUuid;
        waitingMsg.userId = meta.userId;
        waitingMsg.isComplete = true;
        delete waitingMsg.tempMessage;

        // 覆盖赋值，杜绝残留
        waitingUserMessage.value = { ...waitingUserMessage };

        console.log(`✅ 清理完成，无残留：taskId=${taskId}`);
    };

    // 修正：创建等待中用户消息（参数新增 taskId，结构对齐AI）
    // 新增参数：messageId（后端生成的用户消息ID）
    const createUserWaitingMessage = (sessionUuid, content, taskId, messageId) => {
        const userMessage = {
            content: content,
            role: 'USER',
            createTime: new Date().toLocaleString(),
            sortTimestamp: Date.now(),
            isComplete: false,
            taskId: taskId,
            messageId: messageId, // 🔥 核心：赋值后端返回的消息ID
        };

        // 1. 会话不存在则初始化空对象
        if (!waitingUserMessage[sessionUuid]) {
            waitingUserMessage[sessionUuid] = {};
        }
        // 2. 按 taskId 存储（和AI逻辑完全一致）
        waitingUserMessage[sessionUuid][taskId] = userMessage;
        // 3. 触发Vue响应式
        waitingUserMessage.value = { ...waitingUserMessage };

        // ✅ 用户发送消息 → 立即更新会话最后一条消息
        baseSessionStore.updateSessionLastMessage(sessionUuid, content);

        return `user_${Date.now()}`;
    };

    // 🔥 修正：创建AI回复消息（按 sessionUuid + taskId 唯一存储）
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
                    isRead: false // 🔥 初始化分片也加未读
                }]
                : [],
            isComplete: false,
            taskId: taskId,
            // 🔥【核心新增】创建时就标记：默认未读（响应式字段！）
            isRead: false
        };

        // 下面原有代码完全不动
        if (!streamingAiMessage[sessionUuid]) {
            streamingAiMessage[sessionUuid] = {};
        }
        streamingAiMessage[sessionUuid][taskId] = aiMessage;
        streamingAiMessage.value = { ...streamingAiMessage };

        baseSessionStore.updateSessionLastMessage(sessionUuid, aiMessage.content);

        return meta.aiMessageId;
    };

    // 更新AI回复消息（双维度定位：sessionUuid + taskId）
    const updateAiReplyMessage = (sessionUuid, text, taskId) => {
        // 1. 找到对应会话
        const sessionTaskMap = streamingAiMessage[sessionUuid];
        if (!sessionTaskMap) return;

        // 2. 找到对应 taskId 的正在回复的消息
        const aiMessage = sessionTaskMap[taskId];
        if (!aiMessage) return;

        // 正常更新内容
        aiMessage.content += text;
        if (!aiMessage.sortTimestamp) {
            aiMessage.sortTimestamp = Date.now();
        }

        // 🔥【核心修改】给切分分片添加 isRead: false（默认未读）
        aiMessage.splitContent.push({
            content: text,
            timestamp: Date.now(),
            isRead: false  // 切分消息自身的未读标记
        });

        // 响应式更新
        streamingAiMessage.value = { ...streamingAiMessage };

        // 实时更新会话最后消息
        baseSessionStore.updateSessionLastMessage(sessionUuid, text);
    };

    // 🔥 最终版：回写+清理流式消息（按 taskId 精准清理，不影响同会话其他任务）
    const clearStreamingMessageByUuid = (sessionUuid, taskId) => {
        // 1. 基础校验：会话和任务ID必须都存在
        if (!sessionUuid || !taskId || !streamingAiMessage[sessionUuid]) return;

        // 2. 获取当前会话下的所有任务消息
        const sessionTaskMap = streamingAiMessage[sessionUuid];
        // 3. 找到当前 taskId 对应的流式消息
        const completeMessage = sessionTaskMap[taskId];

        // 4. 消息不存在则直接返回
        if (!completeMessage) return;

        // 5. 标记消息完成（必须加！）
        completeMessage.isComplete = true;

        // 6. 写入会话历史消息（原有逻辑不变）
        pushMessageToSession(sessionUuid, completeMessage);

        // 7. 🔥 核心：只删除当前 taskId 的流式消息，不删除整个会话！
        delete sessionTaskMap[taskId];
        // 8. 触发Vue响应式更新
        streamingAiMessage.value = { ...streamingAiMessage };

        console.log(`✅ 流式消息[任务ID:${taskId}]已回写历史：会话【${sessionUuid}】`);
    };

    // 🔥 新增：清空所有会话的流式AI消息（全量清理，如退出登录、重置页面）
    const clearAllStreamingMessages = () => {
        streamingAiMessage.value = {};
        console.log('✅ 已清空所有会话的流式AI消息');
    }

    // 🔥 核心新增：无参数获取【当前会话】的消息列表
    // 组件直接调用，无需传参！内部自动用 currentSessionUuid
    const fetchCurrentSessionMessages = async () => {
        // 1. 自动获取当前选中的会话UUID（仓库内部取值，组件无传参）
        const sessionUuid = baseSessionStore.currentSessionUuid

        // 2. 安全判断：没有选中会话时直接终止
        if (!sessionUuid) {
            console.warn('未选中任何会话，无法获取消息');
            return;
        }

        try {
            console.log(`开始获取会话【${sessionUuid}】的消息...`);
            // 3. 调用你的接口（自动传当前sessionUuid）
            const messageList = await getChatMessages(sessionUuid);
            console.log(`会话【${sessionUuid}】消息获取成功：`, messageList);

            // 🔥 核心修改：调用统一的 set 方法赋值，不再直接操作 ref
            setSessionMessages(sessionUuid, messageList);
        } catch (error) {
            console.error(`获取会话【${sessionUuid}】消息失败：`, error);
            // 🔥 核心修改：失败时也调用 set 方法，赋值空数组
            setSessionMessages(sessionUuid, []);
        }
    }

    // 暴露所有数据和方法
    return {
        // ======================================
        // 🔥 3. 消息数据存储（所有聊天消息）
        // ======================================
        sessionMessages,         // 会话消息映射
        mergedSessionMessages,   // 合并后的会话消息
        waitingUserMessage,      // 等待中的用户消息
        streamingAiMessage,      // AI流式输出消息

        fetchCurrentSessionMessages, // 获取当前会话消息

        // ======================================
        // 🔥 9. 消息操作（发送/更新/清空）
        // ======================================
        setSessionMessages,      // 设置会话全量消息
        pushMessageToSession,    // 追加单条消息
        getCurrentMergedMessages,// 获取当前合并消息
        clearStreamingMessageByUuid, // 清空流式消息
        fillTempMessage,         // 填充临时消息
        createUserWaitingMessage,// 创建用户等待消息
        createAiReplyMessage,    // 创建AI回复消息
        updateAiReplyMessage,    // 更新AI回复消息

    }
})