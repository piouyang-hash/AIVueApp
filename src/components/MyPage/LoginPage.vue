<template>
  <MyPageLayout>
    <div class="login-page">
      <div class="login-card">
        <div class="card-header">
          <button class="login-title-btn" @click="fillTestAccount">用户登录</button>
          <p class="login-subtitle">欢迎回来，请使用QQ邮箱登录</p>
        </div>

        <!-- 邮箱输入框（替换原用户名） -->
        <div class="form-group">
          <label class="form-label">QQ邮箱</label>
          <input
              type="email"
              v-model="email"
              placeholder="请输入你的QQ邮箱"
              class="form-input"
              @blur="validateEmail"
          >
          <p class="error-tip" v-if="emailError">{{ emailError }}</p>
        </div>

        <div class="form-group">
          <label class="form-label">密码</label>
          <div class="password-input-wrapper">
            <input
                :type="showPassword ? 'text' : 'password'"
                v-model="password"
                placeholder="请输入密码"
                class="form-input"
                @blur="validatePassword"
            >
            <Eyes v-model="showPassword" class="eye-icon"/>
          </div>
          <p class="error-tip" v-if="passwordError">{{ passwordError }}</p>
        </div>

        <!-- 优化后的：记住密码选项 -->
        <div class="remember-me">
          <label class="remember-label">
            <input type="checkbox" id="remember" v-model="rememberMe">
            <span class="checkmark"></span>
            <span class="label-text">记住我</span>
          </label>
          <a href="javascript:void(0)" class="forgot-pwd" @click="handleForgotPwd">忘记密码？</a>
        </div>

        <button
            @click="handleLogin"
            class="login-btn"
            :disabled="!isFormValid || isLoading"
        >
          <!-- 加载中显示文字/图标，提升用户体验 -->
          {{ isLoading ? '登录中...' : '登录' }}
        </button>

        <div class="register-link">
          还没有账号？
          <button @click="goToRegister" class="link-text">立即注册</button>
        </div>
      </div>
    </div>
  </MyPageLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Eyes from '@/components/Tiny/eyes.vue'
import { useToastStore } from '@/stores/toastStore'
import { loginService } from "@/services/auth.service.js";
import MyPageLayout from "@/components/MyPage/MyPageLayout.vue";
import {initWebSocketService} from "@/services/heartbeat.service.js";

const toast = useToastStore()
const router = useRouter()

defineOptions({
  name: 'LoginPage'
})

// 表单数据（替换username为email）
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false) // 记住密码
// 新增：登录加载状态（核心）
const isLoading = ref(false)

const fillTestAccount = () => {
  email.value = '2872145474@qq.com'
  password.value = 'ah1149727586'
  // 清空错误提示（可选）
  emailError.value = ''
  passwordError.value = ''
}

// 错误提示
const emailError = ref('')
const passwordError = ref('')

// QQ邮箱正则（和注册页保持一致）
const emailRegex = /^\d+@qq\.com$/

// 1. 邮箱验证（只验证格式，不验证空值）
const validateEmail = () => {
  // 只有邮箱有值时，才验证格式
  if (email.value && !emailRegex.test(email.value)) {
    emailError.value = '请输入有效的QQ邮箱（如：123456@qq.com）'
    return false
  }
  // 邮箱为空或格式正确时，清空格式错误提示
  emailError.value = ''
  return true
}

// 2. 密码验证（只验证长度，不验证空值）
const validatePassword = () => {
  // 只有密码有值时，才验证长度
  if (password.value && password.value.length < 6) {
    passwordError.value = '密码长度不能少于6位'
    return false
  }
  // 密码为空或长度符合时，清空长度错误提示
  passwordError.value = ''
  return true
}

// 3. 登录处理（手动触发空值判断 + 格式验证）
const handleLogin = async () => {
  // 第一步：手动检查空值（只有点击登录时才触发）
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
  // 如果有空值，直接返回，不执行后续逻辑
  if (isEmpty) return

  // 第二步：验证格式/长度（此时邮箱和密码都有值）
  if (!validateEmail() || !validatePassword()) {
    return
  }

  // 第三步：所有验证通过，执行登录逻辑
  try {
    await loginService(email.value, password.value)

    if (rememberMe.value) {
      localStorage.setItem('savedEmail', email.value)
    } else {
      localStorage.removeItem('savedEmail')
    }

    toast.show('登录成功', "success")
    // 开始建立连接，发送心跳包
    await initWebSocketService()
    await router.push({name: "MyHomePageMain"})
  } catch (error) {
    console.error('登录错误详情：', error)
    // 可选：给用户提示错误
    toast.show('登录失败，请检查账号密码', "error")
  } finally {
    // 2. 无论成功/失败，最终都解锁按钮
    isLoading.value = false
  }
}

// 调整isFormValid（控制登录按钮禁用：只要有值就启用，空值时禁用）
const isFormValid = computed(() => {
  return !!email.value && !!password.value && validateEmail() && validatePassword();
});

// 跳转到注册页
const goToRegister = () => {
  router.push({ name: 'MyRegister' });
}

// 忘记密码（预留逻辑）
const handleForgotPwd = () => {
  // 直接跳转到ForgetPassword路由（按name匹配，无需拼路径）
  router.push({ name: 'ForgetPassword' });
};

// 页面加载时：自动填充记住的邮箱
const initForm = () => {
  const savedEmail = localStorage.getItem('savedEmail')
  if (savedEmail) {
    email.value = savedEmail
    rememberMe.value = true
  }
}
initForm()
</script>

<style scoped>
/* 页面背景：和注册页一致的渐变 */
.login-page {
  min-height: calc(100vh - 60px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, var(--bg-color), var(--gray-100));
  transition: background-color 0.3s ease;
}

/* 登录卡片：和注册页一致的样式 */
.login-card {
  width: 100%;
  max-width: 400px;
  background: var(--card-bg);
  padding: 40px;
  border-radius: 16px;
  border: 1px solid var(--border-color);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

/* 卡片顶部渐变装饰条 */
.login-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
}

/* 卡片头部 */
.card-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-title {
  color: var(--text-primary);
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
}

.login-subtitle {
  color: var(--text-tertiary);
  font-size: 14px;
  margin: 0;
}

/* 表单组 */
.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
}

/* 密码输入框容器 */
.password-input-wrapper {
  position: relative;
  width: 100%;
}

.eye-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: var(--text-tertiary);
  width: 20px;
  height: 20px;
}

/* 原有样式保留，新增以下样式 */
.error-tip {
  color: var(--error-color, #e03131);
  font-size: 12px;
  margin: 4px 0 0 0;
  line-height: 1.4;
}

/* 优化后的样式 */
.remember-me {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 15px 0 25px 0;
  font-size: 14px;
}

/* 记住我复选框容器 */
.remember-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  color: var(--text-secondary);
}

/* 隐藏原生复选框 */
.remember-label input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

/* 自定义复选框样式 */
.checkmark {
  height: 16px;
  width: 16px;
  background-color: var(--gray-200);
  border-radius: 4px;
  margin-right: 8px; /* 复选框与文字的间距 */
  transition: background-color 0.2s ease;
}

/* 选中状态 */
.remember-label input:checked ~ .checkmark {
  background-color: var(--primary-color);
}

/* 复选框内的对勾 */
.checkmark:after {
  content: "";
  position: relative;
  display: none;
  left: 5px;
  top: 1px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.remember-label input:checked ~ .checkmark:after {
  display: block;
}

/* 标签文字 */
.label-text {
  font-size: 14px;
  color: var(--text-secondary);
}

/* 忘记密码链接 */
.forgot-pwd {
  color: var(--primary-color);
  cursor: pointer;
  font-size: 14px;
  text-decoration: none;
  padding: 2px 4px; /* 增加点击区域 */
  transition: color 0.2s ease;
}

.forgot-pwd:hover {
  color: var(--secondary-color);
  text-decoration: underline;
}

/* 输入框样式：和注册页一致 */
.form-input {
  width: 100%;
  padding: 14px 16px;
  padding-right: 40px; /* 给眼睛图标留空间 */
  border: 1px solid var(--border-color);
  background-color: var(--gray-50);
  color: var(--text-primary);
  border-radius: 10px;
  font-size: 15px;
  outline: none;
  transition: all 0.2s ease;
}

:global(.dark) .form-input {
  background-color: var(--gray-800);
}

.form-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
}

/* 登录按钮：渐变背景+动效 */
.login-btn {
  width: 100%;
  padding: 15px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 20px;
  transition: all 0.2s ease;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.2);
}

.login-btn:disabled {
  background: var(--gray-300);
  color: var(--text-secondary);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 注册链接 */
.register-link {
  text-align: center;
  font-size: 14px;
  color: var(--text-tertiary);
}

.link-text {
  /* 按钮基础样式 */
  display: inline-block;
  padding: 4px 12px;
  margin-left: 4px;
  border: 1px solid var(--primary-color);
  border-radius: 4px;
  background-color: transparent;
  color: var(--primary-color);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  /* 消除按钮默认样式 */
  outline: none;
  box-shadow: none;
}

.link-text:hover {
  color: var(--secondary-color);
  text-decoration: underline;
}

/* 深色模式适配 */
:global(.dark) .form-input {
  background-color: var(--gray-800);
}
</style>