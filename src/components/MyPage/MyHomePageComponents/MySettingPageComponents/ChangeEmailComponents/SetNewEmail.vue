<template>
  <div class="set-new-email-wrapper">
    <!-- 1. 新邮箱输入框（独立卡片） -->
    <div class="form-card new-email-card">
      <label class="form-label">新邮箱</label>
      <input
          type="email"
          class="form-input"
          placeholder="请输入新邮箱地址"
          v-model="newEmail"
          @blur="checkNewEmailValid"
      />
      <!-- 新增：邮箱格式错误提示 -->
      <p class="error-tip" v-if="newEmailError">{{ newEmailError }}</p>
    </div>

    <!-- 2. 验证码区域（独立卡片）- 替换为封装的验证码按钮组件 -->
    <div class="form-card verify-code-card">
      <div class="verify-code-row">
        <input
            type="text"
            class="form-input verify-input"
            placeholder="请输入验证码"
            v-model="newEmailCode"
            @input="checkNewEmailCodeValid"
        />
        <!-- 封装的验证码按钮组件 -->
        <VerifyCodeButton
            :is-input-valid="isNewEmailValid"
            button-text="发送验证码"
            :count-down-time="60"
            :send-code-api="async () => await sendVerificationCode(newEmail)"
            @sendSuccess="handleNewEmailCodeSuccess"
            @sendFail="handleNewEmailCodeFail"
        />
      </div>
      <p class="error-tip" v-if="newEmailCodeError">{{ newEmailCodeError }}</p>
    </div>

    <!-- 3. 验证修改邮箱按钮（独立卡片）- 加加载状态+点击事件 -->
    <div class="form-card verify-btn-card">
      <button
          class="verify-new-btn"
          @click="handleVerifyNewEmail"
          :disabled="!isFormValid || isSubmitting"
      >
      {{ isSubmitting ? '正在提交...' : '验证修改邮箱' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import {ref, computed} from 'vue';
import VerifyCodeButton from "@/components/Tiny/VerifyCodeButton.vue";
import {sendVerificationCode} from "@/services/vertification.service.js";
import {changeEmail} from "@/services/user.action.service.js";
// 新增：导入toastStore
import { useToastStore } from '@/stores/toastStore';

// 实例化toastStore（setup语法中调用）
const toastStore = useToastStore();
//  响应式变量：新邮箱、新邮箱验证码
const newEmail = ref('');
const newEmailCode = ref('');
const isSubmitting = ref(false); // 新增：提交中状态
const newEmailError = ref(''); // 新增：存储邮箱格式错误提示
const newEmailCodeError = ref(''); // 新增：存储验证码错误提示

//  重写邮箱校验函数（@input触发，仅验证格式，不验证空值）
const checkNewEmailValid = () => {
  // 逻辑和你给的validateEmail完全一致，仅替换变量名
  if (newEmail.value && !emailRegex.test(newEmail.value)) {
    newEmailError.value = '只能使用QQ邮箱（格式如：123456@qq.com）';
    return false;
  }
  newEmailError.value = '';
  return true;
};

// 邮箱正则（QQ邮箱）
const emailRegex = /^\d+@qq\.com$/

// 辅助计算属性：判断邮箱是否有效（用于发送验证码按钮）
const isNewEmailValid = computed(() => {
  return emailRegex.test(newEmail.value)
})

// 3. 发送新邮箱验证码成功回调
const handleNewEmailCodeSuccess = () => {
  console.log('新邮箱验证码发送成功，请查收');
};

// 4. 发送新邮箱验证码失败回调
const handleNewEmailCodeFail = (err) => {
  console.error('新邮箱验证码发送失败：', err.message);
};

// 4. 重写验证码校验函数（@input触发，逻辑和你给的完全一致）
const checkNewEmailCodeValid = () => {
  // 逻辑和validateVerifyCode完全一致，仅替换变量名
  if (newEmailCode.value) {
    // 校验长度是否为6位
    if (newEmailCode.value.length !== 6) {
      newEmailCodeError.value = '验证码必须是6位';
      return false;
    }
    // 校验是否为6位纯数字
    if (!/^\d{6}$/.test(newEmailCode.value)) {
      newEmailCodeError.value = '验证码必须是6位数字';
      return false;
    }
  }
  // 空值/校验通过时清空错误提示
  newEmailCodeError.value = '';
  return true;
};

// 核心新增：表单合法性计算属性（参考注册按钮逻辑）
const isFormValid = computed(() => {
  return !!newEmail.value.trim() &&
      !!newEmailCode.value.trim() &&
      checkNewEmailValid() &&
      checkNewEmailCodeValid();
});

// 5. 验证修改邮箱点击事件（仅打印）
const handleVerifyNewEmail = async () => {
  if (!newEmail.value.trim() || !newEmailCode.value.trim()) {
    console.log('请填写新邮箱和验证码');
    toastStore.show('请填写新邮箱和验证码', 'error'); // 可选：空值也加提示
    return;
  }

  try {
    isSubmitting.value = true;
    const isSuccess = await changeEmail(newEmail.value, newEmailCode.value);

    if (isSuccess) {
      console.log('邮箱修改提交成功');
      // 新增：成功提示（默认success类型，可省略第二个参数）
      toastStore.show('修改成功！');
      // 清空输入框
      newEmail.value = '';
      newEmailCode.value = '';
    } else {
      console.log('邮箱修改提交失败（接口返回非200）');
      // 新增：失败提示（error类型）
      toastStore.show('修改失败，请重试！', 'error');
    }
  } catch (err) {
    console.error('邮箱修改提交异常：', err);
    // 新增：异常时也显示错误提示
    toastStore.show('修改失败，网络异常！', 'error');
  } finally {
    isSubmitting.value = false;
  }
};

</script>

<style scoped>
/* 外层容器：控制三个卡片的间距，彻底隔开 */
.set-new-email-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px; /* 卡片之间的间距，和原组件逻辑一致 */
  margin-top: 16px; /* 保留和第一个组件的间距 */
}

/* 完全复用统一的.form-card样式（和你提供的一致） */
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

.form-label {
  display: block;
  font-size: 15px;
  color: var(--text-primary);
  margin-bottom: 12px;
  font-weight: 500;
}

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

.error-tip {
  color: var(--error-color); /* 使用新增的错误色 */
  font-size: 12px;
  margin: 4px 0 0 0;
  /* 可选：加一点左缩进，对齐输入框 */
  padding-left: 2px;
}

/* 验证码行（横向排列） */
.verify-code-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.verify-input {
  flex: 1; /* 输入框占满剩余宽度 */
}

/* 验证修改邮箱按钮（黑底白字，通宽） */
.verify-new-btn {
  width: 100%;
  padding: 16px 0;
  background-color: var(--gray-700); /* 黑底（墨灰） */
  color: var(--gray-50); /* 白字（银白） */
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px color-mix(in srgb, var(--gray-700) 15%, transparent);
}

/* 新增：按钮禁用状态样式 */
.verify-new-btn:disabled {
  background: var(--gray-300); /* 禁用背景色 */
  color: var(--text-secondary); /* 禁用文字色 */
  cursor: not-allowed; /* 禁用光标（禁止符号） */
  /* 禁用时取消所有交互动画 */
  transform: none;
  box-shadow: none;
  opacity: 0.8; /* 可选：轻微透明，视觉上区分禁用状态 */
}

.verify-new-btn:active {
  transform: translateY(0);
}
</style>