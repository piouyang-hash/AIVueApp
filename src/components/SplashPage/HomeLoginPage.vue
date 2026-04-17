<template>
  <div class="login-page" :style="{ backgroundImage: `url(${bgImage})` }">
    <!-- 返回按钮（保留原有结构，仅修改样式） -->
    <button class="back-btn" @click="goBackToLoginRegister">
      <span>返回</span>
    </button>

    <!-- 新增圆形元素 -->
    <div class="main-circle"></div>

    <!-- 登录表单 -->
    <div class="login-form">
      <!-- 新增测试账号填充按钮 -->
      <div class="form-header">
        <h2 class="form-title">登录账号</h2>
        <button class="fill-test-btn" @click="fillTestAccount">填充测试账号</button>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <label for="email">邮箱</label>
          <input
              id="email"
              type="email"
              v-model="email"
              placeholder="请输入邮箱地址"
              required
              @blur="validateEmail"
          />
          <div class="email-input-icon">
            <!-- 保留原有雪碧图组件 -->
            <SvgIcon
                :icon-class="'email'"
                size="20px"
                className="icon"
                color="var(--text-tertiary)"
            />
          </div>
          <!-- 新增邮箱错误提示 -->
          <p class="error-tip" v-if="emailError">{{ emailError }}</p>
        </div>

        <div class="input-group">
          <label for="password">密码</label>
          <!-- 保留原有包裹结构 -->
          <div class="password-input-wrapper">
            <input
                id="password"
                :type="showPassword ? 'text' : 'password'"
                v-model="password"
                placeholder="请输入密码"
                required
                class="form-input"
                @blur="validatePassword"
            />
            <!-- 保留原有密码图标 -->
            <div class="password-input-icon">
              <SvgIcon
                  :icon-class="'password'"
                  size="20px"
                  className="icon"
                  color="var(--text-tertiary)"
              />
            </div>
            <!-- 保留Eyes组件 -->
            <Eyes v-model="showPassword" class="eye-icon"/>
          </div>
          <!-- 新增密码错误提示 -->
          <p class="error-tip" v-if="passwordError">{{ passwordError }}</p>
        </div>

        <div class="form-options">
          <label class="remember-me">
            <input type="checkbox" v-model="rememberMe" />
            <span>记住我</span>
          </label>
          <!-- 修改为点击事件 -->
          <a href="javascript:void(0)" class="forgot-password" @click="handleForgotPwd">忘记密码?</a>
        </div>

        <!-- 登录按钮增加禁用状态和加载文字 -->
        <button type="submit" class="login-btn" :disabled="!isFormValid || isLoading">
          {{ isLoading ? '登录中...' : '登录' }}
        </button>
      </form>

      <div class="divider">
        <span>或</span>
      </div>

      <!-- 注册按钮修改为跳转事件 -->
      <button class="register-btn" @click="goToRegister">注册新账号</button>
    </div>

    <!-- 底部信息保留 -->
    <div class="footer">
      <p>© 2026 萌芽科技. 保留所有权利.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Eyes from "@/components/Tiny/eyes.vue";
import { useToastStore } from '@/stores/toastStore'
import { loginService } from "@/services/auth.service.js";
import { initWebSocketService } from '@/services/heartbeat.service.js'

import bgImage from '@/static/images/FirstL.jpeg';

// 初始化路由和toast
const router = useRouter()
const toast = useToastStore()

defineOptions({
  name: 'HomeLoginPage'
})

// 表单核心数据（保留原有字段）
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)

// 新增核心状态
const isLoading = ref(false) // 登录加载状态
const emailError = ref('')   // 邮箱错误提示
const passwordError = ref('')// 密码错误提示

// QQ邮箱正则验证规则
const emailRegex = /^\d+@qq\.com$/

// 1. 填充测试账号功能
const fillTestAccount = () => {
  email.value = '2872145474@qq.com'
  password.value = 'ah1149727586'
  // 清空错误提示
  emailError.value = ''
  passwordError.value = ''
}

// 2. 邮箱验证（失焦触发，仅验证格式）
const validateEmail = () => {
  if (email.value && !emailRegex.test(email.value)) {
    emailError.value = '请输入有效的QQ邮箱（如：123456@qq.com）'
    return false
  }
  emailError.value = ''
  return true
}

// 3. 密码验证（失焦触发，仅验证长度）
const validatePassword = () => {
  if (password.value && password.value.length < 6) {
    passwordError.value = '密码长度不能少于6位'
    return false
  }
  passwordError.value = ''
  return true
}

// 4. 表单有效性计算（控制按钮禁用）
const isFormValid = computed(() => {
  return !!email.value && !!password.value && validateEmail() && validatePassword()
})

// 5. 核心登录逻辑（异步处理）
const handleLogin = async () => {
  // 第一步：检查空值
  let isEmpty = false
  isLoading.value = true

  if (!email.value) {
    emailError.value = '请输入QQ邮箱'
    isEmpty = true
  }
  if (!password.value) {
    passwordError.value = '请输入密码'
    isEmpty = true
  }

  if (isEmpty) {
    isLoading.value = false
    return
  }

  // 第二步：验证格式/长度
  if (!validateEmail() || !validatePassword()) {
    isLoading.value = false
    return
  }

  // 第三步：调用登录API
  try {
    await loginService(email.value, password.value, rememberMe.value)

    // 处理记住密码
    if (rememberMe.value) {
      localStorage.setItem('savedEmail', email.value)
    } else {
      localStorage.removeItem('savedEmail')
    }

    // 登录成功提示+初始化WebSocket+跳转首页
    toast.show('登录成功', "success")
    await initWebSocketService()
    await router.push({name: "MyHomePageMain"})
  } catch (error) {
    console.error('登录错误详情：', error)
    toast.show('登录失败，请检查账号密码', "error")
  } finally {
    isLoading.value = false // 无论成败都关闭加载状态
  }
}

// 修正语义：返回开屏页（替代原跳过登录逻辑）
const goBackToLoginRegister = () => {
  // 跳转到LoginRegisterPage（开屏页）
  router.push({name: "LoginRegisterPage"})
}

// 7. 跳转注册页
const goToRegister = () => {
  router.push({ name: 'HomeRegisterPage' })
}

// 8. 忘记密码跳转
const handleForgotPwd = () => {
  router.push({ name: 'ForgetPassword' })
}

// 9. 页面加载时自动填充记住的邮箱
const initForm = () => {
  const savedEmail = localStorage.getItem('savedEmail')
  if (savedEmail) {
    email.value = savedEmail
    rememberMe.value = true
  }
}

// 挂载时初始化表单
onMounted(() => {
  initForm()
})
</script>

<style scoped>

/* 测试账号按钮样式（适配原有布局） */
.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.fill-test-btn {
  font-size: 12px;
  padding: 4px 8px;
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  cursor: pointer;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

/* 登录页容器：保留所有原有样式，仅新增背景图相关属性（核心） */
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f9fafb;
  padding: 20px;
  position: relative;
  /* 新增：背景图属性（和login-register-page一致，用于继承） */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  box-sizing: border-box;
  overflow: hidden;
  user-select: none;
}

/* 返回按钮（磨砂玻璃风格 + 整体缩小） */
.back-btn {
  /* 保留原有定位 */
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
  /* 核心缩小调整：内边距从 8px 20px → 6px 16px（按钮整体变小） */
  padding: 6px 16px;
  /* 字号从14px → 13px（文字适配按钮大小） */
  font-size: 13px;
  /* 圆角从20px → 16px（适配缩小后的内边距，比例更协调） */
  border-radius: 16px;
  /* 保留原有风格属性 */
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.95);
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  /* 微调阴影：适配小按钮，阴影稍小更协调 */
  box-shadow:
      0 3px 8px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  font-weight: 500;
  letter-spacing: 0.5px;
  margin-top: 0;
}

/* 移除多余的span内边距（避免按钮内部文字间距过大） */
.back-btn span {
  display: inline-block;
  padding: 0; /* 原4px 8px移除，避免按钮内部空间浪费 */
}

/* 圆形元素：保留所有原有位置/尺寸样式，仅新增背景图继承（核心） */
.main-circle {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  /* 临时注释底色（先确保背景图显示，后续可调整） */
  /* background-color: var(--gray-100); */
  margin-bottom: 40px; /* 保留原有间距，位置不变 */
  /* 核心修复：移除fixed，调整继承逻辑 */
  background-image: inherit; /* 继承父级背景图 */
  background-size: 185%;     /* 和父级一致的缩放 */
  background-position: 50% 35%;
  background-attachment: local; /* 替换fixed为local，适配流元素 */
  /* 移除混合模式（先确保图片显示） */
  /* background-blend-mode: overlay; */
  /* 保留视觉增强样式（不影响位置） */
  border: 4px solid rgba(255, 255, 255, 0.9);
  box-shadow:
      0 0 20px rgba(255, 255, 255, 0.3),
      inset 0 0 20px rgba(255, 255, 255, 0.2),
      0 4px 12px var(--shadow-color);
  overflow: hidden;
  /* 新增：强制提升背景图渲染优先级 */
  background-repeat: no-repeat;
  z-index: 1;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-10px) scale(1.1);
    opacity: 0.8;
  }
}

/* 登录表单 */
.login-form {
  width: 100%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 40px 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

/* 新增错误提示样式（可根据项目样式调整） */
.error-tip {
  color: #f56c6c;
  font-size: 12px;
  margin: 4px 0 0 0;
  height: 16px;
}

.form-title {
  text-align: center;
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 32px;
}

.input-group {
  position: relative;
  margin-bottom: 24px;
}

.input-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.input-group input {
  width: 100%;
  padding: 14px 16px 14px 44px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  color: #111827;
  background-color: #f9fafb;
  transition: all 0.2s ease;
}

.input-group input:focus {
  outline: none;
  border-color: #4b5563;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(75, 85, 99, 0.1);
}

.email-input-icon {
  position: absolute;
  left: 16px;
  top: 43px;
  color: #9ca3af;
  pointer-events: none; /* 防止遮挡输入框点击 */
}

/* 密码输入框容器：相对定位，包裹输入框、图标、眼睛按钮 */
.password-input-wrapper {
  position: relative;
  width: 100%;
}

.password-input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none; /* 防止遮挡输入框点击 */
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}

.remember-me {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
}

.remember-me input {
  margin-right: 8px;
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.forgot-password {
  font-size: 14px;
  color: #4b5563;
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  padding: 16px;
  background-color: #111827;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-bottom: 24px;
}

/* 禁用状态核心样式（文字/背景互换） */
.login-btn:disabled {
  background-color: white; /* 互换为白色背景 */
  color: #111827; /* 互换为深色文字 */
  border: 1px solid #111827; /* 加边框保证按钮轮廓，可选但更美观 */
  cursor: not-allowed; /* 禁用光标 */
  opacity: 0.8; /* 轻微降低不透明度，区分禁用状态 */
}

/* 分割线 */
.divider {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: #e5e7eb;
}

.divider span {
  padding: 0 16px;
  color: #9ca3af;
  font-size: 14px;
}

/* 注册按钮 */
.register-btn {
  width: 100%;
  padding: 16px;
  background-color: white;
  color: #111827;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.register-btn:hover {
  border-color: #9ca3af;
  background-color: #f9fafb;
}

/* 底部信息（背景低调 + 文字突出） */
.footer {
  margin-top: 40px;
  text-align: center;
  /* 核心1：极浅灰色背景（和白色融合，不突出） */
  background-color: #8e9bb8;
  /* 核心2：添加内边距，让背景包裹文字（不贴边） */
  padding: 8px 16px;
  /* 核心3：轻微圆角，让背景更柔和 */
  border-radius: 8px;
  /* 核心4：文字深黑色（突出，对比浅背景） */
  color: #1f2937;
  /* 核心5：字号稍大+轻微加粗，进一步突出文字 */
  font-size: 15px;
  font-weight: 500;
  /* 可选：限制宽度，避免背景拉得太宽 */
  max-width: 300px;
  /* 居中背景块 */
  margin-left: auto;
  margin-right: auto;
}

@media (max-width: 480px) {
  .login-form {
    padding: 32px 24px;
  }

  .form-title {
    font-size: 20px;
  }
}
</style>