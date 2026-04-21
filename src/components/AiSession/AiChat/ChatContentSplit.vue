<template>
  <div
      class="message-group"
      v-for="(item, index) in flatSortedMessagesForSplitMode"
      :key="index"
  >
    <SplitMessageBubble
        :item="item"
    />
  </div>
</template>

<script setup>
import {computed} from 'vue'
import {useAiSoftwareConfigStore} from '@/stores/aiSoftwareConfig'
// ========== 3. 仓库初始化 ==========
import SplitMessageBubble from "./SplitMessageBubble.vue";
import {useAiMessageStore} from "@/stores/AiChat/session-related/aiMessageStore.js";


const aiMessageStore = useAiMessageStore();

const configStore = useAiSoftwareConfigStore()

// ========== 2. 定义Emit ==========
const emit = defineEmits([
  'avatar-click',
  'init-complete'
])


// ========== 4. 计算属性：当前会话消息 ==========
// 🔥 直接复用 Store 里封装好的 getCurrentMergedMessages
const currentMessages = computed(() => {
  return aiMessageStore.getCurrentMergedMessages
})

// ✅ 🔥 新增：切分模式下的【全局扁平化时间排序】核心
const flatSortedMessagesForSplitMode = computed(() => {
  if (!configStore.isSplitMessageEnabled) return []

  const flatList = []

  // 遍历所有消息，把用户消息 + AI分片全部拍平
  currentMessages.value.forEach(msg => {
    if (msg.role === 'USER') {
      // 用户：直接加入，使用自己的时间戳 + 携带 messageId
      flatList.push({
        role: 'USER',
        messageId: msg.messageId,
        timestamp: Number(msg.sortTimestamp) || 0,
        source: msg
      })
    }

    if (msg.role === 'ASSISTANT') {
      // AI：把每一片都拆成独立项，使用片内 timestamp
      const splits = msg.splitContent || []
      splits.forEach((split, idx) => {
        flatList.push({
          role: 'ASSISTANT',
          messageId: msg.messageId,
          timestamp: Number(split.timestamp) || 0,
          source: msg,
          split,
          splitIndex: idx
        })
      })
    }
  })

  // 全局按时间戳升序排序 + 🔥 给每一项添加自身索引 index
  return flatList.sort((a, b) => a.timestamp - b.timestamp).map((item, index) => {
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