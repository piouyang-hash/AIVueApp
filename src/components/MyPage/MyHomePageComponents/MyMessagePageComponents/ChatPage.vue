<template>
  <MyMessageLayout>
    <div class="chat-page">
      <PageHeader title="客服" @back="handleBack"/>

      <!-- 聊天内容区域 -->
      <div class="chat-content">
        <!-- 客服消息 -->
        <div class="chat-item service-chat">
          <div class="chat-bubble">
            您好，有什么可以帮助您的？
          </div>
        </div>
        <!-- 用户消息（动态渲染） -->
        <div class="chat-item user-chat" v-for="(msg, index) in chatList" :key="index">
          <div class="chat-bubble">
            {{ msg }}
          </div>
        </div>
      </div>

      <!-- 底部输入区域 -->
      <div class="chat-input-area">
        <input
            type="text"
            class="chat-input"
            v-model="inputMsg"
            placeholder="请输入消息..."
            @keyup.enter="sendMsg"
        >
        <button class="send-btn" @click="sendMsg" :disabled="!inputMsg.trim()">
          发送
        </button>
      </div>
    </div>
  </MyMessageLayout>
</template>

<script setup>
import { ref } from 'vue'
// 1. 导入路由钩子函数
import { useRouter } from 'vue-router'
import PageHeader from "@/components/Tiny/PageHeader.vue";
import MyMessageLayout from "@/components/MyPage/MyHomePageComponents/MyMessagePageComponents/MyMessageLayout.vue";

// 2. 创建路由实例
const router = useRouter()

// 响应式数据：聊天列表、输入框内容
const chatList = ref([])
const inputMsg = ref('')

// 3. 修改返回事件：跳转到MyMessage路由
const handleBack = () => {
  router.push({ name: 'MyMessage' })
}

// 发送消息逻辑（不变）
const sendMsg = () => {
  const msg = inputMsg.value.trim()
  if (!msg) return
  chatList.value.push(msg)
  inputMsg.value = ''
  // 滚动到聊天底部
  setTimeout(() => {
    const chatContent = document.querySelector('.chat-content')
    chatContent.scrollTop = chatContent.scrollHeight
  }, 0)
}
</script>

<style scoped>
/* 页面全局样式 */
.chat-page {
  width: 100%;
  height: 100vh;
  background-color: var(--bg-color);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-bottom: 80px;
}

/* 聊天内容区域 */
.chat-content {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
}
.chat-item {
  margin-bottom: 15px;
}
/* 客服消息 */
.service-chat {
  display: flex;
  justify-content: flex-start;
}
/* 用户消息 */
.user-chat {
  display: flex;
  justify-content: flex-end;
}
/* 聊天气泡 */
.chat-bubble {
  max-width: 70%;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.4;
}
.service-chat .chat-bubble {
  background-color: var(--card-bg);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-top-left-radius: 0;
}
.user-chat .chat-bubble {
  background-color: var(--primary-color);
  color: white;
  border-top-right-radius: 0;
}

/* 底部输入区域 */
.chat-input-area {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  border-top: 1px solid var(--border-color);
  background-color: var(--card-hover);
  gap: 10px;
}
.chat-input {
  flex: 1;
  height: 40px;
  padding: 0 15px;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  background-color: var(--gray-50);
  color: var(--text-primary);
  outline: none;
}
.chat-input::placeholder {
  color: var(--text-tertiary);
}
.send-btn {
  width: 80px;
  height: 40px;
  border: none;
  border-radius: 20px;
  background-color: var(--primary-color);
  color: white;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.send-btn:disabled {
  background-color: var(--gray-300);
  cursor: not-allowed;
}
.send-btn:hover:not(:disabled) {
  background-color: var(--gray-700);
}
</style>