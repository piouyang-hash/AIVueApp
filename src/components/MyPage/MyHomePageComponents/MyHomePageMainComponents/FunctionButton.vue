<template>
  <div class="function-list">

    <!-- 智能体 -->
    <div class="function-item clickable">
      <SvgIcon icon-class="agent" className="item-icon-svg agent-icon" />
      <span class="item-text">微智能体</span>
      <!-- 微智能体开关：传入状态 + 切换方法 -->
      <DaySlide
          :is-active="configStore.isAgentEnabled"
          :on-toggle="handleToggleAgent"
      />
    </div>

    <!-- 🔥 新增：切分消息 选项 -->
    <div class="function-item clickable">
      <SvgIcon icon-class="split" className="item-icon-svg split-icon" />
      <span class="item-text">切分消息</span>
      <!-- 切分消息开关：传入状态 + 切换方法 -->
      <DaySlide
          :is-active="configStore.isSplitMessageEnabled"
          :on-toggle="handleToggleSplitMessage"
      />
    </div>

    <!-- 我的钱包 -->
    <div class="function-item clickable" @click="handleWallet">
      <SvgIcon icon-class="my-wallet-btn" className="item-icon-svg" />
      <span class="item-text">我的钱包</span>
      <SvgIcon icon-class="right-arrow" className="arrow-icon" />
    </div>

    <!-- 我的收藏 -->
    <div class="function-item clickable" @click="handleCollection">
      <SvgIcon icon-class="my-collection-btn" className="item-icon-svg" />
      <span class="item-text">我的收藏</span>
      <SvgIcon icon-class="right-arrow" className="arrow-icon" />
    </div>

    <!-- 意见反馈 -->
    <div class="function-item clickable" @click="handleFeedback">
      <SvgIcon icon-class="feedback-btn" className="item-icon-svg" />
      <span class="item-text">意见反馈</span>
      <SvgIcon icon-class="right-arrow" className="arrow-icon" />
    </div>

    <!-- 帮助中心 -->
    <div class="function-item clickable" @click="handleHelp">
      <SvgIcon icon-class="help-center-btn" className="item-icon-svg" />
      <span class="item-text">帮助中心</span>
      <SvgIcon icon-class="right-arrow" className="arrow-icon" />
    </div>

    <!-- 退出登录 -->
    <div class="function-item clickable logout-item" @click="handleLogout">
      <SvgIcon icon-class="quit-login-btn" className="item-icon-svg" />
      <span class="item-text">退出登录</span>
      <SvgIcon icon-class="right-arrow" className="arrow-icon" />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user.js'
import { useModalStore } from '@/stores/modalStore.js'
import DaySlide from "@/components/Tiny/DaySlide.vue";
import { useAiSoftwareConfigStore } from '@/stores/aiSoftwareConfig'
import { toggleActiveChatMode, toggleSplitAiMessage } from "@/services/ai_chat.config.service.js"

const userStore = useUserStore()
const router = useRouter()
const modalStore = useModalStore()



const configStore = useAiSoftwareConfigStore()

// ============== 微智能体 切换 ==============
const handleToggleAgent = () => {
  configStore.toggleAgent()
  toggleActiveChatMode() // 调用后端接口
}

// ============== 切分消息 切换（新增） ==============
const handleToggleSplitMessage = () => {
  configStore.toggleSplitMessage() // store切换状态
  toggleSplitAiMessage() // 调用后端切换接口
}

// 我的钱包点击事件（新增）
const handleWallet = () => {
  router.push({ name: 'MyWallet' }) // 跳转到MyWallet页面
}

// 我的收藏点击事件
const handleCollection = () => {
  router.push({name: 'MyCollection'})
}

// 意见反馈点击事件
const handleFeedback = () => {
  router.push({name: 'MyFeedback'})
}

// 帮助中心点击事件
const handleHelp = () => {
  router.push({ name: 'MyHelpCenter' })
}

// 退出登录点击事件
const handleLogout = () => {
  modalStore.showQuitLoginModal()
}
</script>

<style scoped>
.function-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.function-item {
  display: flex;
  align-items: center;
  gap: 15px;
  background: var(--card-bg);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 5px var(--shadow-color);
  cursor: pointer;
  transition: transform 0.1s ease, background-color 0.2s;
  touch-action: manipulation;
  user-select: none;
}

/* 点击缩小反馈 */
.clickable:active {
  transform: scale(0.98);
  background-color: var(--card-hover-bg, rgba(0, 0, 0, 0.03));
}

/* SVG图标样式 */
.item-icon-svg {
  width: 20px;
  height: 20px;
  /* 核心修复：给图标一个固定的容器感 */
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  /* 建议给一个统一的最小宽度，比如 32px，确保无论图标多大，文字开头都对齐 */
  min-width: 32px;
}

/* 只放大智能体图标 */
.agent-icon {
  width: 28px !important;
  height: 28px !important;
}

.item-text {
  flex: 1;
  color: var(--text-primary);
  font-size: 16px;
}

/* SVG箭头图标样式 */
.arrow-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
  color: var(--text-tertiary);
}

</style>