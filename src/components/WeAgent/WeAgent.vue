<template>
  <div class="we-agent-wrapper">
    <!-- 标题区域 -->
    <h2 class="agent-title">微智能</h2>

    <!-- 功能介绍 -->
    <div class="agent-desc">
      <p>全新智能对话体验，支持主动发起对话</p>
      <p>可连续发送多条消息，还原微信式流畅交互</p>
      <p>让你的交流更智能、更高效</p>
    </div>

    <!-- 协议勾选 -->
    <label class="agreement-label">
      <input
          type="checkbox"
          v-model="agreeAgreement"
          class="agreement-checkbox"
      >
      <span>我已阅读并同意<a href="javascript:;" class="agreement-link">《微智能服务协议》</a></span>
    </label>

    <!-- 开关按钮 -->
    <button
        class="agent-btn"
        :disabled="!agreeAgreement"
        @click="handleToggleAgent"
    >
      {{ configStore.isAgentEnabled ? '关闭微智能' : '开启微智能' }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
// 引入Pinia配置仓库
import { useAiSoftwareConfigStore } from '@/stores/aiSoftwareConfig'

const configStore = useAiSoftwareConfigStore()
// 协议勾选状态
const agreeAgreement = ref(false)

// 切换微智能开关
const handleToggleAgent = () => {
  configStore.toggleAgent()
}
</script>

<style scoped>
.we-agent-wrapper {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 40px 24px;
  background-color: var(--bg-color);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* 标题 */
.agent-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  text-align: center;
  letter-spacing: 1px;
}

/* 介绍文案 */
.agent-desc {
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: center;
}

.agent-desc p {
  font-size: 16px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

/* 协议样式 */
.agreement-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-tertiary);
  cursor: pointer;
  margin-top: 8px;
}

.agreement-checkbox {
  width: 16px;
  height: 16px;
  accent-color: var(--primary-color);
  cursor: pointer;
}

.agreement-link {
  color: var(--primary-color);
  text-decoration: none;
  margin-left: 4px;
}

/* 操作按钮 */
.agent-btn {
  height: 48px;
  border-radius: 12px;
  border: none;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: var(--primary-color);
  color: var(--gray-50);
}

/* 按钮禁用状态 */
.agent-btn:disabled {
  background-color: var(--gray-300);
  color: var(--gray-400);
  cursor: not-allowed;
}

/* 按钮hover效果 */
.agent-btn:not(:disabled):hover {
  opacity: 0.9;
  transform: translateY(-1px);
}
</style>