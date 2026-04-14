// 消息状态仓库（仅管理长按激活的消息ID）
import { defineStore } from 'pinia'
import { ref } from 'vue'

// 创建消息仓库
export const useMessageStore = defineStore('message', () => {
  // 长按激活的消息ID（唯一状态，默认无）
  const activeMessageId = ref(null)

  // 设置激活消息ID的方法（调用即可赋值）
  const setActiveMessageId = (id) => {
    activeMessageId.value = id
  }

  // 导出状态和方法
  return {
    activeMessageId,
    setActiveMessageId
  }
})