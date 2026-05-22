<template>
  <div class="profile-wrapper">
    <!-- 左侧返回按钮 -->
    <button class="back-btn" @click="goBack">
      ← 返回
    </button>

    <!-- 头像 + 标题 模块 -->
    <div class="profile-info">
      <!-- 点击区域 → 触发文件选择 -->
      <div class="profile-avatar" @click="handleUploadAvatar">
        <!-- 有选中头像：显示预览图 -->
        <img
            v-if="avatarPreview"
            :src="avatarPreview"
            alt="智能体头像"
            class="avatar-img"
        >
        <!-- 无选中头像：显示默认SVG相机图标 -->
        <SvgIcon
            v-else
            icon-class="camera"
            size="5rem"
            className="avatar-camera-icon"
            color="var(--text-tertiary)"
        />
      </div>
      <h2 class="profile-name">头像</h2>

      <!-- 🔥 隐藏的文件选择框（核心） -->
      <input
          ref="avatarInput"
          type="file"
          accept="image/*"
          style="display: none"
          @change="handleAvatarChange"
      >
    </div>

    <!-- 新建表单模块 -->
    <div class="profile-bio agent-form">
      <!-- 智能体名称 → 绑定 roleDesc -->
      <div class="form-item">
        <label>智能体名称</label>
        <input
            v-model="agentForm.roleDesc"
            type="text"
            class="form-input"
            placeholder="请输入智能体名称"
            @input="validateRoleDesc"
            @blur="validateRoleDescBlur"
        />
        <!-- 错误提示（完全按照你的示例格式） -->
        <p class="error-tip" v-if="roleDescError">{{ roleDescError }}</p>
      </div>

      <!-- 核心人设 → 绑定 personaCore -->
      <div class="form-item">
        <label>核心人设</label>
        <textarea
            v-model="agentForm.personaCore"
            class="form-textarea"
            placeholder="请描述智能体的核心定位/作用"
            rows="4"
            @input="validatePersonaCore"
            @blur="validatePersonaCoreBlur"
        ></textarea>
        <!-- 错误提示（和名称样式完全统一） -->
        <p class="error-tip" v-if="personaCoreError">{{ personaCoreError }}</p>
        <!-- 字数统计（0字隐藏，不变） -->
        <div
            class="persona-word-count"
            v-if="agentForm.personaCore.length > 0"
        >
          {{ agentForm.personaCore.length }}字
        </div>
      </div>

      <!-- 语气风格 → 绑定 personaTone -->
      <div class="form-item">
        <label>语气风格</label>
        <input
            v-model="agentForm.personaTone"
            type="text"
            class="form-input"
            placeholder="例如：温柔、专业、幽默、严谨"
        />
      </div>

      <!-- 是否公开 开关 → 绑定 visibleScope -->
      <div class="form-item form-item-row">
        <label>是否公开</label>
        <DaySlide
            :is-active="agentForm.visibleScope === 1"
            :on-toggle="handleTogglePublic"
        />
      </div>
    </div>

    <!-- 操作按钮组：取消 + 创建 -->
    <div class="action-buttons">
      <button class="btn cancel-btn" @click="goBack">取消</button>
      <!-- 🔥 创建按钮：类名重命名 + 自动禁用/启用 -->
      <button
          class="btn create-btn"
          @click="handleCreateAgent"
      >
        创建
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import DaySlide from "@/components/Tiny/DaySlide.vue";
import { useContactStore } from '@/stores/ContactStore'
import { storeToRefs } from 'pinia'
import {useRouter} from "vue-router";
import {createAiRole} from "@/services/ai_chat.role.service.js";
const router = useRouter()
const contactStore = useContactStore()
const { agentForm } = storeToRefs(contactStore)

// 🔥 新增：智能体名称错误提示
const roleDescError = ref('')
const personaCoreError = ref('')   // 核心人设错误

// 🔥 头像相关（参考你原有代码编写）
const avatarInput = ref(null) // 文件选择框DOM引用
const avatarPreview = ref('') // 本地预览地址
const avatarFile = ref(null) // 选中的文件对象

// 1. 点击头像 → 触发文件选择框
const handleUploadAvatar = () => {
  avatarInput.value.click()
}

// 2. 文件选择后 → 预览+存储文件（完全照搬你的逻辑）
const handleAvatarChange = (e) => {
  const file = e.target.files[0]
  if (!file) return

  // 保存文件对象（提交接口时使用）
  avatarFile.value = file
  // 本地预览（FileReader转base64）
  const reader = new FileReader()
  reader.onload = (event) => {
    avatarPreview.value = event.target.result
  }
  reader.readAsDataURL(file)
}

// ==================== 智能体名称验证 ====================
/**
 * 输入时验证：字数不能超过20
 */
const validateRoleDesc = () => {
  const value = agentForm.value.roleDesc.trim()
  if (value.length > 20) {
    roleDescError.value = '智能体名称不能超过20个字符'
  } else {
    // 不超过20字时清空错误（不处理空值，空值由失焦校验）
    roleDescError.value = ''
  }
}

/**
 * 失焦时验证：不能为空
 */
const validateRoleDescBlur = () => {
  const value = agentForm.value.roleDesc.trim()
  // 先执行长度校验
  validateRoleDesc()
  // 再校验空值
  if (value.length === 0) {
    roleDescError.value = '请输入智能体名称'
  }
}

// 输入时校验：超过2000字报错
const validatePersonaCore = () => {
  const value = agentForm.value.personaCore.trim()
  if (value.length > 2000) {
    personaCoreError.value = '核心人设不能超过2000个字符'
  } else {
    personaCoreError.value = ''
  }
}
// 失焦时校验：不能为空
const validatePersonaCoreBlur = () => {
  const value = agentForm.value.personaCore.trim()
  validatePersonaCore()
  if (value.length === 0) {
    personaCoreError.value = '请输入核心人设'
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 开关切换
const handleTogglePublic = () => {
  contactStore.toggleAgentPublic()
}

// 创建智能体
// ==================== 提交创建智能体 ====================
const handleCreateAgent = async () => {
  // 1. 全表校验
  validateRoleDescBlur()
  validatePersonaCoreBlur()
  if (roleDescError.value || personaCoreError.value) return

  try {
    // 2. 调用接口（传入表单 + 头像文件）
    await createAiRole(contactStore.agentForm, avatarFile.value)

    alert('智能体创建成功！')
    // 3. 重置所有状态
    contactStore.resetAgentForm()
    avatarPreview.value = ''
    avatarFile.value = null
    goBack()
  } catch (e) {
    alert('创建失败：' + e.message)
  }
}
</script>

<style scoped>
/* ====================== 完全复用你的原有样式 ====================== */
.profile-wrapper {
  width: 100%;
  height: 100%;
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
  /* 👇 新增边框（使用设计规范变量） */
  border: 2px solid var(--gray-200);
  /* 👇 优化阴影（沿用你的变量，更高级） */
  box-shadow: 0 6px 24px var(--shadow-color),
  0 2px 8px rgba(var(--accent-color-rgb), 0.15);
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  cursor: pointer;
  /* 居中样式（保留） */
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 头像预览图样式 */
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
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

/* 核心人设字数统计样式 */
.persona-word-count {
  text-align: right;
  font-size: 0.85rem;
  /* 使用你指定的灰色变量 */
  color: var(--text-tertiary);
  margin-top: 4px;
}

.action-buttons {
  display: flex;
  gap: 16px;
  width: 100%;
  max-width: 340px;
  margin-top: 30px;
}

/* 按钮基础样式 */
.btn {
  flex: 1;
  padding: 14px;
  border-radius: 12px;
  border: none;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
}

/* 取消按钮（原 gift-btn） */
.cancel-btn {
  background-color: var(--primary-color);
  color: var(--gray-50);
  box-shadow: 0 2px 8px var(--shadow-color);
}

/* 创建按钮（原 message-btn） */
.create-btn {
  background-color: var(--gray-800);
  color: var(--gray-50);
  transition: all 0.2s;
}

/* 创建按钮禁用状态：背景/字体颜色互换 + 禁止点击 */
.create-btn:disabled {
  background-color: var(--gray-50);
  color: var(--gray-800);
  cursor: not-allowed;
  box-shadow: none;
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

.error-tip {
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
  min-height: 16px;
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

/* 表单项横向布局：文字 + 开关同行 */
.form-item-row {
  margin-top: 12px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
</style>