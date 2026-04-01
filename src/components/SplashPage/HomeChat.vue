<template>
  <!-- 修改 ai-chat-container 标签，添加 :style 绑定背景图 -->
  <div class="chat-bg-container" >
    <div class="ai-chat-container">
      <!-- 顶部导航栏 -->
      <header class="chat-header">
        <button class="back-btn" @click="handleBack">
          <img
              class="back-icon"
              :src="BackIcon"
              alt="返回"
              width="18"
              height="18"
          />
        </button>

        <!-- 会话信息区 -->
        <div class="session-info">
          <div class="session-text">
            <h1 class="ai-name">萌芽</h1>
          </div>
        </div>

        <!-- 占位 -->
        <div class="header-placeholder"></div>
        <!-- 游客版隐藏动态功能按钮 -->
      </header>

      <!-- 中间对话区域 -->
      <main class="chat-content">
      </main>

    <AIInput/>
    </div>
  </div>
</template>

<script setup>
import {useRouter} from 'vue-router'

// 仅导入静态资源，移除动态逻辑依赖
import BackIcon from '@/static/icons/back.svg'

import AIInput from "@/components/Tiny/AIInput.vue";

// 初始化 router 实例
const router = useRouter()

// 修改返回按钮逻辑：跳转到登录注册页
const handleBack = () => {
  router.push({name: 'LoginRegisterPage'});
  console.log('游客点击返回按钮，跳转到登录注册页');
};
</script>

<style scoped>
/* 外层背景容器：仅承载背景图 */
.chat-bg-container {
  width: 100%;
  height: 100vh;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  position: relative; /* 作为内层定位参考 */
}

/* 内层容器：实现磨砂模糊 */
.ai-chat-container {
  width: 100%;
  height: 100vh;
  max-width: 100%;
  /* 磨砂核心样式（必加） */
  background-color: rgba(255, 255, 255, 0.1); /* 降低透明度增强磨砂感 */
  backdrop-filter: blur(0px); /* 增大模糊值，更明显 */
  -webkit-backdrop-filter: blur(12px); /* 兼容Chrome/Safari */
  /* 保留原有样式 */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 0;
  box-shadow: 0 0 12px var(--shadow-color);
  user-select: none;
  /* 新增：确保覆盖外层背景 */
  position: relative;
  z-index: 1;
}

.chat-header {
  padding: 12px 20px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 16px;
  background-color: rgba(255, 255, 255, 0.85);
  box-shadow: 0 2px 8px var(--shadow-color);
  position: relative;
  z-index: 10;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background-color: transparent;
  border: none;
  border-radius: 8px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.25s ease;
  font-size: 14px;
}

.back-btn:hover {
  background-color: var(--gray-100);
  color: var(--primary-color);
}

.back-icon {
  flex-shrink: 0;
}

.session-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.session-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ai-name {
  margin: 0;
  font-size: 16px;
  color: var(--text-primary);
  font-weight: 600;
  line-height: 1;
}

.header-placeholder {
  width: 40px;
}

/* 聊天内容区样式调整 */
.chat-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 游客空状态样式（核心改造） */
.visitor-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  color: var(--text-primary);
  text-align: center;
  padding: 40px 20px;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  max-width: 400px;
  width: 100%;
}

.visitor-icon-wrapper {
  opacity: 0.8;
}

.visitor-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.visitor-desc {
  font-size: 14px;
  color: var(--text-tertiary);
  margin: 0;
  line-height: 1.5;
}

.visitor-login-btn {
  padding: 12px 32px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;
}

.visitor-login-btn:hover {
  background-color: var(--primary-color-dark);
}

/* 静态输入框样式 */
.visitor-input-area {
  padding: 16px 20px;
  background-color: rgba(255, 255, 255, 0.85);
  border-top: 1px solid var(--border-color);
}

.input-wrapper {
  display: flex;
  gap: 12px;
  align-items: center;
}

.disabled-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 24px;
  font-size: 14px;
  background-color: var(--gray-50);
  color: var(--text-tertiary);
  cursor: not-allowed;
}

.disabled-input::placeholder {
  color: var(--text-quaternary);
}

.send-btn {
  padding: 12px 20px;
  background-color: var(--gray-200);
  color: var(--text-tertiary);
  border: none;
  border-radius: 24px;
  cursor: not-allowed;
  font-size: 14px;
}

/* 滚动条美化 */
.chat-content::-webkit-scrollbar {
  width: 6px;
}

.chat-content::-webkit-scrollbar-track {
  background: var(--gray-100);
  border-radius: 3px;
}

.chat-content::-webkit-scrollbar-thumb {
  background: var(--gray-300);
  border-radius: 3px;
}

.chat-content::-webkit-scrollbar-thumb:hover {
  background: var(--gray-400);
}
</style>