<template>
  <!-- 循环消息列表 -->
  <div
      class="message-group"
      v-for="(item, index) in sortedMessages"
      :key="item.messageId"
  >
    <MessageBubble
        :item="item"
    />
  </div>
</template>

<script setup>
import {computed} from 'vue'

import {useAiSoftwareConfigStore} from '@/stores/aiSoftwareConfig'

// ========== 3. 仓库初始化 ==========
import {useSessionStore} from '@/stores/sessionStore'
import MessageBubble from "./MessageBubble.vue";


const sessionStore = useSessionStore()


const configStore = useAiSoftwareConfigStore()
// ========== 2. 定义Emit ==========
const emit = defineEmits([
  'avatar-click',
  'init-complete'
])


// ========== 4. 计算属性：当前会话消息 ==========
// 🔥 直接复用 Store 里封装好的 getCurrentMergedMessages
const currentMessages = computed(() => {
  return sessionStore.getCurrentMergedMessages
})

// ==============================================
// ✅ 新增：按 sortTimestamp 排序的消息数组（核心实现）
// ==============================================
const sortedMessages = computed(() => {
  // 原始消息列表
  const messages = currentMessages.value

  // 1. 切分消息模式 → 直接遍历添加 index 后返回
  if (configStore.isSplitMessageEnabled) {
    return messages.map((item, index) => {
      // 给每条消息追加自身索引，不修改原对象
      return { ...item, index }
    })
  }

  // 2. 不切分模式：先排序 → 再遍历添加 index
  const sorted = [...messages].sort((a, b) => {
    const timeA = Number(a.sortTimestamp) || 0
    const timeB = Number(b.sortTimestamp) || 0
    return timeA - timeA // 升序：旧消息在上，新消息在下
  })

  // 排序后给每条消息添加 index
  return sorted.map((item, index) => {
    return { ...item, index }
  })
})

// ========== 8. 头像点击事件 ==========
const handleAvatarClick = (item, index) => {
  const roleText = item.role === 'USER' ? '用户' : 'AI助手'
  emit('avatar-click', {item, index})
}
</script>

<style scoped>
/* 消息组：单组内的分段消息间距 */
.message-group {
  display: flex;
  flex-direction: column;
  gap: 12px; /* AI分段消息之间的垂直间距（核心解决间隙问题） */

}
</style>