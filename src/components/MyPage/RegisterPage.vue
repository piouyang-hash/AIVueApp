<template>
  <MyPageLayout>
    <div class="register-page">
      <div class="register-card">
        <div class="card-header">
          <h2 class="register-title">用户注册</h2>
          <p class="register-subtitle">创建你的专属账号</p>
        </div>

        <div class="form-group">
          <label class="form-label">邮箱</label>
          <input
              type="email"
              v-model="email"
              placeholder="请输入你的邮箱地址"
              class="form-input"
              @blur="validateEmail"
          >
          <!-- 错误提示 -->
          <p class="error-tip" v-if="emailError">{{ emailError }}</p>
        </div>

        <!-- 密码输入框：添加眼睛组件 -->
        <div class="form-group">
          <label class="form-label">密码</label>
          <div class="password-input-wrapper">
            <input
                :type="showPassword ? 'text' : 'password'"
                v-model="password"
                placeholder="请设置6-20位密码"
                class="form-input"
                @blur="validatePassword"
            >
            <Eyes v-model="showPassword"/>
          </div>
          <p class="error-tip" v-if="passwordError">{{ passwordError }}</p>
        </div>

        <!-- 确认密码输入框：添加眼睛组件 -->
        <div class="form-group">
          <label class="form-label">确认密码</label>
          <div class="password-input-wrapper">
            <input
                :type="showConfirmPwd ? 'text' : 'password'"
                v-model="confirmPwd"
                placeholder="请再次输入密码"
                class="form-input"
                @input="validateConfirmPwd"
            >
            <Eyes v-model="showConfirmPwd"/>
          </div>
          <p class="error-tip" v-if="confirmPwdError">{{ confirmPwdError }}</p>
        </div>

        <!-- 验证码区域 -->
        <div class="form-group">
          <label class="form-label">验证码</label>
          <div class="verify-code-wrapper">
            <input
                type="text"
                v-model="verifyCode"
                :placeholder="isSendingCode ? '6位' : '6位验证码'"
                class="form-input code-input"
                @blur="validateVerifyCode"
            >
            <!-- 复用验证码按钮组件 -->
            <!-- 简化后的验证码按钮调用 -->
            <!-- 可选：自定义倒计时时长（不传则默认60） -->
            <!-- 核心：传入发送验证码的异步函数 -->
            <!-- 可选：监听发送结果 -->
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
            @click="handleRegister"
            class="register-btn"
            :disabled="!isFormValid || isRegisterLoading"
        >
          {{ isRegisterLoading ? '注册中...' : '完成注册' }}
        </button>

        <div class="login-link">
          已有账号？
          <button @click="goToLogin" class="link-text">立即登录</button>
        </div>

        <div class="privacy-tip">
          点击注册即表示同意
          <br>
          <a href="#" class="privacy-link">《用户协议》</a>和<a href="#" class="privacy-link">《隐私政策》</a>
        </div>
      </div>
    </div>
  </MyPageLayout>
</template>

<script setup>
import {computed, ref} from 'vue'
import { useRouter } from 'vue-router'
import Eyes from '@/components/Tiny/eyes.vue'
import {sendVerificationCode} from "@/services/vertification.service.js";
import {userRegister} from "@/services/auth.service.js";
import { useToastStore } from '@/stores/toastStore'
import VerifyCodeButton from "@/components/Tiny/VerifyCodeButton.vue";
import MyPageLayout from "@/components/MyPage/MyPageLayout.vue";

const toast = useToastStore()
const router = useRouter()

defineOptions({
  name: 'RegisterPage'
})

// 表单数据
const email = ref('')
const password = ref('')
const confirmPwd = ref('')
const verifyCode = ref('')
// 错误提示
const emailError = ref('')
const passwordError = ref('')
const confirmPwdError = ref('')
const verifyCodeError = ref('')
// 分别定义两个状态，独立控制密码和确认密码的显示/隐藏
const showPassword = ref(false)
const showConfirmPwd = ref(false)
// 验证码相关
const isSendingCode = ref(false)
const isRegisterLoading = ref(false)

// 1. 邮箱验证（仅验证格式，不验证空值）
const validateEmail = () => {
  if (email.value && !emailRegex.test(email.value)) {
    emailError.value = '只能使用QQ邮箱（格式如：123456@qq.com）'
    return false
  }
  emailError.value = ''
  return true
}

// 2. 密码验证（仅验证长度，不验证空值）
const validatePassword = () => {
  if (password.value) {
    if (password.value.length < 6) {
      passwordError.value = '密码长度不能少于6位'
      return false
    }
    if (password.value.length > 20) {
      passwordError.value = '密码长度不能超过20位'
      return false
    }
  }
  passwordError.value = ''
  validateConfirmPwd()
  return true
}

// 3. 确认密码验证（仅验证一致性，不验证空值）
const validateConfirmPwd = () => {
  if (confirmPwd.value && confirmPwd.value !== password.value) {
    confirmPwdError.value = '两次输入的密码不一致'
    return false
  }
  confirmPwdError.value = ''
  return true
}

// 4. 验证码验证（仅验证格式/长度，不验证空值）
const validateVerifyCode = () => {
  if (verifyCode.value) {
    if (verifyCode.value.length !== 6) {
      verifyCodeError.value = '验证码必须是6位'
      return false
    }
    if (!/^\d{6}$/.test(verifyCode.value)) {
      verifyCodeError.value = '验证码必须是6位数字'
      return false
    }
  }
  verifyCodeError.value = ''
  return true
}

// 邮箱正则（QQ邮箱）
const emailRegex = /^\d+@qq\.com$/

// 辅助计算属性：判断邮箱是否有效（用于发送验证码按钮）
const isEmailValid = computed(() => {
  return emailRegex.test(email.value)
})

// 修改表单有效性判断：删除username相关校验
const isFormValid = computed(() => {
  return (
      !!email.value?.trim() &&                     // 邮箱：非空即可
      !!password.value &&                         // 密码：非空
      password.value.length >= 6 &&                // 密码：至少6位
      !!confirmPwd.value &&                       // 确认密码：非空
      confirmPwd.value === password.value &&      // 确认密码：必须和密码一致
      !!verifyCode.value &&                       // 验证码：非空
      verifyCode.value.length === 6               // 验证码：必须正好6位
  )
})

// 可选：监听发送成功
const handleSendSuccess = (res) => {
  console.log('验证码发送成功', res);
};

// 可选：监听发送失败
const handleSendFail = (err) => {
  console.error('验证码发送失败', err);
};

// 注册处理（删除所有username相关逻辑）
const handleRegister = async () => {
  // 第一步：手动检查所有字段空值（删除username空值检查）
  let isEmpty = false
  isRegisterLoading.value = true
  if (!email.value) {
    emailError.value = '请输入QQ邮箱'
    isEmpty = true
  }
  if (!password.value) {
    passwordError.value = '请设置密码'
    isEmpty = true
  }
  if (!confirmPwd.value) {
    confirmPwdError.value = '请再次输入密码'
    isEmpty = true
  }
  if (!verifyCode.value) {
    verifyCodeError.value = '请输入验证码'
    isEmpty = true
  }
  // 有空值则直接返回
  if (isEmpty) return

  // 第二步：验证格式/长度/一致性（删除validateUsername调用）
  const isFormatValid = validateEmail() && validatePassword() && validateConfirmPwd() && validateVerifyCode()
  if (!isFormatValid) return

  // 第三步：所有验证通过，执行注册逻辑（删除username参数）
  try {
    // 调用注册接口：移除username参数
    await userRegister({
      email: email.value,
      password: password.value,
      code: verifyCode.value
    });

    // 注册成功逻辑
    console.log('注册成功！');
    toast.show('注册成功', 'success')
    await router.push({ name: 'LoginPage' });

  } catch (error) {
    // 错误处理（保留原有逻辑）
    if (error.response?.data?.message.includes('验证码')) {
      verifyCodeError.value = '验证码错误或已过期'
    } else {
      toast.show('注册失败，请稍后重试', 'error')
      console.error('注册失败：', error)
    }
  } finally {
    isRegisterLoading.value = false
  }
};

// 跳转到登录页
const goToLogin = () => {
  router.push({ name: 'LoginPage' });
}
</script>

<style scoped>
/* 页面背景 */
.register-page {
  min-height: calc(100vh - 60px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, var(--bg-color), var(--gray-100));
  transition: background-color 0.3s ease;
}

/* 卡片容器 */
.register-card {
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

/* 卡片头部装饰 */
.register-card::before {
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

.register-title {
  color: var(--text-primary);
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
}

.register-subtitle {
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

.error-tip {
  color: var(--error-color); /* 使用新增的错误色 */
  font-size: 12px;
  margin: 4px 0 0 0;
  /* 可选：加一点左缩进，对齐输入框 */
  padding-left: 2px;
}

/* 密码输入容器 */
.password-input-wrapper {
  position: relative;
  width: 100%;
}

/* 验证码容器 */
.verify-code-wrapper {
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;
}

.code-input {
  flex: 1;
}

/* 输入框样式 */
.form-input {
  width: 100%;
  padding: 14px 16px;
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

/* 注册按钮 */
.register-btn {
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

.register-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.2);
}

.register-btn:disabled {
  background: var(--gray-300);
  color: var(--text-secondary);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 登录链接 */
.login-link {
  text-align: center;
  font-size: 14px;
  color: var(--text-tertiary);
  margin-bottom: 15px;
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

/* 隐私提示 */
.privacy-tip {
  text-align: center;
  font-size: 12px;
  color: var(--text-tertiary);
}

.privacy-link {
  color: var(--text-secondary);
  text-decoration: none;
}

.privacy-link:hover {
  text-decoration: underline;
}

/* 深色模式适配 */
:global(.dark) .form-input {
  background-color: var(--gray-800);
}

:global(.dark) .send-code-btn {
  background-color: rgba(var(--primary-rgb), 0.1);
}

:global(.dark) .send-code-btn:hover:not(:disabled) {
  background-color: var(--primary-color);
}
</style>