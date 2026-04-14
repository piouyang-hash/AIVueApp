<template>
  <div
      v-if="modalStore.pageModals.ChatListPage.overlay.visible"
      class="chat-overlay"
      @click="handleCloseOverlay"
      ref="scrollRef"
  >
    <div
        class="overlay-box"
        :style="{ minHeight: boxTotalHeight + 'px' }"
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
      await nextTick()

      const item = modalStore.pageModals.ChatListPage.overlay.item
      const bubbleDom = messageRef.value?.bubbleRef
      const rootDom = messageRef.value?.rootRef

      if (!bubbleDom || !item || !rootDom) return

      const rootHeight = rootDom.offsetHeight
      modalStore.showMessageOptionMenu(bubbleDom, item)

      // 监听菜单高度，计算总高度
      const heightWatcher = watch(
          () => menuRef.value?.menuHeight,
          async (menuHeight) => {
            if (menuHeight <= 0) return

            // 计算总高度
            boxTotalHeight.value = rootHeight + menuHeight
            const viewportHeight = window.innerHeight

            // 打印总高度
            console.log('📦 盒子总高度：', boxTotalHeight.value + 'px')

            // 🔥 核心：总高度超过视口 → 自动滚动到底部
            if (boxTotalHeight.value > viewportHeight) {
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