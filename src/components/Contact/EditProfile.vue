<template>
  <div class="profile-wrapper">
    <!-- 左侧返回按钮 -->
    <button class="back-btn" @click="goBack">
      ← 返回
    </button>

    <!-- 头像 + 标题 模块 -->
    <div class="profile-info">
      <div class="profile-avatar" @click="handleUploadAvatar">
        <img
            class="avatar-img"
            src="https://picsum.photos/seed/ai-agent/200/200"
            alt="智能体头像"
        >
      </div>
      <h2 class="profile-name">新建智能体</h2>
    </div>

    <!-- 新建表单模块 -->
    <div class="profile-bio agent-form">
      <!-- 智能体名称 -->
      <div class="form-item">
        <label>智能体名称</label>
        <input
            v-model="agentForm.name"
            type="text"
            class="form-input"
            placeholder="请输入智能体名称"
        />
      </div>

      <!-- 核心人设 -->
      <div class="form-item">
        <label>核心人设</label>
        <textarea
            v-model="agentForm.corePersona"
            class="form-textarea"
            placeholder="请描述智能体的核心定位/作用"
            rows="4"
        ></textarea>
      </div>

      <!-- 语气风格 -->
      <div class="form-item">
        <label>语气风格</label>
        <input
            v-model="agentForm.tone"
            type="text"
            class="form-input"
            placeholder="例如：温柔、专业、幽默、严谨"
        />
      </div>
    </div>

    <!-- 操作按钮组：取消 + 创建 -->
    <div class="action-buttons">
      <button class="btn gift-btn" @click="goBack">取消</button>
      <button class="btn message-btn" @click="handleCreateAgent">创建</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 返回上一页
const goBack = () => {
  router.back()
}

// 智能体表单数据
const agentForm = ref({
  name: '',
  corePersona: '',
  tone: ''
})

// 上传头像（预留方法）
const handleUploadAvatar = () => {
  console.log('点击上传智能体头像')
  // 后续可对接上传逻辑
}

// 创建智能体
const handleCreateAgent = () => {
  console.log('创建智能体：', agentForm.value)
  // 对接创建接口
  alert('智能体创建成功！')
  goBack()
}
</script>

<style scoped>
/* ====================== 完全复用你的原有样式 ====================== */
.profile-wrapper {
  width: 100%;
  min-height: calc(100vh - 60px);
  background-color: var(--bg-color);
  padding: 60px 24px 40px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  user-select: none;
}

.back-btn {
  position: absolute;
  left: 24px;
  top: 30px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 99;
}

.profile-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
}

.profile-avatar {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4px 20px var(--shadow-color),
  0 1px 2px rgba(var(--accent-color-rgb), 0.1);
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  cursor: pointer;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.profile-avatar:hover {
  transform: scale(1.03);
  box-shadow: 0 8px 24px var(--shadow-color);
}

.profile-name {
  margin: 0;
  font-size: 30px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 0.5px;
}

.profile-bio {
  width: 100%;
  max-width: 340px;
  background: var(--card-bg);
  border-radius: 20px;
  padding: 24px 20px;
  border: 1px solid var(--border-color);
  margin-bottom: auto;
}

.action-buttons {
  display: flex;
  gap: 16px;
  width: 100%;
  max-width: 340px;
  margin-top: 30px;
}

.btn {
  flex: 1;
  height: 52px;
  border-radius: 26px;
  border: none;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.3px;
}

.gift-btn {
  background-color: var(--primary-color);
  color: var(--gray-50);
  box-shadow: 0 2px 8px var(--shadow-color);
}

.message-btn {
  background-color: var(--gray-800);
  color: var(--gray-50);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow-color);
  opacity: 0.95;
}

.btn:active {
  transform: translateY(0);
}

/* ====================== 新增：表单专属样式（统一设计语言） ====================== */
.agent-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  text-align: left;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-color);
  color: var(--text-primary);
  font-size: 15px;
  box-sizing: border-box;
  outline: none;
  transition: all 0.2s ease;
  resize: none;
}

.form-input:focus,
.form-textarea:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(var(--accent-color-rgb), 0.1);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: var(--text-tertiary);
}
</style>