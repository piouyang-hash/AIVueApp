<template>
  <div class="chat-container">
    <div class="chat-box">
      <div class="message-box" ref="messageBoxRef">
        <div v-if="aiReply" class="ai-message">{{ aiReply }}</div>
        <div v-if="loading" class="loading">AI 思考中...</div>
        <div v-if="connectStatus" class="status">{{ connectStatus }}</div>
      </div>

      <div class="input-box">
        <input
            v-model="userMessage"
            @keyup.enter="sendMessage"
            placeholder="输入消息，按回车发送..."
            :disabled="loading"
        />
        <button @click="sendMessage" :disabled="loading || !userMessage.trim()">
          {{ loading ? "发送中..." : "发送" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted, nextTick } from 'vue'
// 引入你封装好的测试接口API
// 引入WebSocket工具类（你之前的多实例版本）
import WebSocketClient from '@/utils/websocketUtil'
import {parseChatChunk, testAsyncStream} from "@/services/ai_chat.service.js";

// 配置项
const BASE_URL = 'http://localhost:8086'
const WS_URL = 'ws://localhost:8086/ai/chat/stream'

// 业务数据
const userMessage = ref('')
const aiReply = ref('')
const loading = ref(false)
const connectStatus = ref('')
const messageBoxRef = ref(null)

// 双ID
let sessionUuid = ''
let taskId = ''
let currentWsClient = null

// 发送消息（核心：替换为封装API，删除原生fetch）
const sendMessage = async () => {
  if (!userMessage.value.trim()) return
  const msg = userMessage.value.trim()

  // 🔥 必须传：前端持有的会话UUID（固定/生成都可以）
  const frontSessionUuid = "3b9e4f9a-8346-4b0f-9d1e-8f7c6a5b4d3e"

  aiReply.value = ''
  loading.value = true
  connectStatus.value = '正在启动 AI 任务...'

  try {
    // ==============================================
    // 🔥 🔥 🔥 核心替换：用封装API替代原生fetch
    // ==============================================
    const result = await testAsyncStream(msg, frontSessionUuid);

        // 拆分 会话ID:任务ID
        [sessionUuid, taskId] = result.split(':')

    connectStatus.value = '任务已启动，连接 WebSocket...'
    connectAiWebSocket()

  } catch (err) {
    connectStatus.value = '请求失败，请重试！'
    loading.value = false
    console.error('接口调用失败：', err)
  }
}

// 连接WebSocket（你之前的多实例版本，保持不变）
const connectAiWebSocket = () => {
  if (currentWsClient) {
    currentWsClient.close()
  }

  currentWsClient = new WebSocketClient({
    reconnectInterval: 3000,
    maxReconnectTimes: 10
  })

  const fullWsUrl = `${WS_URL}?sessionUuid=${sessionUuid}&taskId=${taskId}`
  currentWsClient.setWsUrl(fullWsUrl)

  currentWsClient.on({
    open: () => {
      connectStatus.value = '✅ 连接成功，接收 AI 流式回复...'
      loading.value = false
    },
    // 2. 核心：使用 parseChatChunk 解析 WebSocket 消息
    message: (rawData) => {
      parseChatChunk(
          rawData,
          // 回调1：首帧元数据（你之前的逻辑）
          (meta) => {
            console.log('收到首帧元数据', meta);
            // 核心：把首帧里的AI回复内容拼接到页面
            if (meta.aiReplyContent) {
              aiReply.value += meta.aiReplyContent;
              nextTick(() => {
                messageBoxRef.value.scrollTop = messageBoxRef.value.scrollHeight;
              });
            }
          },
          // 普通文本帧（后续内容正常拼接）
          (text) => {
            aiReply.value += text;
            nextTick(() => {
              messageBoxRef.value.scrollTop = messageBoxRef.value.scrollHeight;
            });
          },
          // 回调3：结束帧（替换原来的 [DONE]）
          () => {
            connectStatus.value = '✅ 回复完成'
            loading.value = false
          },
          // 回调4：解析错误
          (err) => {
            console.warn('WebSocket消息解析失败', err)
          }
      )
    },
    close: () => {
      connectStatus.value = '🔌 连接已断开'
      loading.value = false
    },
    error: () => {
      connectStatus.value = '❌ 连接失败'
      loading.value = false
    }
  })

  currentWsClient.connect()
}

onUnmounted(() => {
  if (currentWsClient) currentWsClient.close()
})
</script>

<style scoped>
.chat-container {
  max-width: 800px;
  margin: 50px auto;
  padding: 0 20px;
}
.chat-box {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  background: #f9fafb;
}
.message-box {
  height: 500px;
  padding: 20px;
  overflow-y: auto;
  border-bottom: 1px solid #e5e7eb;
}
.ai-message {
  font-size: 16px;
  line-height: 1.6;
  color: #111827;
  white-space: pre-wrap;
}
.loading, .status {
  font-size: 14px;
  color: #6b7280;
  margin-top: 10px;
}
.input-box {
  display: flex;
  gap: 10px;
  padding: 15px;
  background: white;
}
input {
  flex: 1;
  padding: 12px 15px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
}
input:disabled {
  background: #f3f4f6;
}
button {
  padding: 12px 20px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
button:disabled {
  background: #a5b4fc;
  cursor: not-allowed;
}
</style>