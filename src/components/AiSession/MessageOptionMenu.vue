<template>
  <!-- 智能定位菜单容器：缩放动画 + 自动计算位置 -->
  <transition name="menu-scale">
    <div
        v-if="modalStore.pageModals.ChatListPage.messageOptionMenu.visible"
        ref="menuRef"
        class="context-menu"
        :style="{
        left: finalLeft + 'px',
        top: finalTop + 'px'
      }"
    >
      <!-- 你的循环菜单（完全保留不动） -->
      <div class="menu-item" v-for="item in menuItems" :key="item.text" @click="handleMenuClick(item.type)">
        <span class="menu-text">{{ item.text }}</span>
        <span class="menu-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path :d="item.iconPath" />
          </svg>
        </span>
      </div>

      <!-- 删除项（区别化） -->
      <div class="menu-item delete-item" @click="handleMenuClick('delete')">
        <span class="menu-text">删除</span>
        <span class="menu-icon delete-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
          </svg>
        </span>
      </div>

      <div class="menu-divider"></div>

      <!-- Select项 -->
      <div class="menu-item" @click="handleMenuClick('select')">
        <span class="menu-text">选择</span>
        <span class="menu-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </span>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { useModalStore } from '@/stores/modalStore.js'
import { ref, watch, nextTick, computed, onMounted, onUnmounted } from 'vue'
import {useAiSoftwareConfigStore} from '@/stores/aiSoftwareConfig'
import { ElMessage } from 'element-plus'

const configStore = useAiSoftwareConfigStore()
const modalStore = useModalStore()
const menu = modalStore.pageModals.ChatListPage.messageOptionMenu

const menuRef = ref(null)
const menuHeight = ref(0)
const menuWidth = ref(0)
const viewportHeight = ref(window.innerHeight)
const viewportWidth = ref(window.innerWidth)
const gap = 10

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

watch(
    () => menu.visible,
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
    { immediate: true }
)

defineExpose({
  menuHeight  // 暴露响应式高度变量
})

// 锚点坐标
const anchorRect = computed(() => {
  const targetElement = menu.element
  if (!targetElement) return null
  return targetElement.getBoundingClientRect()
})
const anchorTopLeft = computed(() => {
  const rect = anchorRect.value
  if (!rect) return { left: 0, top: 0 }
  return { left: rect.left, top: rect.top }
})
const anchorBottomLeft = computed(() => {
  const rect = anchorRect.value
  if (!rect) return { left: 0, top: 0 }
  return { left: rect.left, top: rect.top + rect.height }
})

// 🔥 核心修改：强制永远向下展开
const isDownward = computed(() => {
  return true
})

// 🔥 核心修改：最终 Left 定位（区分左右消息）
const finalLeft = computed(() => {
  if (!anchorRect.value) return 0
  const currentRole = menu.role
  const mWidth = menuWidth.value || 150

  // ✅ 助手消息（左侧）+ AI切分消息：菜单贴在 消息右侧
  if (currentRole === 'ASSISTANT') {
    const anchorLeft = isDownward.value ? anchorBottomLeft.value.left : anchorTopLeft.value.left
    let left = anchorLeft + gap
    left = Math.max(gap, left)
    return left
  }
  // ✅ 用户消息（右侧）：菜单贴在 消息左侧（反向定位）
  else if (currentRole === 'USER') {
    const anchorRight = menu.position.right
    let left = anchorRight - mWidth - gap
    left = Math.min(viewportWidth.value - mWidth - gap, left)
    return left
  }
})

// 最终 Top 定位（强制向下 + 无边界限制，允许超出屏幕）
const finalTop = computed(() => {
  if (!anchorBottomLeft.value) return 0
  // 只保留向下逻辑
  let top = anchorBottomLeft.value.top + gap
  // 无任何屏幕限制，直接返回
  return top
})

// 以下代码完全不动
const menuItems = [
  { text: '复制', type: 'copy', iconPath: 'M10 9l-7 7 7 7M3 16h12a4 4 0 004-4V8a4 4 0 00-4-4H7a4 4 0 00-4-4v8z' },
  { text: '回复', type: 'reply', iconPath: 'M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-1M8 5V4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2h-1M8 5h12M8 5l-4 4' },
  { text: '朗读', type: 'read', iconPath: 'M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h4' },
  { text: '编辑', type: 'edit', iconPath: 'M13 5l7 7-7 7M5 12h16' },
  { text: '翻译', type: 'translate', iconPath: 'M13 5l7 7-7 7M5 12h16' }
]

// 菜单点击处理
const handleMenuClick = async (type) => {
  const currentItem = menu.currentItem // 拿到当前长按的消息项
  console.log('菜单操作：', type, currentItem)

  // ======================================
  // 🔥 核心：复制功能（兼容切分/非切分模式）
  // ======================================
  if (type === 'copy') {
    let copyContent = ''

    // 判断是否开启【切分模式】
    if (configStore.isSplitMessageEnabled) {
      // ✅ 切分模式：AI分片消息 → 取 split.content
      if (currentItem.role === 'ASSISTANT' && currentItem.split?.content) {
        copyContent = currentItem.split.content
      }
      // 用户消息（切分模式下依然取source）
      else if (currentItem.role === 'USER' && currentItem.source?.content) {
        copyContent = currentItem.source.content
      }
    } else {
      // ✅ 非切分模式：直接取原始消息内容
      copyContent = currentItem.source?.content || currentItem.content || ''
    }

    // 执行复制到剪切板
    // 2. 执行剪切板复制 + EP提示
    try {
      await navigator.clipboard.writeText(copyContent)
      // ✅ Element Plus 复制成功提示
      ElMessage.success({
        message: '复制成功',
        duration: 1500, // 显示1.5秒后自动消失
      })
      console.log('✅ 复制内容：', copyContent)
    } catch (err) {
      // ❌ Element Plus 复制失败提示
      ElMessage.error({
        message: '复制失败，请重试',
        duration: 2000
      })
      console.error('❌ 复制失败原因：', err)
    }
  }

  // ======================================
  // 其他菜单类型（保留原有逻辑，后续可扩展）
  // ======================================
  switch (type) {
    case 'delete':
      console.log('🗑️ 删除消息：', currentItem)
      // 后续写删除逻辑
      break
    case 'select':
      // 👇👇👇 这里就是你要的：打印元素高度
      const messageDom = modalStore.pageModals.ChatListPage.messageOptionMenu.element
      if (messageDom) {
        console.log('📏 当前选中消息元素的高度：', messageDom.offsetHeight + 'px')
        console.log('🎯 选中的消息项：', currentItem)
      } else {
        console.log('⚠️ 未获取到消息DOM元素')
      }
      console.log('🍽️ 菜单选项组件自身高度：', menuHeight.value + 'px')
      ElMessage.success('已选中消息')
      break
    case 'reply':
      console.log('↩️ 回复消息：', currentItem)
      break
    case 'read':
      console.log('🔊 朗读消息：', currentItem)
      break
    case 'edit':
      console.log('✏️ 编辑消息：', currentItem)
      break
    case 'translate':
      console.log('🌐 翻译消息：', currentItem)
      break
  }

  // 关闭消息选项遮罩
  modalStore.hideOverlay()
}

// 🔥 新增：选中长条控制
const showSelectBar = ref(false)
const barHeight = ref(0)    // 长条高度
const barTop = ref(0)       // 长条top定位
const barLeft = ref(0)      // 长条left定位

// 监听菜单隐藏，重置长条状态
watch(() => menu.visible, (isVisible) => {
  if (!isVisible) {
    showSelectBar.value = false
    barHeight.value = 0
  }
})
</script>

<style scoped>
/* 你的原有菜单样式（完全保留） */
.context-menu {
  position: fixed; /* 核心：固定定位 */
  z-index: 10000;
  width: 170px;
  background: #2c2c2e;
  border-radius: 12px;
  padding: 6px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 7px 12px;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.menu-item:hover {
  background-color: #3a3a3c;
}

.menu-text {
  font-size: 14px;
  color: #ffffff;
  font-weight: 400;
}

.menu-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: #ffffff;
}

.delete-item {
  color: #ff3b30;
}

.delete-icon {
  color: #ff3b30;
}

.menu-divider {
  height: 1px;
  background-color: #3a3a3c;
  margin: 3px 12px;
}

.menu-icon svg {
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* 过渡动画（和上方菜单一致） */
.mask-fade-enter-active,
.mask-fade-leave-active {
  transition: opacity 0.2s ease;
}
.mask-fade-enter-from,
.mask-fade-leave-to {
  opacity: 0;
}

.menu-scale-enter-active,
.menu-scale-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.menu-scale-enter-from {
  transform: scale(0.95);
  opacity: 0;
}
.menu-scale-leave-to {
  transform: scale(0.95);
  opacity: 0;
}
</style>