import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import WebSocketClient from '@/utils/websocketUtil'
import {useSessionStore} from "@/stores/sessionStore.js";
import {parseChatChunk} from "@/services/ai_chat.service.js";


// 全局单例：AI 流式消息接收器（只负责接收回复，和心跳分离）
export const useAiMessageReceiverStore = defineStore('aiMessageReceiver', () => {
    const sessionStore = useSessionStore()

    // 全局唯一 WebSocket 实例
    const wsClient = ref(null)
    const currentTask = ref({
        sessionUuid: null,
        taskId: null
    })
    const isConnected = computed(() => wsClient.value?.connected || false)

    // 核心：全局建立连接（适配后端 sessionUuid:taskId 规则）
    //  ====================== 顶部新增：管理多个WebSocket连接 ======================
    // 存储所有连接：key = taskId，value = WebSocket实例
    const wsClientMap = ref({})
    // 存储当前会话的所有任务
    const currentTaskList = ref([])

    //  ====================== 改造后的connect函数 ======================
    const connect = (sessionUuid, taskId) => {
        const WS_BASE_URL = 'ws://localhost:8086/ai/chat/stream'

        // 1. 参数校验
        if (!sessionUuid || !taskId) {
            console.error("WebSocket连接失败：sessionUuid或taskId为空")
            return
        }

        // 2. 🔥 关键：如果该taskId已经有连接，直接复用（避免重复连接）
        if (wsClientMap.value[taskId]) {
            console.log('✅ 任务已存在连接：', taskId)
            return
        }

        // 3. 🔥 关键：不关闭旧连接！保留所有任务的连接（保证不丢消息）
        // 移除了 disconnect() 逻辑，旧连接持续接收消息

        let aiMessageId = null
        const finalSessionUuid = sessionUuid
        const finalTaskId = taskId

        // 4. 创建新的WebSocket（每个taskId独立）
        const newWs = new WebSocketClient({
            reconnectInterval: 3000,
            maxReconnectTimes: 10
        })

        // 5. 绑定唯一的 taskId 通道（匹配后端）
        const wsUrl = `${WS_BASE_URL}?sessionUuid=${sessionUuid}&taskId=${taskId}`
        newWs.setWsUrl(wsUrl)

        // 6. 存储连接和任务
        wsClientMap.value[taskId] = newWs
        currentTaskList.value.push({ sessionUuid, taskId })

        // 7. 独立的消息回调（每个taskId自己处理自己的消息）
        newWs.on({
            open: () => {
                console.log('✅ 连接成功：', sessionUuid + ":" + taskId)
            },
            message: (rawData) => {
                parseChatChunk(
                    rawData,
                    (meta) => {
                        const targetSessionUuid = meta.sessionUuid || finalSessionUuid
                        aiMessageId = sessionStore.createAiReplyMessage(targetSessionUuid, meta, finalTaskId)
                        sessionStore.fillTempMessage(targetSessionUuid, meta)
                    },
                    (text) => {
                        if (!aiMessageId) return
                        sessionStore.updateAiReplyMessage(finalSessionUuid, aiMessageId, text, finalTaskId)
                    },
                    () => {
                        sessionStore.updateSessionTaskStatus(finalSessionUuid, finalTaskId, 'finished')
                        sessionStore.clearStreamingMessageByUuid(finalSessionUuid, finalTaskId)
                        console.log('🔚 任务完成：', finalTaskId)
                        // 任务完成后，清理连接（释放资源）
                        newWs.close()
                        delete wsClientMap.value[finalTaskId]
                        currentTaskList.value = currentTaskList.value.filter(t => t.taskId !== finalTaskId)
                    },
                    (err) => console.error('解析失败：', err)
                )
            },
            close: () => console.log("🔌 连接关闭：", taskId),
            error: (err) => console.error("❌ 连接错误：", taskId, err)
        })

        newWs.connect()
    }

    // 安全断开连接
    const disconnect = () => {
        if (wsClient.value) {
            wsClient.value.close()
            wsClient.value = null
            currentTask.value = { sessionUuid: null, taskId: null }
        }
    }

    return {
        currentTask,
        isConnected,
        connect,
        disconnect
    }
}, {
    persist: false
})