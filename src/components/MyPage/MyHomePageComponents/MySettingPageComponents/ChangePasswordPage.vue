<template>
  <MyPageLayout>
    <div class="change-password-page">
      <!-- 页面头部 -->
      <PageHeader title="修改密码" @back="handleBack"/>

      <!-- 密码表单 -->
      <div class="password-form">
        <!-- 原密码 -->
        <div class="form-card">
          <label class="form-label">原密码</label>
          <div class="password-input-wrapper">
            <input
                :type="showOldPassword ? 'text' : 'password'"
                class="form-input"
                placeholder="请输入原密码"
                v-model="oldPassword"
                @blur="validatePassword"
            />
            <Eyes v-model="showOldPassword"/>
          </div>
          <p class="error-tip" v-if="oldPasswordError">{{ oldPasswordError }}</p>
        </div>

        <!-- 新密码 -->
        <div class="form-card">
          <label class="form-label">新密码</label>
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

        <!-- 确认新密码 -->
        <div class="form-card">
          <label class="form-label">确认新密码</label>
          <div class="password-input-wrapper">
            <input
                :type="showConfirmPwd ? 'text' : 'password'"
                class="form-input error"
                placeholder="请再次输入新密码"
                v-model="confirmPassword"
                @blur="validateConfirmPassword"
            />
            <Eyes v-model="showConfirmPwd"/>
          </div>
          <p class="error-tip" v-if="confirmPasswordError">{{ confirmPasswordError }}</p>
        </div>

        <!-- 提交按钮 -->
        <div class="form-submit">
          <button class="submit-btn">提交新密码</button>
          <p class="tips-text">密码修改后请妥善保管，建议定期更换</p>
        </div>
      </div>
    </div>
  </MyPageLayout>
</template>

<script setup>
import { useRouter } from 'vue-router'
import PageHeader from "@/components/Tiny/PageHeader.vue"
import {reactive, ref} from "vue";
import Eyes from "@/components/Tiny/eyes.vue";
import MyPageLayout from "@/components/MyPage/MyPageLayout.vue";

const router = useRouter()

const handleBack = () => {
  router.push({ name: 'MySettingMain' })
}

// 响应式数据 - 原密码输入值
const oldPassword = ref('');
// 响应式数据 - 原密码错误提示
const oldPasswordError = ref('');

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

const showOldPassword = ref(false)
const showPassword = ref(false)
const showConfirmPwd = ref(false)

// 密码验证方法
const validatePassword = () => {
  // 清空之前的错误提示
  oldPasswordError.value = '';

  // 新增：有值（去除首尾空格）才执行验证
  const oldPwd = oldPassword.value.trim();
  if (!oldPwd) {
    return; // 空值直接返回，不执行后续验证
  }

  // 验证逻辑示例
  if (oldPwd.length < 6) {
    oldPasswordError.value = '原密码长度不能少于6位';
  } else {
    // 这里可以添加与后端验证原密码的逻辑
    // 例如调用API验证密码是否正确
    // 如果验证失败：oldPasswordError.value = '原密码输入错误，请重新输入';
  }
};

const validateNewPassword = () => {
  newPasswordError.value = '';

  // 新增：有值（去除首尾空格）才执行验证
  const newPwd = newPassword.value.trim();
  if (!newPwd) {
    return; // 空值直接返回，不执行后续验证
  }

  if (newPwd.length < 6) {
    newPasswordError.value = '新密码长度不能少于6位';
  } else if (newPwd === oldPassword.value.trim()) { // 这里也统一trim，避免空格干扰
    newPasswordError.value = '新密码不能与原密码相同';
  }
};

// 检测密码强度
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
  // 包含数字
  if (/[0-9]/.test(password)) score++;
  // 包含小写字母
  if (/[a-z]/.test(password)) score++;
  // 包含大写字母
  if (/[A-Z]/.test(password)) score++;
  // 包含特殊字符
  if (/[^a-zA-Z0-9]/.test(password)) score++;

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

// 验证确认新密码（空值时不执行验证）
const validateConfirmPassword = () => {
  confirmPasswordError.value = '';

  // 核心新增：判断确认密码是否为空（去除首尾空格，避免纯空格误判）
  const confirmPwd = confirmPassword.value.trim();
  if (confirmPwd === '') {
    return; // 空值直接退出，不执行后续验证
  }

  // 仅当确认密码非空时，才验证是否和新密码一致
  if (confirmPwd !== newPassword.value.trim()) {
    confirmPasswordError.value = '两次输入的密码不一致';
  }
};
</script>

<style scoped>
.password-form {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 表单项卡片 */
.form-card {
  background-color: var(--card-bg);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px var(--shadow-color);
  border: 1px solid var(--border-color);
  transition: background-color 0.2s ease;
}

.form-card:hover {
  background-color: var(--card-hover);
}

/* 标签 */
.form-label {
  display: block;
  font-size: 15px;
  color: var(--text-primary);
  margin-bottom: 12px;
  font-weight: 500;
}

/* 输入框 */
.form-input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background-color: var(--gray-50);
  color: var(--text-primary);
  font-size: 15px;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-input::placeholder {
  color: var(--text-tertiary);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color) 20%, transparent);
}

.form-input.error {
  border-color: var(--accent-color);
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
/* 密码强度样式 */
.password-strength {
  margin-top: 12px;
  font-size: 13px;
}

.strength-text {
  color: var(--text-tertiary);
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
  background-color: var(--gray-200);
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

/* 提交区域 */
.form-submit {
  max-width: 600px;
  margin: 24px auto 0;
  text-align: center;
}

.submit-btn {
  width: 100%;
  padding: 16px 0;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px color-mix(in srgb, var(--primary-color) 15%, transparent);
}

.submit-btn:hover {
  /* 主色变深：推荐使用 hsl 或相对调整，若无则用 gray-700 也可接受 */
  filter: brightness(0.9);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px color-mix(in srgb, var(--primary-color) 20%, transparent);
}

.submit-btn:active {
  transform: translateY(0);
}

.tips-text {
  margin-top: 12px;
  font-size: 12px;
  color: var(--text-tertiary);
}
</style>