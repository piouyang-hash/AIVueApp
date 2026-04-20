<template>
  <!-- 遮罩层：添加渐变动画 -->
  <transition name="mask-fade">
    <div
        v-if="modalStore.componentModals.contextMenu.visible"
        class="menu-mask"
        @click="modalStore.hideContextMenu()"
    ></div>
  </transition>

  <!-- 菜单容器：添加缩放动画（模板完全保留） -->
  <transition name="menu-scale">
    <div
        v-if="modalStore.componentModals.contextMenu.visible"
        ref="menuRef"
        class="menu-container"
        :style="{
        left: debugLeft + 'px',
        top: debugTop + 'px'
      }"
    >
      <!-- 动态置顶/取消置顶 菜单项 -->
      <div class="menu-item"
           @click="handleMenuClick(modalStore.componentModals.contextMenu.currentItem.isTop === 1 ? '取消置顶' : '置顶')">
  <span class="menu-text">
    {{ modalStore.componentModals.contextMenu.currentItem.isTop === 1 ? '取消置顶' : '置顶' }}
  </span>
        <span class="menu-icon">
    <!-- 置顶：📌  取消置顶：🔓（可自行替换图标） -->
    {{ modalStore.componentModals.contextMenu.currentItem.isTop === 1 ? '🔓' : '📌' }}
  </span>
      </div>
      <div class="menu-item" @click="handleMenuClick('编辑对话名称')">
        <span class="menu-text">编辑对话名称</span>
        <span class="menu-icon">✏️</span>
      </div>
      <div class="menu-item" @click="handleMenuClick('分享对话')">
        <span class="menu-text">分享对话</span>
        <span class="menu-icon">↪️</span>
      </div>
      <div class="menu-item menu-item-danger" @click="handleMenuClick('从对话列表删除')">
        <span class="menu-text">从对话列表删除</span>
        <span class="menu-icon">🗑️</span>
      </div>
    </div>
  </transition>
</template>

<script setup>
import {useModalStore} from '@/stores/modalStore.js'
import {ref, watch, nextTick, computed, onMounted, onUnmounted} from 'vue'
import {deleteChatSession, topChatSession, untopChatSession} from "@/services/ai_chat.session.service.js";
import {useChatDomainStore} from "@/stores/AiChat/session-related/combineMethod/ChatDomainStore.js";

const modalStore = useModalStore()

// 基础变量（完全保留）
const menuRef = ref(null)
const menuHeight = ref(0)   // 实际高度（用于计算）
const menuWidth = ref(0)    // 实际宽度（用于边界判断）
const viewportHeight = ref(window.innerHeight)
const viewportWidth = ref(window.innerWidth)
const gap = 10
const chatDomainStore = useChatDomainStore()

// 监听窗口大小（完全保留）
const handleResize = () => {
  viewportHeight.value = window.innerHeight
  viewportWidth.value = window.innerWidth
}
onMounted(() => {
  window.addEventListener('resize', handleResize)
  handleResize()
})
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 监听菜单显隐，获取实际尺寸（完全保留）
watch(
    () => modalStore.componentModals.contextMenu.visible,
    (isVisible) => {
      if (isVisible) {
        nextTick(() => {
          if (menuRef.value) {
            menuHeight.value = menuRef.value.offsetHeight
            menuWidth.value = menuRef.value.offsetWidth
          }
        })
      }
    },
    {immediate: true}
)

// ========== 核心修改：从modalStore的DOM元素计算锚点坐标（替代原直接取position） ==========
// 计算锚点元素的DOMRect（防御性处理，元素不存在时返回空）
const anchorRect = computed(() => {
  const targetElement = modalStore.componentModals.contextMenu.element
  if (!targetElement) return null
  return targetElement.getBoundingClientRect()
})

// 计算左上锚点（和原逻辑一致）
const anchorTopLeft = computed(() => {
  const rect = anchorRect.value
  if (!rect) return {left: 0, top: 0}
  return {
    left: rect.left,
    top: rect.top
  }
})

// 计算左下锚点（和原逻辑一致）
const anchorBottomLeft = computed(() => {
  const rect = anchorRect.value
  if (!rect) return {left: 0, top: 0}
  return {
    left: rect.left, // 左下left和左上一致
    top: rect.top + rect.height // 左下top = 左上top + 元素高度
  }
})

// ========== 以下所有计算逻辑完全保留，仅锚点来源变了 ==========
// 方向判断：默认向上显示（仅当向上空间不足时才向下）
const isDownward = computed(() => {
  const actualHeight = menuHeight.value || 180 // 未获取时用预估
  const topY = anchorTopLeft.value?.top ?? 0
  // 仅当向上空间不足（topY - actualHeight - gap < 0）时，才向下显示
  return topY - actualHeight - gap < 0
})

// 计算最终 left（保留左右溢出处理）
const debugLeft = computed(() => {
  if (!anchorTopLeft.value || !anchorBottomLeft.value) return 0
  const anchorLeft = isDownward.value ? anchorBottomLeft.value.left : anchorTopLeft.value.left
  let left = anchorLeft + gap
  if (left + menuWidth.value > viewportWidth.value) {
    left = anchorLeft - menuWidth.value - gap
  }
  left = Math.max(gap, left)
  return left
})

// 计算最终 top（保留原对齐逻辑 + 边界限制）
const debugTop = computed(() => {
  if (!anchorTopLeft.value || !anchorBottomLeft.value) return 0
  let top = 0
  if (isDownward.value) {
    // 向下：菜单左上角对准锚点左下角 + gap
    top = anchorBottomLeft.value.top + gap
  } else {
    // 向上：菜单左下角对准锚点左上角 - gap（默认优先向上）
    const h = menuHeight.value || 180
    top = anchorTopLeft.value.top - h - gap
  }
  // 边界限制，避免跑出屏幕
  const minTop = gap
  const maxTop = viewportHeight.value - (menuHeight.value || 180) - gap
  if (menuHeight.value > 0) {
    top = Math.min(Math.max(top, minTop), maxTop)
  } else {
    top = Math.min(Math.max(top, minTop), viewportHeight.value - gap)
  }
  return top
})

// 菜单点击（置顶/取消置顶 核心逻辑）
const handleMenuClick = async (label) => {
  const currentItem = modalStore.componentModals.contextMenu.currentItem;
  // 空值防护
  if (!currentItem) {
    // ✅ 调用封装方法，不手动赋值
    modalStore.hideContextMenu();
    return;
  }

  // 取出会话UUID（你已修改接口用UUID）
  const {sessionUuid} = currentItem;

  try {
    // ====================== 【置顶】逻辑 ======================
    if (label === '置顶') {
      console.log(label);
      // 1. 调用后端置顶接口（传入UUID）
      await topChatSession(sessionUuid);
      // 2. 前端本地乐观更新：修改状态
      currentItem.isTop = 1;
      currentItem.topAt = Date.now().toString();
    }

    // ====================== 【取消置顶】逻辑 ======================
    else if (label === '取消置顶') {
      // 1. 调用后端取消置顶接口
      await untopChatSession(sessionUuid);
      // 2. 前端本地乐观更新
      currentItem.isTop = 0;
      currentItem.topAt = null;
    }

    // ====================== 【从对话列表删除】逻辑 ======================
    else if (label === '从对话列表删除') {
      // 打开删除确认弹窗（带恢复提示）
      modalStore.showConfirmModal(
          "确认删除？",  // 标题
          "删除后，可以在回收站恢复",  // 🔥 新增提示文字
          async () => { // 确认删除（异步执行接口）
            console.log("执行删除会话操作");
            // 1. 调用后端删除接口（传入UUID）
            await deleteChatSession(sessionUuid);
            // 2. 前端乐观更新：标记删除/隐藏会话
            currentItem.isDeleted = 1;
            console.log("会话删除成功");
            chatDomainStore.deleteSessionByUuid(sessionUuid);
          },
          () => { // 取消删除
            console.log("用户取消删除会话");
          }
      );
    }

  } catch (error) {
    // 接口失败提示（可选）
    console.error('操作失败：', error);
    // ElMessage.error('操作失败，请重试')
  } finally {
    // ✅ 🔥🔥🔥 听你的！调用封装好的隐藏方法，全自动清理所有状态，无任何BUG
    modalStore.hideContextMenu();
  }
};
</script>

<style scoped>
/* 遮罩层基础样式 */
.menu-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.3);
  z-index: 9998;
}

/* 遮罩层渐变动画（时长0.15s，和菜单同步） */
.mask-fade-enter-from,
.mask-fade-leave-to {
  opacity: 0;
}

.mask-fade-enter-active,
.mask-fade-leave-active {
  transition: opacity 0.30s ease; /* 快速动画，0.30秒完成 */
}

/* 菜单容器基础样式（已缩小） */
.menu-container {
  position: fixed;
  min-width: 220px;
  background: #1c1c1e;
  border-radius: 8px;
  padding: 4px 0;
  z-index: 9999;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
  transform-origin: left bottom; /* 动画原点：菜单左下角（和对齐点一致） */
}

/* 菜单缩放动画（核心） */
/* 进入前：缩小到0.8倍 + 透明 */
.menu-scale-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

/* 进入后：恢复1倍 + 不透明 */
.menu-scale-enter-to {
  opacity: 1;
  transform: scale(1);
}

/* 离开后：缩小到0.8倍 + 透明 */
.menu-scale-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* 动画过程：0.30秒完成，加速后减速更自然 */
.menu-scale-enter-active,
.menu-scale-leave-active {
  transition: all 0.30s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 菜单项：统一高度 + 缩小尺寸（原有样式完全保留） */
.menu-item {
  display: flex;
  justify-content: space-between; /* 核心：文字左、图标右自动分开 */
  align-items: center; /* 垂直居中 */
  height: 36px;
  line-height: 36px;
  padding: 0 16px;
  color: #fff;
  font-size: 14px;
  border-bottom: 1px solid #333;
  cursor: pointer;
  box-sizing: border-box;
}

.menu-item:last-child {
  border-bottom: none;
}

/* 文字样式（新增，用于危险项颜色控制） */
.menu-text {
  flex: 1; /* 占满剩余空间，让图标固定在右侧 */
  text-align: left;
}

/* 危险项文字颜色（原有逻辑保留） */
.menu-item-danger .menu-text {
  color: #ff3b30;
}

/* 图标样式（原有大小控制保留） */
.menu-icon {
  font-size: 16px;
  text-align: right;
}

</style>