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

    // 核心：全局建立连接
    const connect = (sessionUuid, taskId) => {
        const WS_BASE_URL = 'ws://localhost:8086/ai/chat/stream'

        if (
            wsClient.value &&
            currentTask.value.sessionUuid === sessionUuid &&
            currentTask.value.taskId === taskId
        ) {
            return
        }

        disconnect()

        let aiMessageId = null
        const finalSessionUuid = sessionUuid

        wsClient.value = new WebSocketClient({
            reconnectInterval: 3000,
            maxReconnectTimes: 10
        })

        const wsUrl = `${WS_BASE_URL}?sessionUuid=${sessionUuid}&taskId=${taskId}`
        wsClient.value.setWsUrl(wsUrl)
        currentTask.value = { sessionUuid, taskId }

        wsClient.value.on({
            open: () => {
                console.log('✅ 全局AI消息接收器：连接成功')
            },
            message: (rawData) => {
                parseChatChunk(
                    rawData,
                    (meta) => {
                        const newSessionUuid = meta.sessionUuid
                        const targetSessionUuid = newSessionUuid || finalSessionUuid

                        if (!finalSessionUuid && newSessionUuid) {
                            sessionStore.setCurrentSessionUuid(newSessionUuid)
                        }

                        // 🔥 改造：传入 taskId
                        aiMessageId = sessionStore.createAiReplyMessage(targetSessionUuid, meta, taskId)
                        sessionStore.fillTempMessage(targetSessionUuid, meta)
                    },
                    (text) => {
                        if (!aiMessageId) return
                        // 🔥 改造：传入 taskId
                        sessionStore.updateAiReplyMessage(finalSessionUuid, aiMessageId, text, taskId)
                    },
                    () => {
                        sessionStore.updateSessionTaskStatus(finalSessionUuid, taskId, 'finished')
                        // 🔥 改造：传入 taskId
                        sessionStore.clearStreamingMessageByUuid(finalSessionUuid, taskId)
                        console.log('🔚 全局AI消息接收器：任务完成')
                        disconnect()
                    },
                    (err) => console.error('解析失败：', err)
                )
            },
            close: () => {},
            error: () => {}
        })

        wsClient.value.connect()
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