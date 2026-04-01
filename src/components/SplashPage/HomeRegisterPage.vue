<template>
  <div class="register-page" :style="{ backgroundImage: `url(${bgImage})` }">
    <!-- 返回按钮（保留原有结构，仅修改样式） -->
    <button class="back-btn" @click="goBackToLoginRegister">
      <span>返回</span>
    </button>

    <!-- 圆形元素 -->
    <div class="main-circle"></div>

    <!-- 注册表单 -->
    <div class="register-form">
      <h2 class="form-title">用户注册</h2>
      <p class="form-subtitle">创建你的专属账号</p>

      <form @submit.prevent="handleRegister">
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
            <SvgIcon
                :icon-class="'email'"
                size="20px"
                className="icon"
                color="var(--text-tertiary)"
            />
          </div>
          <p class="error-tip" v-if="emailError">{{ emailError }}</p>
        </div>

        <div class="input-group">
          <label for="password">密码</label>
          <div class="password-input-wrapper">
            <input
                id="password"
                :type="showPassword ? 'text' : 'password'"
                v-model="password"
                placeholder="请设置6-20位密码"
                required
                class="form-input"
                @blur="validatePassword"
            />
            <div class="password-input-icon">
              <SvgIcon
                  :icon-class="'password'"
                  size="20px"
                  className="icon"
                  color="var(--text-tertiary)"
              />
            </div>
            <Eyes v-model="showPassword" class="eye-icon"/>
          </div>
          <p class="error-tip" v-if="passwordError">{{ passwordError }}</p>
        </div>

        <div class="input-group">
          <label for="confirm-password">确认密码</label>
          <div class="password-input-wrapper">
            <input
                id="confirm-password"
                :type="showConfirmPwd ? 'text' : 'password'"
                v-model="confirmPwd"
                placeholder="请再次输入密码"
                required
                class="form-input"
                @input="validateConfirmPwd"
            />
            <div class="password-input-icon">
              <SvgIcon
                  :icon-class="'password'"
                  size="20px"
                  className="icon"
                  color="var(--text-tertiary)"
              />
            </div>
            <Eyes v-model="showConfirmPwd" class="eye-icon"/>
          </div>
          <p class="error-tip" v-if="confirmPwdError">{{ confirmPwdError }}</p>
        </div>

        <div class="input-group">
          <label for="verify-code">验证码</label>
          <div class="verify-code-wrapper">
            <input
                id="verify-code"
                type="text"
                v-model="verifyCode"
                :placeholder="isSendingCode ? '6位' : '6位验证码'"
                required
                class="verify-code-input"
                @blur="validateVerifyCode"
            />
            <VerifyCodeButton
                :is-input-valid="isEmailValid"
                button-text="发送验证码"
                :count-down-time="90"
                :send-code-api="() => sendVerificationCode(email)"
                @sendSuccess="handleSendSuccess"
                @sendFail="handleSendFail"
            />
          </div>
          <p class="error-tip" v-if="verifyCodeError">{{ verifyCodeError }}</p>
        </div>

        <button
            type="submit"
            class="register-submit-btn"
            :disabled="!isFormValid || isRegisterLoading"
        >
          {{ isRegisterLoading ? '注册中...' : '完成注册' }}
        </button>
      </form>

      <div class="privacy-tip">
        点击注册即表示同意
        <a href="#" class="privacy-link">《用户协议》</a>和<a href="#" class="privacy-link">《隐私政策》</a>
      </div>

      <div class="divider">
        <span>或</span>
      </div>

      <button class="login-btn" @click="goToLogin">已有账号？立即登录</button>
    </div>

    <!-- 底部信息 -->
    <div class="footer">
      <p>© 2026 萌芽科技. 保留所有权利.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineOptions } from 'vue'
import { useRouter } from 'vue-router' // 路由跳转需导入useRouter
import Eyes from "@/components/Tiny/eyes.vue";
import VerifyCodeButton from "@/components/Tiny/verifyCodeButton.vue";
import bgImage from '@/static/images/FirstL.jpeg';
import {sendVerificationCode} from "@/services/vertification.service.js";

// 替代export default的name属性
defineOptions({
  name: 'RegisterPage'
})

// 初始化路由实例（替代this.$router）
const router = useRouter()

// 响应式数据（替代原data）
const email = ref('')
const password = ref('')
const confirmPwd = ref('')
const verifyCode = ref('')
const showPassword = ref(false)
const showConfirmPwd = ref(false)
const isSendingCode = ref(false)
const isRegisterLoading = ref(false)
const emailError = ref('')
const passwordError = ref('')
const confirmPwdError = ref('')
const verifyCodeError = ref('')
const isEmailValid = ref(false)

// 修正语义：返回开屏页（替代原跳过登录逻辑）
const goBackToLoginRegister = () => {
  // 跳转到LoginRegisterPage（开屏页）
  router.push({name: "LoginRegisterPage"})
}

// 计算属性（替代原computed）
const isFormValid = computed(() => {
  return email.value &&
      password.value &&
      confirmPwd.value &&
      verifyCode.value &&
      !emailError.value &&
      !passwordError.value &&
      !confirmPwdError.value &&
      !verifyCodeError.value;
})

// 方法定义（替代原methods，去掉this，直接操作ref的value）
const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.value) {
    emailError.value = '邮箱不能为空';
    isEmailValid.value = false;
  } else if (!emailRegex.test(email.value)) {
    emailError.value = '邮箱格式不正确';
    isEmailValid.value = false;
  } else {
    emailError.value = '';
    isEmailValid.value = true;
  }
}

const validatePassword = () => {
  if (!password.value) {
    passwordError.value = '密码不能为空';
  } else if (password.value.length < 6 || password.value.length > 20) {
    passwordError.value = '密码长度为6-20位';
  } else {
    passwordError.value = '';
    validateConfirmPwd(); // 直接调用方法，无需this
  }
}

const validateConfirmPwd = () => {
  if (!confirmPwd.value) {
    confirmPwdError.value = '请确认密码';
  } else if (confirmPwd.value !== password.value) {
    confirmPwdError.value = '两次输入的密码不一致';
  } else {
    confirmPwdError.value = '';
  }
}

const validateVerifyCode = () => {
  if (!verifyCode.value) {
    verifyCodeError.value = '验证码不能为空';
  } else if (!/^\d{6}$/.test(verifyCode.value)) {
    verifyCodeError.value = '验证码为6位数字';
  } else {
    verifyCodeError.value = '';
  }
}

const handleSendSuccess = () => {
  console.log('验证码发送成功');
}

const handleSendFail = () => {
  console.log('验证码发送失败');
}

import { ElMessage } from 'element-plus'
import {userRegister} from "@/services/auth.service.js"; // 确保已导入Element Plus提示组件

const handleRegister = async () => {
  // 先校验表单整体合法性
  if (!isFormValid.value) return;

  isRegisterLoading.value = true;

  try {
    // 调用真实注册接口（参数格式与参考示例对齐）
    await userRegister({
      email: email.value,
      password: password.value,
      code: verifyCode.value // 接口参数名统一为code，对应验证码
    });

    // 注册成功：Element Plus 成功提示 + 跳转登录页
    ElMessage.success('注册成功！');
    await router.push({ name: 'LoginPage' });

  } catch (error) {
    // 错误处理：区分验证码错误和通用错误
    if (error.response?.data?.message?.includes('验证码')) {
      ElMessage.error('验证码错误或已过期');
    } else {
      ElMessage.error('注册失败，请稍后重试');
      console.error('注册接口调用失败：', error);
    }
  } finally {
    // 无论成功/失败，都关闭加载状态
    isRegisterLoading.value = false;
  }
};

// 跳转登录页（和goToRegister格式一致）
const goToLogin = () => {
  // 替换为你实际的登录页路由name（比如HomeLoginPage/LoginPage等）
  router.push({ name: 'HomeLoginPage' })
}

</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

/* 注册页容器：保留原有样式，新增背景图相关属性 */
.register-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f9fafb;
  padding: 20px;
  position: relative;
  /* 新增：背景图属性（支持继承） */
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


/* 圆形元素：保留原尺寸/位置，新增背景图继承（和登录页逻辑一致） */
.main-circle {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  /* 注释原有底色（先确保背景图显示，如需保留可改为半透明） */
  /* background-color: var(--gray-100); */
  /* 保留原有阴影和间距（位置不变） */
  margin-bottom: 30px;
  /* 核心：继承父级背景图 */
  background-image: inherit;
  /* 背景图放大（和登录页一致，显示局部区域） */
  background-size: 200%;
  /* 图片向上微调（和登录页一致的位置） */
  background-position: 50% 35%;
  /* 适配流元素的背景定位（修复显示问题） */
  background-attachment: local;
  /* 视觉增强（可选，和登录页一致） */
  border: 4px solid rgba(255, 255, 255, 0.9);
  box-shadow:
      0 0 20px rgba(255, 255, 255, 0.3),
      inset 0 0 20px rgba(255, 255, 255, 0.2),
      0 4px 12px var(--shadow-color);
  overflow: hidden;
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

/* 注册表单 */
.register-form {
  width: 100%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 40px 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  margin-bottom: 20px;
}

.form-title {
  text-align: center;
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
}

.form-subtitle {
  text-align: center;
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 32px;
}

.input-group {
  position: relative;
  margin-bottom: 20px;
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

.input-group input.error {
  border-color: #ef4444;
}

.email-input-icon {
  position: absolute;
  left: 16px;
  top: 43px;
  color: #9ca3af;
  pointer-events: none;
}

/* 错误提示样式 */
.error-tip {
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
  min-height: 16px;
}

/* 密码输入框容器 */
.password-input-wrapper {
  position: relative;
  width: 100%;
}

.password-input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

/* 验证码区域 */
.verify-code-wrapper {
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;
}

.verify-code-input {
  flex: 1;
  padding-left: 44px;
}

/* 注册提交按钮 */
.register-submit-btn {
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
  margin: 8px 0 20px 0;
}

.register-submit-btn:hover:not(:disabled) {
  background-color: #1f2937;
}

.register-submit-btn:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.7;
}

/* 隐私协议 */
.privacy-tip {
  text-align: center;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 24px;
  line-height: 1.5;
}

.privacy-link {
  color: #4b5563;
  text-decoration: none;
  font-weight: 500;
}

.privacy-link:hover {
  text-decoration: underline;
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

/* 登录按钮 */
.login-btn {
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

.login-btn:hover {
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
  .register-form {
    padding: 32px 24px;
  }

  .form-title {
    font-size: 20px;
  }

  .verify-code-wrapper {
    gap: 12px;
  }

  .verify-code-input {
    width: 100%;
  }
}
</style>