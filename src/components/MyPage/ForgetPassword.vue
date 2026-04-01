<template>
  <MyPageLayout>
    <div class="forgot-password-page">
      <!-- 页面头部：确认是找回密码标题 -->
      <PageHeader title="找回密码" @back="handleBack"/>

      <!-- 密码表单：语义调整为找回密码 -->
      <div class="password-form">
        <!-- 邮箱（移除用户名，仅保留邮箱） -->
        <div class="form-card">
          <label class="form-label">绑定邮箱</label>
          <input
              type="text"
              class="form-input"
              placeholder="请输入账号绑定的邮箱"
              v-model="email"
              @blur="validateEmail"
          />
          <p class="error-tip" v-if="emailError">{{ emailError }}</p>
        </div>

        <!-- 新密码：语义适配找回密码 -->
        <div class="form-card">
          <label class="form-label">设置新密码</label>
          <div class="password-input-wrapper">
            <input
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                placeholder="请输入6-20位新密码"
                v-model="newPassword"
                @blur="validateNewPassword"
                @input="checkPasswordStrength"
            />
            <Eyes v-model="showPassword"/>
          </div>
          <p class="error-tip" v-if="newPasswordError">{{ newPasswordError }}</p>
          <!-- 密码强度提示（密码输入时显示） -->
          <div class="password-strength" v-if="newPassword.length >= 6">
            <span class="strength-text">密码强度：</span>
            <span :class="['strength-level', passwordStrength.level]">
            {{ passwordStrength.text }}
          </span>
            <div class="strength-bar">
              <div class="bar-item low" :class="{ active: passwordStrength.score >= 1 }"></div>
              <div class="bar-item medium" :class="{ active: passwordStrength.score >= 2 }"></div>
              <div class="bar-item high" :class="{ active: passwordStrength.score >= 3 }"></div>
            </div>
          </div>
        </div>

        <!-- 确认新密码：语义适配找回密码 -->
        <div class="form-card">
          <label class="form-label">确认新密码</label>
          <div class="password-input-wrapper">
            <input
                :type="showConfirmPwd ? 'text' : 'password'"
                class="form-input"
                placeholder="请再次输入新密码"
                v-model="confirmPassword"
                @blur="validateConfirmPassword"
            />
            <Eyes v-model="showConfirmPwd"/>
          </div>
          <p class="error-tip" v-if="confirmPasswordError">{{ confirmPasswordError }}</p>
        </div>

        <!-- 验证码区域：语义适配找回密码 -->
        <div class="form-card">
          <label class="form-label">邮箱验证码</label>
          <div class="verify-code-wrapper">
            <input
                type="text"
                v-model="verifyCode"
                :placeholder="isSendingCode ? '6位数字验证码' : '请输入验证码'"
                class="form-input code-input"
                @blur="validateVerifyCode"
            >
            <button class="send-code-btn" :disabled="!isEmailValid || isSendingCode" @click="sendVerifyCode">
              {{ isSendingCode ? `${countDown}s后重新发送` : '发送验证码' }}
            </button>
          </div>
          <p class="error-tip" v-if="verifyCodeError">{{ verifyCodeError }}</p>
        </div>

        <!-- 提交按钮：语义适配找回密码 -->
        <div class="form-submit">
          <button
              class="submit-btn"
              @click="handleResetPassword"
              :disabled="!isFormValid || isResetLoading"
          >
            {{ isResetLoading ? '重置密码中...' : '提交重置密码' }}
          </button>
          <p class="tips-text">
            密码重置后请使用新密码登录，
            <button class="login-btn" @click="goToLogin">前往登录</button>
          </p>
        </div>
      </div>
    </div>
  </MyPageLayout>
</template>

<script setup>
import { useRouter } from 'vue-router'
import PageHeader from "@/components/Tiny/PageHeader.vue"
import { computed, reactive, ref } from "vue";
import Eyes from "@/components/Tiny/eyes.vue";

import { useToastStore } from '@/stores/toastStore'
import {sendVerificationCode} from "@/services/vertification.service.js";
import {resetPasswordService} from "@/services/auth.service.js";
import MyPageLayout from "@/components/MyPage/MyPageLayout.vue";
const toastStore = useToastStore()

const router = useRouter()

const handleBack = () => {
  router.push({ name: 'LoginPage' })
}

// ========== 语义调整：身份标识改为邮箱（移除用户名相关） ==========
// 响应式数据 - 绑定邮箱
const email = ref('');
// 响应式数据 - 邮箱错误提示
const emailError = ref('');

// 响应式数据 - 新密码
const newPassword = ref('');
const newPasswordError = ref('');

// 密码强度信息
const passwordStrength = reactive({
  level: 'low',    // low/medium/high
  text: '弱',      // 弱/中/强
  score: 0         // 0-3分
});

// 响应式数据 - 确认新密码
const confirmPassword = ref('');
const confirmPasswordError = ref('');

const showPassword = ref(false)
const showConfirmPwd = ref(false)

const verifyCode = ref('')
const verifyCodeError = ref('')

const isSendingCode = ref(false)
const countDown = ref(60)

// 新增：重置密码加载状态
const isResetLoading = ref(false);

// ========== 邮箱验证逻辑（仅验证邮箱，移除用户名） ==========
const validateEmail = () => {
  // 清空之前的错误提示
  emailError.value = '';

  const val = email.value.trim();

  // 核心：仅当有有效内容时，才触发邮箱格式验证
  if (!val) return;

  // 仅保留邮箱格式验证（适配QQ邮箱，可根据实际业务调整正则）
  const emailReg = /^\d+@qq\.com$/;
  if (!emailReg.test(val)) {
    emailError.value = '请输入正确的QQ邮箱格式（例：123456@qq.com）';
    return false;
  }
  return true;
};

// ========== 新密码验证（仅保留长度≥6位，无空值验证） ==========
const validateNewPassword = () => {
  newPasswordError.value = '';

  // 仅当新密码有值时，才触发长度验证
  const newPwd = newPassword.value.trim();
  if (newPwd && newPwd.length < 6) {
    newPasswordError.value = '新密码长度不能少于6位';
    return false;
  }
  return true;
};

// ========== 检测密码强度 ==========
const checkPasswordStrength = () => {
  const password = newPassword.value;
  let score = 0;

  // 重置强度信息
  passwordStrength.score = 0;
  passwordStrength.level = 'low';
  passwordStrength.text = '弱';

  // 密码长度检查
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;

  // 字符类型检查
  if (/[0-9]/.test(password)) score++;    // 包含数字
  if (/[a-z]/.test(password)) score++;    // 包含小写字母
  if (/[A-Z]/.test(password)) score++;    // 包含大写字母
  if (/[^a-zA-Z0-9]/.test(password)) score++; // 包含特殊字符

  // 根据得分计算强度等级
  if (score < 3) {
    passwordStrength.level = 'low';
    passwordStrength.text = '弱';
    passwordStrength.score = 1;
  } else if (score < 5) {
    passwordStrength.level = 'medium';
    passwordStrength.text = '中';
    passwordStrength.score = 2;
  } else {
    passwordStrength.level = 'high';
    passwordStrength.text = '强';
    passwordStrength.score = 3;
  }
};

// ========== 验证确认新密码 ==========
const validateConfirmPassword = () => {
  confirmPasswordError.value = '';

  // 仅当确认密码有值时，验证是否和新密码一致
  if (confirmPassword.value && confirmPassword.value !== newPassword.value) {
    confirmPasswordError.value = '两次输入的新密码不一致';
    return false;
  }
  return true;
};

// ========== 辅助计算属性：判断邮箱是否有效（用于发送验证码按钮） ==========
const isEmailValid = computed(() => {
  const emailReg = /^\d+@qq\.com$/;
  return emailReg.test(email.value.trim());
})

const isFormValid = computed(() => {
  return !!email.value &&
      validateEmail() && // 加()：执行邮箱验证并取返回值
      !!newPassword.value &&
      validateNewPassword() && // 加()：执行新密码验证
      !!confirmPassword.value &&
      validateConfirmPassword() && // 加()：执行确认密码验证
      !!verifyCode.value &&
      validateVerifyCode() // 加()：执行验证码验证
});

// ========== 验证码验证（仅验证格式/长度，不验证空值） ==========
const validateVerifyCode = () => {
  if (verifyCode.value) {
    if (verifyCode.value.length !== 6) {
      verifyCodeError.value = '验证码必须是6位数字';
      return false;
    }
    if (!/^\d{6}$/.test(verifyCode.value)) {
      verifyCodeError.value = '验证码只能包含数字';
      return false;
    }
  }
  verifyCodeError.value = '';
  return true;
};

// ========== 发送验证码（修复原代码错误，适配邮箱变量） ==========
const sendVerifyCode = async () => {
  // 先验证邮箱格式
  if (!validateEmail()) return;

  isSendingCode.value = true;
  countDown.value = 60;

  try {
    // 调用发送验证码接口（传入绑定邮箱）
    await sendVerificationCode(email.value.trim());
    console.log('发送验证码到邮箱：', email.value.trim());
  } catch (error) {
    console.error('发送验证码失败：', error);
    isSendingCode.value = false; // 失败后重置发送状态
    return;
  }

  // 倒计时逻辑
  const timer = setInterval(() => {
    countDown.value--;
    if (countDown.value <= 0) {
      clearInterval(timer);
      isSendingCode.value = false;
    }
  }, 1000);
};


// 重置密码提交事件（简化版，调用封装的 service）
const handleResetPassword = async () => {
  try {
    isResetLoading.value = true; // 开启加载

    // 1. 打印表单数据（保留原有调试逻辑）
    console.log('=== 找回密码表单数据 ===');
    console.log('绑定邮箱：', email.value);
    console.log('新密码：', newPassword.value);
    console.log('确认新密码：', confirmPassword.value);
    console.log('邮箱验证码：', verifyCode.value);

    // 2. 调用封装后的 service（无需关心接口细节，只需传参）
    const result = await resetPasswordService(
        email.value,
        newPassword.value,
        verifyCode.value
    );

    // 3. 成功处理（比如提示用户+跳转登录页）
    toastStore.show('密码重置成功！', 'success');
    // router.push({ name: 'LoginPage' }); // 可选：跳转登录页

  } catch (error) {
    // 4. 失败处理（捕获 service 抛出的错误）
    toastStore.show(error.message, 'error');
    console.error('【重置密码】提交失败：', error);

  } finally {
    // 5. 无论成败，关闭加载状态
    isResetLoading.value = false;
  }
};

const goToLogin = () => {
  router.push({ name: 'LoginPage' });
}
</script>

<style scoped>
.forgot-password-page {
  padding: 0 16px;
  padding-bottom: 60px; /* 核心：预留底部空间（需≥导航栏高度，比如导航栏50px就设60-80px） */
  min-height: 100vh;    /* 页面撑满视口高度 */
  box-sizing: border-box; /* 让padding包含在min-height内，避免页面高度超出视口 */
}

.password-form {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 表单项卡片 */
.form-card {
  background-color: var(--card-bg, #fff);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px var(--shadow-color, rgba(0,0,0,0.05));
  border: 1px solid var(--border-color, #e5e7eb);
  transition: background-color 0.2s ease;
}

.form-card:hover {
  background-color: var(--card-hover, #f9fafb);
}

/* 标签 */
.form-label {
  display: block;
  font-size: 15px;
  color: var(--text-primary, #1f2937);
  margin-bottom: 12px;
  font-weight: 500;
}

/* 输入框 */
.form-input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 10px;
  background-color: var(--gray-50, #f9fafb);
  color: var(--text-primary, #1f2937);
  font-size: 15px;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-input::placeholder {
  color: var(--text-tertiary, #9ca3af);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color, #3b82f6);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color, #3b82f6) 20%, transparent);
}

.password-input-wrapper {
  position: relative;
  width: 100%;
}

/* 错误提示 */
.error-tip {
  color: var(--error-color, #e03131);
  font-size: 12px;
  margin: 4px 0 0 0;
  line-height: 1.4;
}

/* 密码强度 */
.password-strength {
  margin-top: 12px;
  font-size: 13px;
}

.strength-text {
  color: var(--text-tertiary, #9ca3af);
  margin-right: 8px;
}

.strength-level {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.strength-level.low {
  color: #e03131;
  background-color: rgba(224, 49, 49, 0.1);
}

.strength-level.medium {
  color: #f59e0b;
  background-color: rgba(245, 158, 11, 0.1);
}

.strength-level.high {
  color: #2f9e44;
  background-color: rgba(47, 158, 68, 0.1);
}

.strength-bar {
  display: flex;
  gap: 4px;
  margin-top: 8px;
  height: 6px;
  border-radius: 3px;
}

.bar-item {
  flex: 1;
  height: 100%;
  border-radius: 3px;
  background-color: var(--gray-200, #e5e7eb);
  transition: background-color 0.2s ease;
}

.bar-item.low.active {
  background-color: #e03131;
}

.bar-item.medium.active {
  background-color: #f59e0b;
}

.bar-item.high.active {
  background-color: #2f9e44;
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

/* 发送验证码按钮 */
.send-code-btn {
  padding: 14px 20px;
  background-color: transparent;
  color: var(--primary-color, #3b82f6);
  border: 2px solid var(--primary-color, #3b82f6);
  border-radius: 10px;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  font-weight: 500;
}

.send-code-btn:hover:not(:disabled) {
  background: linear-gradient(90deg, var(--primary-color, #3b82f6), var(--secondary-color, #2563eb));
  color: white;
  box-shadow: 0 2px 8px rgba(73, 80, 87, 0.2);
  transform: translateY(-1px);
}

.send-code-btn:disabled {
  background-color: var(--gray-100, #f3f4f6);
  color: var(--gray-400, #9ca3af);
  border-color: var(--gray-200, #e5e7eb);
  cursor: not-allowed;
  opacity: 0.7;
  box-shadow: none;
}

/* 提交区域 */
.form-submit {
  max-width: 600px;
  margin: 24px auto 0;
  text-align: center;
}

.submit-btn {
  width: 100%;
  padding: 16px 0;
  background-color: var(--primary-color, #3b82f6);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px color-mix(in srgb, var(--primary-color, #3b82f6) 15%, transparent);
}

.submit-btn:hover {
  filter: brightness(0.9);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px color-mix(in srgb, var(--primary-color, #3b82f6) 20%, transparent);
}

.submit-btn:active {
  transform: translateY(0);
}

/* 提交按钮禁用样式（参考register-btn） */
.submit-btn:disabled {
  background: var(--gray-300, #d1d5db);
  color: var(--text-secondary, #6b7280);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  filter: none; /* 取消hover的亮度变化 */
}

/* 新增：登录按钮样式（和文字链接风格统一） */
.tips-text {
  /* 适配按钮行内显示，可根据需要调整 */
  text-align: center;
  font-size: 14px;
  color: var(--text-tertiary);
  margin: 10px 0;
}

.login-btn {
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

/* 替换hover为active（手机端点击态） */
.login-btn:active {
  background-color: var(--primary-color);
  color: #fff;
  border-color: var(--secondary-color);
}

/* 新增：登录按钮样式（和文字链接风格统一） */
.tips-text {
  /* 适配按钮行内显示，可根据需要调整 */
  text-align: center;
  font-size: 14px;
  color: var(--text-tertiary);
  margin: 10px 0;
}

</style>