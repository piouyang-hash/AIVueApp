<template>
  <!-- AI聊天内容区：自治组件核心模板 -->
  <main class="chat-content" ref="chatContentRef">
    <!-- 空状态提示 -->
    <div class="empty-chat" v-if="currentMessages.length === 0">
      <MeridianVein :width="100" :height="100"/>
      <p class="empty-text">开始与智能助手对话吧～</p>
    </div>

    <!-- 消息列表 -->
    <div class="message-list" v-else>
      <!-- 🔥 切分模式：扁平化全局排序 -->
      <template v-if="configStore.isSplitMessageEnabled">
        <ChatContentSplit />
      </template>

      <!-- 🔥 非切分模式：原有逻辑（标签结构已修正） -->
      <template v-else>
        <ChatContentNormal />
      </template>
    </div>
  </main>
  <CircleDownIcon @scroll-to-bottom="scrollToBottom"/>

  <ChoosedMessageOverlay />
</template>

<script setup>
import {computed, nextTick, onMounted, onUnmounted, onUpdated, ref, watch} from 'vue'
// 导入组件和静态资源
import MeridianVein from "@/components/AiSession/AiChat/meridian-vein.vue";
import {SERVICE_URLS} from '@/api/constants/serviceUrls'
import {useAiSoftwareConfigStore} from '@/stores/aiSoftwareConfig'
// ========== 3. 仓库初始化 ==========
import {useSessionStore} from '@/stores/sessionStore'
import {storeToRefs} from "pinia";
import CircleDownIcon from "../../Tiny/CircleDownIcon.vue";
import MessageOptionMenu from "../MessageOptionMenu.vue";
import ChatContentSplit from "./ChatContentSplit.vue";
import ChatContentNormal from "./ChatContentNormal.vue";
import { useModalStore } from '@/stores/modalStore.js'
import ChoosedMessageOverlay from "./ChoosedMessageOverlay.vue";

// 你已有的代码
const modalStore = useModalStore()

const sessionStore = useSessionStore()
const {aiRoleList} = storeToRefs(sessionStore)
const configStore = useAiSoftwareConfigStore()

const chatContentRef = ref(null)

// ==============================================
// 核心：动态控制 全局 * { margin:0 } 样式
// ==============================================
let dynamicStyle = null

// 创建/移除 全局样式
const updateGlobalMarginStyle = (enabled) => {
  // 如果已经有样式节点，先删除
  if (dynamicStyle) {
    dynamicStyle.remove()
    dynamicStyle = null
  }

  // 【切分模式开启】→ 加入全局 margin:0
  if (enabled) {
    dynamicStyle = document.createElement('style')
    // 只加你要的这一行！
    dynamicStyle.innerText = `* { margin: 0 !important; }`
    document.head.appendChild(dynamicStyle)
  }
  // 【非切分模式】→ 不添加，样式自动失效
}

// 1. 你的原有动态底部高度计算（完全不用改！）
const dynamicBottom = computed(() => {
  const currentSessionUuid = sessionStore.currentSessionUuid
  if (!currentSessionUuid) return 100
  const inputConfig = sessionStore.sessionInputConfig || {}
  // 计算结果
  return inputConfig[currentSessionUuid]?.inputHeight || 40
})

const messageObserver = ref(null)

// 2. 初始化「消息可视区监听器」
const initMessageReadObserver = () => {
  // 初始化配置仓库
  const configStore = useAiSoftwareConfigStore()
  // 1. 先销毁旧的监听器（防止重复创建）
  if (messageObserver.value) {
    messageObserver.value.disconnect()
  }

  // 动态拼接 rootMargin（关键！用你的 dynamicBottom）
  const dynamicRootMargin = `0px 0px -${dynamicBottom.value}px 0px`

  // 2. 创建新的监听器
  messageObserver.value = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // 只处理【进入可视区域】的消息
      if (entry.isIntersecting) {
        const msgDom = entry.target
        // 从 DOM 上获取核心标识
        const messageId = msgDom.dataset.messageId
        const splitIndex = msgDom.dataset.splitIndex

        // 没有消息ID直接跳过
        if (!messageId) return

        // ==============================================
        // 🔥 核心：根据切分模式，分流调用不同方法
        // ==============================================
        const currentSessionUuid = sessionStore.currentSessionUuid
        if (configStore.isSplitMessageEnabled) {
          // ✅ 切分模式开启：需要 messageId + splitIndex，标记单个分片
          const index = Number(splitIndex)
          // 校验分片序号合法
          if (!isNaN(index) && index >= 0) {
            sessionStore.markSingleSplitMessageAsRead(
                currentSessionUuid,
                messageId,
                index
            )
          }
        } else {
          // ✅ 切分模式关闭：原有逻辑，标记整条消息
          sessionStore.markMessageAsRead(
              currentSessionUuid,
              messageId
          )
        }

        // 标记完成后，取消监听（只执行一次）
        messageObserver.value.unobserve(msgDom)
      }
    })
  }, {
    root: chatContentRef.value,
    threshold: 0.3, // 50%显示就算阅读（你原配置）
    rootMargin: dynamicRootMargin
  })

  // 给页面所有消息绑定监听
  document.querySelectorAll('.message-item').forEach(item => {
    messageObserver.value.observe(item)
  })
}

// ==============================================
// 🔥 核心：监听菜单显隐 → 控制聊天页面滚动禁止/恢复
// ==============================================
// 计算属性：监听长按菜单是否显示
const isMessageMenuShow = computed(() => {
  return modalStore.pageModals.ChatListPage.messageOptionMenu.visible
})

// 监听菜单状态，控制滚动容器
watch(isMessageMenuShow, (visible) => {
  // 容器不存在直接返回
  if (!chatContentRef.value) return

  if (visible) {
    // ✅ 菜单弹出：禁止聊天区域滚动
    chatContentRef.value.style.overflow = 'hidden'
    // 移动端禁止触摸滑动（关键修复）
    chatContentRef.value.style.touchAction = 'none'
  } else {
    // ✅ 菜单关闭：恢复聊天区域滚动
    chatContentRef.value.style.overflow = 'auto'
    chatContentRef.value.style.touchAction = 'auto'
  }
})

// 合并后的：页面挂载（打开页面执行一次）
// 1. 滚动到底部
// 2. 清空当前会话所有未读消息（normal + split）
// 3. 初始化消息已读监听
onMounted(async () => {
  // 1. 页面初始化滚到底部
  scrollToBottom()

  // 2. 🔥 清空【当前选中会话】的所有未读（非切分+切分全部清零）
  sessionStore.clearSessionUnread(sessionStore.currentSessionUuid)

  // 3. 等待DOM渲染完成，启动消息监听
  await nextTick()
  initMessageReadObserver()
})

// 页面更新（新消息渲染）→ 重新绑定监听
onUpdated(async () => {
  await nextTick()
  initMessageReadObserver()
})

// 🔥 合并后的：页面销毁（退出页面执行一次）
// 1. 销毁消息监听器
// 2. 清理动态样式
onUnmounted(() => {
  // 1. 销毁消息监听器（防内存泄漏）
  if (messageObserver.value) {
    messageObserver.value.disconnect()
    messageObserver.value = null
  }

  // 2. 清理你的动态样式
  if (dynamicStyle) {
    dynamicStyle.remove()
  }
})

// 监听切分模式开关变化
watch(
    () => configStore.isSplitMessageEnabled,
    (newVal) => {
      updateGlobalMarginStyle(newVal)
    },
    {immediate: true} // 页面加载立即执行一次
)


// ========== 1. 定义Props ==========
const props = defineProps({
  sessionUuid: {
    type: String,
    required: true,
    default: ''
  }
})

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

// ========== 5. 同步props会话UUID到Pinia仓库 ==========
watch(
    () => props.sessionUuid,
    (newUuid) => {
      if (newUuid) {
        sessionStore.setCurrentSessionUuid(newUuid)
      }
    },
    {immediate: true}
)

// ========== 6. 滚动到底部工具函数 ==========
const scrollToBottom = () => {
  nextTick(() => {
    const contentEl = chatContentRef.value
    if (!contentEl) return
    contentEl.scrollTop = contentEl.scrollHeight
  })
}

// ========== 7. 监听用户消息变化 → 自动滚动 ==========
watch(
    () => sessionStore.waitingUserMessage,
    () => {
      // 用户消息新增 → 立即滚到底部
      scrollToBottom()
    },
    {
      deep: true, // 监听嵌套对象变化（必须加！）
      flush: 'post' // 等待DOM更新后再滚动，避免错位
    }
)

// ========== 9. 对外暴露方法 ==========
defineExpose({
  scrollToBottom
})
</script>

<style scoped>
/* 核心容器：滚动区域基础样式 */
.chat-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f7f8fa;
  scroll-behavior: smooth;
  /* 🔥 核心：永久预留 4px 滚动条空间，隐藏滚动条时绝不重排！ */
  scrollbar-gutter: stable;
}

/* 空状态样式 */
.empty-chat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
  color: #969799; /* 更高级的浅灰色 */
}

.empty-text {
  font-size: 14px;
  margin: 0;
  font-weight: 400;
}

/* 消息列表：控制组间距 */
.message-list {
  display: flex;
  flex-direction: column;
  gap: 20px; /* 不同消息组（用户/AI）之间的间距 */

}

/* 淡入动画：更自然的过渡 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式适配：移动端优化 */
@media (max-width: 480px) {
  .chat-content {
    padding: 16px 12px;
  }

  .message-item {
    max-width: 92%;
    gap: 10px;
  }

  .message-avatar {
    width: 36px;
    height: 36px;
  }

  .message-bubble {
    padding: 10px 14px;
    font-size: 14px;
  }
}

/* 滚动条美化：更极简的样式 */
.chat-content::-webkit-scrollbar {
  width: 4px;
}

.chat-content::-webkit-scrollbar-track {
  background: transparent;
}

.chat-content::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 2px;
}

.chat-content::-webkit-scrollbar-thumb:hover {
  background: #c0c4cc;
}
</style>