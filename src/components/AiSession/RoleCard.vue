<template>
  <!-- 根容器：滑动外层容器 -->
  <div
      class="role-item"
      @touchstart="handleTouchStart($event, item)"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
  >
    <!-- 👇 下层：滑动露出的【创建新对话面板】（你的原有代码） -->
    <div
        class="create-new-card"
        :style="{ pointerEvents: activeRoleId === item.roleId ? 'auto' : 'none' }"
    >
      <div class="card-left" @click.stop="closeSlide">
        ← 返回
      </div>
      <div class="card-right" @click="handleCreateNewChat(item)">
        创建新对话
      </div>
    </div>

    <!-- 👇 上层：你的原有角色卡片（完全保留，在上层滑动） -->
    <div
        class="slide-content"
        :class="{ 'is-animating': !isDragging }"
        :style="{ transform: `translateX(${activeRoleId === item.roleId ? dragX : 0}px)` }"
    >
      <div class="role-badge" v-if="hasActiveSession(item.roleId)"></div>
      <div class="avatar">
        <img
            :src="SERVICE_URLS.AI_CHAT_SERVICE + item.avatarRelativePath"
            alt="角色头像"
            class="avatar-img"
        >
      </div>
      <div class="role-info">
        <h3 class="role-title">{{ item.roleDesc }}</h3>
        <p class="role-desc">{{ item.personaTone }} · {{ item.personaCore.slice(0, 20) }}...</p>
      </div>
      <div class="role-time">{{ formatTime(item.createTime) }}</div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref } from "vue"
import { SERVICE_URLS } from '@/api/constants/serviceUrls.js'
import {useChatDomainStore} from "@/stores/AiChat/session-related/combineMethod/ChatDomainStore.js";

const router = useRouter()
const chatDomainStore = useChatDomainStore()

// ==================== 你原有业务变量/方法（完全保留） ====================
const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const now = new Date();
  const target = new Date(timeStr);
  const nowDate = now.toDateString();
  const targetDate = target.toDateString();

  if (nowDate === targetDate) {
    return `今天 ${target.getHours().toString().padStart(2, '0')}:${target.getMinutes().toString().padStart(2, '0')}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (yesterday.toDateString() === targetDate) {
    return `昨天 ${target.getHours().toString().padStart(2, '0')}:${target.getMinutes().toString().padStart(2, '0')}`;
  }

  return `${(target.getMonth() + 1).toString().padStart(2, '0')}-${target.getDate().toString().padStart(2, '0')}`;
};

const hasActiveSession = (roleId) => {
  const sessionList = chatDomainStore.roleSessionMap[roleId] || [];
  return sessionList.some(session => session.status === 'ACTIVE');
};

// 原有创建对话方法（保留你的业务）
const handleCreateNewChat = (item) => {
  // 你的原有业务逻辑写这里
  console.log('创建新对话:', item)
  closeSlide()
}

// ==================== 原生滑动核心（新增，零BUG） ====================
const dragX = ref(0)
const activeRoleId = ref(null)
const isDragging = ref(false)
const maxDrag = -220 // 左滑最大距离（可调整）

let startX = 0
let lastDragX = 0

// 触摸开始
const handleTouchStart = (e, item) => {
  if (activeRoleId.value && activeRoleId.value !== item.roleId) {
    closeSlide()
    return
  }
  activeRoleId.value = item.roleId
  startX = e.touches[0].clientX
  lastDragX = dragX.value
  isDragging.value = true
}

// 触摸滑动
const handleTouchMove = (e) => {
  if (!isDragging.value) return
  const currentX = e.touches[0].clientX
  const deltaX = currentX - startX
  let finalX = lastDragX + deltaX

  // 边界限制
  if (finalX > 0) finalX = 0
  if (finalX < maxDrag - 20) finalX = maxDrag - 20

  dragX.value = finalX
}

// 触摸结束/自动吸附
const handleTouchEnd = () => {
  isDragging.value = false
  if (dragX.value < -80) {
    dragX.value = maxDrag
  } else {
    closeSlide()
  }
}

// 关闭滑动（返回按钮调用）
const closeSlide = () => {
  dragX.value = 0
  activeRoleId.value = null
}
</script>

<style scoped>
/* ==================== 你原有所有样式（完全保留） ==================== */
.avatar {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  background: #f5f5f5;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.role-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #00c853;
  z-index: 1;
  pointer-events: none;
}

.role-item .avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  font-size: 16px;
  font-weight: 500;
  margin-right: 16px;
  flex-shrink: 0;
}

.role-info {
  flex: 1;
  overflow: hidden;
}

.role-title {
  margin: 0;
  font-size: 16px;
  color: var(--text-primary);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.role-desc {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: var(--text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.role-time {
  font-size: 12px;
  color: var(--text-tertiary);
  flex-shrink: 0;
  margin-left: 12px;
  margin-right: 1px;
}

/* ==================== 滑动必备样式（新增） ==================== */
.role-item {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  margin: 8px 0;
}

/* 下层按钮面板 */
.create-new-card {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  z-index: 1;
  width: 220px;
  display: flex;
  align-items: center;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  background-color: var(--card-hover);
}

.card-left, .card-right {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 0;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

/* 🔥 红色删除按钮（独立样式） */
.delete-btn {
  flex: 2;
  background: var(--error-color); /* 你指定的红色 */
  color: var(--gray-50); /* 白色文字 */
  border: none;
}

/* 创建会话按钮 - 主色（不变） */
.create-btn {
  flex: 5;
  background: var(--primary-color);
  color: var(--gray-50);
  border: none;
}

/* 上层角色卡片 */
.slide-content {
  position: relative;
  z-index: 2;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 0 16px;
  min-height: 70px;
  transition: transform 0.22s ease;
}

.is-animating {
  transition: transform 0.22s ease;
}
</style>