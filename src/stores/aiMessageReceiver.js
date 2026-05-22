import { defineStore } from 'pinia'
// 仅导入：全局WS连接store + 消息解析工具
import { useWebSocketConnectionStore } from "@/stores/websocket-connection"
import { parseChatChunk } from "@/services/ai_chat.service.js"
import {useAiMessageStore} from "@/stores/AiChat/session-related/aiMessageStore.js";
import {useAiMessageTaskStore} from "@/stores/AiChat/session-related/aiMessageTaskStore.js";

/**
 * AI 流式消息接收器（纯消息接收+解析+打印）
 * 🔥 完全复用全局WebSocket单例连接，无独立连接、无业务逻辑
 */
export const useAiMessageReceiverStore = defineStore('aiMessageReceiver', {
    actions: {
        /**
         * 初始化AI消息接收服务（登录后调用一次）
         * 用法：const aiMsgStore = useAiMessageReceiverStore(); aiMsgStore.initAiMessageReceiver()
         */
        initAiMessageReceiver() {
            // 获取全局WebSocket连接实例
            const wsConnStore = useWebSocketConnectionStore()

            // 订阅全局WebSocket消息（所有消息统一分发到这里）
            wsConnStore.subscribeMessage((rawData) => {
                this._handleWsMessage(rawData)
            })

            console.log('✅ 业务：AI流式消息接收服务初始化完成（复用全局WS连接）')
        },

        /**
         * 私有：处理WS原始消息（仅解析AI_PUSH类型消息 + 打印日志）
         */
        _handleWsMessage(rawData) {

            const aiMessageStore = useAiMessageStore()
            const aiMessageTaskStore = useAiMessageTaskStore()

            // 1. 服务器返回的是 JSON 字符串 → 先解析（加容错，防止报错）
            let data = null;
            try {
                data = JSON.parse(rawData);
            } catch (e) {
                // 非JSON消息（比如内部bind_ready信号），直接忽略/不处理
                return;
            }

            // 2. 只处理AI推送类型消息
            if (data.msgType === 'AI_PUSH') {
                // 取出AI流式消息内容（后端直接传递的chunk）
                const aiChunk = data.message;

                try {
                    parseChatChunk(
                        aiChunk,
                        // 🔥 首帧：sessionUuid在前，meta元数据（原业务逻辑1:1还原）
                        (sessionUuid, meta) => {
                            // 直接使用回调的sessionUuid，替代原targetSessionUuid
                            aiMessageStore.createAiReplyMessage(sessionUuid, meta, meta.taskId)
                            aiMessageStore.fillTempMessage(sessionUuid, meta, meta.taskId)
                        },
                        // 🔥 文本帧：sessionUuid在前，content对象（原业务逻辑1:1还原）
                        (sessionUuid, content) => {
                            // 从content中获取taskId，更新消息
                            aiMessageStore.updateAiReplyMessage(sessionUuid, content.aiReplyContent, content.taskId)
                        },
                        // 🔥 结束帧：sessionUuid在前，taskId在后（删除所有断连逻辑，仅保留业务）
                        (sessionUuid, taskId) => {
                            aiMessageTaskStore.updateSessionTaskStatus(sessionUuid, taskId, 'finished')
                            // 🔥 在这里调用：清理用户等待消息（写入会话 + 去重）
                            aiMessageStore.clearWaitingUserMessage(sessionUuid, taskId)
                            aiMessageStore.clearStreamingMessageByUuid(sessionUuid, taskId)
                            console.log('🔚 任务完成：', taskId)
                            // ✅ 长连接：删除所有断开连接/清理连接池的代码
                        },
                        // 🔥 【新增】AI业务错误处理（从errorContent获取taskId，修改状态+双回写）
                        (sessionUuid, errorContent) => {
                            // 从错误内容中获取 taskId（核心修改）
                            const taskId = errorContent?.taskId;
                            // 防护：没有taskId则不执行后续逻辑
                            if (!taskId) {
                                console.error('❌ AI错误无taskId，终止处理', errorContent);
                                return;
                            }

                            // 1. 任务状态修改为 error
                            aiMessageTaskStore.updateSessionTaskStatus(sessionUuid, taskId, 'error');
                            // 2. 回写用户等待消息
                            aiMessageStore.clearWaitingUserMessage(sessionUuid, taskId);
                            // 3. 回写AI错误消息（错误帧正常回写）
                            aiMessageStore.clearStreamingMessageByUuid(sessionUuid, taskId);

                            // 打印完整错误日志
                            console.error('❌ AI 生成错误：', errorContent, '｜ 会话UUID：', sessionUuid, '｜ 任务ID：', taskId);
                        },
                        // 解析失败（不变）
                        (err) => console.error('解析失败：', err)
                    )
                } catch (e) {
                    console.error('❌ 处理AI消息异常：', e)
                }
            }
        }

    }
}, {
    persist: false
})