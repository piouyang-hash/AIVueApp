<template>
  <div class="role-list-container">
    <h3>微信同款侧滑（纯净版）</h3>

    <div
        class="role-item"
        v-for="item in roleList"
        :key="item.roleId"
        @touchstart="handleTouchStart($event, item)"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
    >
      <div class="slide-action" :style="{ pointerEvents: activeRoleId === item.roleId ? 'auto' : 'none' }">
        <div class="btn-back" @click.stop="closeSlide">← 返回</div>
        <div class="btn-create" @click.stop="handleCreateNewChat(item)">创建对话</div>
      </div>

      <div
          class="slide-content"
          :class="{ 'is-animating': !isDragging }"
          :style="{ transform: `translateX(${activeRoleId === item.roleId ? dragX : 0}px)` }"
          @click="handleClickRole(item)"
      >
        <div class="avatar">
          <img src="https://picsum.photos/100/100" class="avatar-img" />
        </div>
        <div class="role-info">
          <h3 class="role-title">{{ item.roleDesc }}</h3>
          <p class="role-desc">{{ item.personaTone }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const roleList = ref([
  { roleId: 1, roleDesc: "智能助手", personaTone: "温和专业" },
  { roleId: 2, roleDesc: "编程导师", personaTone: "严谨简洁" },
])

const dragX = ref(0)
const activeRoleId = ref(null)
const isDragging = ref(false)
const maxDrag = -220 // 最大左滑距离

let startX = 0
let lastDragX = 0

// 触摸开始
const handleTouchStart = (e, item) => {
  // 如果点击的是另一个，先关闭当前的
  if (activeRoleId.value && activeRoleId.value !== item.roleId) {
    closeSlide()
    return
  }

  activeRoleId.value = item.roleId
  startX = e.touches[0].clientX
  lastDragX = dragX.value // 记录初始位置（可能是0，也可能是-220）
  isDragging.value = true
}

// 触摸移动
const handleTouchMove = (e) => {
  if (!isDragging.value) return

  const currentX = e.touches[0].clientX
  const deltaX = currentX - startX
  let finalX = lastDragX + deltaX

  // 边界控制：不允许向右过头，也不允许左滑超过阈值太多（增加阻尼感）
  if (finalX > 0) finalX = 0
  if (finalX < maxDrag - 20) finalX = maxDrag - 20

  dragX.value = finalX
}

// 触摸结束
const handleTouchEnd = () => {
  isDragging.value = false
  // 逻辑判断：滑动超过 80px 就吸附打开，否则回弹
  if (dragX.value < -80) {
    dragX.value = maxDrag
  } else {
    closeSlide()
  }
}

const closeSlide = () => {
  dragX.value = 0
  activeRoleId.value = null
}

const handleClickRole = (item) => {
  // 如果当前是打开状态，点击内容区改为收起
  if (dragX.value !== 0) {
    closeSlide()
    return
  }
  alert("进入详情：" + item.roleDesc)
}

const handleCreateNewChat = (item) => {
  alert("动作触发：" + item.roleDesc)
  closeSlide()
}
</script>

<style scoped>
.role-list-container {
  max-width: 400px;
  margin: 20px auto;
  padding: 0 16px;
}

.role-item {
  position: relative;
  overflow: hidden;
  background: #fff;
  border-radius: 12px;
  margin: 8px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.slide-action {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  z-index: 1;
}

.btn-back, .btn-create {
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  white-space: nowrap;
}

.btn-back {
  background: #f5f5f5;
  color: #333;
}

.btn-create {
  background: #409eff;
  color: white;
}

.slide-content {
  position: relative;
  z-index: 2;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 12px;
  transition: transform 0.22s ease;
  min-height: 70px;
}

.avatar-img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.role-info {
  flex: 1;
}

.role-title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.role-desc {
  margin: 4px 0 0;
  font-size: 12px;
  color: #999;
}

.role-time {
  font-size: 12px;
  color: #ccc;
}
</style>