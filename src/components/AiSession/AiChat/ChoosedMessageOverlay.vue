<template>
  <div
      v-if="modalStore.pageModals.ChatListPage.overlay.visible"
      class="chat-overlay"
      @click="handleCloseOverlay"
      ref="scrollRef"
  >
    <div
        class="overlay-box"
        :style="{ minHeight: boxTotalHeight + 'px'}"
    >
      <!-- 绑定 ref，获取子组件实例 -->
      <SplitMessageBubble
          v-if="configStore.isSplitMessageEnabled"
          :item="modalStore.pageModals.ChatListPage.overlay.item"
          ref="messageRef"
      />
      <MessageBubble
          v-else
          :item="modalStore.pageModals.ChatListPage.overlay.item"
          ref="messageRef"
      />
      <MessageOptionMenu ref="menuRef" />
    </div>

  </div>


</template>

<script setup>
import { useModalStore } from '@/stores/modalStore'
import { useAiSoftwareConfigStore } from '@/stores/aiSoftwareConfig'
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useMessageStore } from '@/stores/messageStore'
import MessageBubble from './MessageBubble.vue'
import SplitMessageBubble from './SplitMessageBubble.vue'
import MessageOptionMenu from "../MessageOptionMenu.vue";

const modalStore = useModalStore()
const configStore = useAiSoftwareConfigStore()
const messageStore = useMessageStore()
// 接收子组件实例
const messageRef = ref(null)
const menuRef = ref(null)
// 🔥 盒子总高度（消息高度 + 菜单高度）
const boxTotalHeight = ref(0)
const scrollRef = ref(null)

// 监听遮罩层显示
watch(
    () => modalStore.pageModals.ChatListPage.overlay.visible,
    async (newVal) => {
      if (!newVal) return

      // 1. 等待 DOM 初步渲染
      await nextTick()

      const item = modalStore.pageModals.ChatListPage.overlay.item
      const bubbleDom = messageRef.value?.bubbleRef

      if (!bubbleDom || !item) return

      // 2. 此时 Flex 居中可能还在计算
      // 我们再次使用 nextTick 或一个小延迟，确保 bubbleDom 的 getBoundingClientRect() 是准确的
      await nextTick()

      // 3. 执行菜单显示逻辑
      modalStore.showMessageOptionMenu(bubbleDom, item)

      // 4. 监听菜单高度动态调整滚动条（针对长内容）
      const heightWatcher = watch(
          () => menuRef.value?.menuHeight,
          async (menuHeight) => {
            if (!menuHeight || menuHeight <= 0) return

            // 如果内容超过视口，Flex 居中会失效（变成顶部对齐），此时需要处理滚动
            const viewportHeight = window.innerHeight
            const currentBoxHeight = messageRef.value?.rootRef.offsetHeight + menuHeight

            if (currentBoxHeight > viewportHeight) {
              // 如果内容太长，居中会变成 top 模式，此时强制滚动到底部
              await nextTick()
              scrollRef.value.scrollTop = scrollRef.value.scrollHeight
            }

            heightWatcher()
          },
          { immediate: true }
      )
    }
)

// 关闭逻辑不变
const handleCloseOverlay = () => {
  modalStore.hideOverlay()
  messageStore.setActiveMessageId(null)
}

onMounted(() => document.body.style.overflow = 'hidden')
onUnmounted(() => document.body.style.overflow = '')
</script>

<style scoped>
/* 适中加强版 全屏磨砂遮罩层 */
.chat-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;

  display: flex;
  flex-direction: column;
  justify-content: center; /* 核心：垂直居中，内容会从中间向上下扩展 */

  background: rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(14px) brightness(1.05);
  -webkit-backdrop-filter: blur(14px) brightness(1.05);
  overflow-y: auto;
  padding: 60px 20px;
  box-sizing: border-box;
}

/* 消息内容容器：层级10000（最高） */
.overlay-box {
  position: relative;
  z-index: 10000; /* 核心：消息层级最高 */
  /* 你可以保留原有样式 */
}
</style>