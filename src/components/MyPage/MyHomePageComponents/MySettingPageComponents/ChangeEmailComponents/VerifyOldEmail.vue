<template>
  <div class="verify-old-email-wrapper">
    <!-- 1. 原邮箱展示（独立卡片，动态渲染后端返回的邮箱 + 加载提示） -->
    <div class="form-card old-email-card">
      <label class="form-label">当前邮箱</label>
      <!-- 加载状态：显示“正在加载。。。”，样式和邮箱文本一致 -->
      <div class="email-text" v-if="loading">正在加载...</div>
      <!-- 加载完成：显示后端返回的邮箱 -->
      <div class="email-text" v-else>{{ desensitizeEmail }}</div>
    </div>

    <!-- 2. 验证码区域（独立卡片） -->
    <div class="form-card verify-code-card">
      <div class="verify-code-row">
        <input
            type="text"
            class="form-input verify-input"
            placeholder="请输入验证码"
            v-model="oldEmailCode"
            @blur="checkOldEmailCodeValid"
        />
        <!-- 封装后的验证码按钮组件（直接传函数本身） -->
        <VerifyCodeButton
            :is-input-valid="isEmailValid"
            button-text="发送验证码"
            :count-down-time="60"
            :send-code-api="sendVerificationCodeForCurrentUser"
            @sendSuccess="handleSendSuccess"
            @sendFail="handleSendFail"
        />
      </div>
      <p class="error-tip" v-if="oldEmailCodeError">{{ oldEmailCodeError }}</p>
    </div>

    <!-- 3. 验证原邮箱按钮（独立卡片）- 新增状态控制 -->
    <div class="form-card verify-btn-card">
      <button
          class="verify-old-btn"
          @click="handleVerifyOldEmail"
          :disabled="!isOldEmailFormValid || isVerifying"
      >
      {{ isVerifying ? '验证中...' : '验证原邮箱' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { getUserDesensitizeEmail } from "@/services/user.action.service.js";
import VerifyCodeButton from "@/components/Tiny/VerifyCodeButton.vue";
import {sendVerificationCodeForCurrentUser, verifyEmailCode} from "@/services/vertification.service.js";

// 1. 响应式变量：加载状态（初始为true，请求完成后设为false）
const loading = ref(true);
// 2. 响应式变量：存储后端返回的脱敏邮箱
const desensitizeEmail = ref('');
// 3. 表单数据（接收父组件传递的formData，用于绑定验证码）
const props = defineProps(['formData']);
// 新增：验证中状态（控制按钮禁用+文字）
const isVerifying = ref(false);
const oldEmailCodeError = ref(''); // 验证码错误提示

// 2. 定义本地响应式变量，初始化时复制 Props 里的值
const oldEmailCode = ref(props.formData?.oldEmailCode || '');

// 4. 计算属性：判断是否可以发送验证码（核心：邮箱加载完成且有值）
const isEmailValid = computed(() => {
  // 条件：加载完成 + 脱敏邮箱有值（确保邮箱已获取成功）
  return !loading.value && !!desensitizeEmail.value;
});

// 2. 原邮箱验证码校验函数（空值不校验，仅校验非空时的格式/长度）
const checkOldEmailCodeValid = () => {
  // 核心：空值（包括纯空格）直接不校验，清空错误提示并返回true
  if (!oldEmailCode.value || !oldEmailCode.value.trim()) {
    oldEmailCodeError.value = '';
    return true;
  }

  // 非空时才校验格式
  // 校验长度为6位
  if (oldEmailCode.value.length !== 6) {
    oldEmailCodeError.value = '验证码必须是6位';
    return false;
  }
  // 校验6位纯数字
  if (!/^\d{6}$/.test(oldEmailCode.value)) {
    oldEmailCodeError.value = '验证码必须是6位数字';
    return false;
  }

  // 格式合法时清空错误提示
  oldEmailCodeError.value = '';
  return true;
};

// 3. 原邮箱表单合法性计算属性（控制按钮禁用）
const isOldEmailFormValid = computed(() => {
  // 条件：验证码非空 + 格式校验通过
  return !!oldEmailCode.value.trim() && checkOldEmailCodeValid();
});

// 5. 可选：发送验证码成功的回调
const handleSendSuccess = (res) => {
  console.log('旧邮箱验证码发送成功', res);
  // 可添加提示：比如 ElMessage.success('验证码已发送至你的旧邮箱，请查收')
};

// 6. 可选：发送验证码失败的回调
const handleSendFail = (err) => {
  console.error('旧邮箱验证码发送失败', err);
  // 可添加提示：比如 ElMessage.error('验证码发送失败：' + err.message)
};

// 7. 页面挂载时请求后端获取邮箱
onMounted(async () => {
  try {
    // 调用接口获取邮箱
    desensitizeEmail.value = await getUserDesensitizeEmail();
  } catch (err) {
    console.error('获取旧邮箱失败', err);
    // 即使获取失败，也显示错误提示（可选）
    desensitizeEmail.value = '获取邮箱失败，请刷新重试';
  } finally {
    // 无论成功/失败，都结束加载状态
    loading.value = false;
  }
});

// 1. 定义emit（只声明事件，不用传token）
const emit = defineEmits(['verifySuccess']);
// 新增：验证原邮箱点击事件处理函数（极简版）
const handleVerifyOldEmail = async () => {
  // 1. 前置校验：验证码为空/纯空格则提示（优化：加trim防止空字符串）
  if (!oldEmailCode.value.trim()) {
    console.error('请输入验证码');
    return;
  }

  // 2. 标记验证中（禁用按钮+显示“验证中...”）
  isVerifying.value = true;

  // 3. 直接调用封装好的验证函数（传本地变量的值）
  const verifyResult = await verifyEmailCode(oldEmailCode.value);

  // 4. 根据返回值处理结果
  if (verifyResult) {
    console.log('原邮箱验证成功');
    // 核心：触发父组件的verifySuccess事件，传递token
    // emit('verifySuccess', verifyResult); // verifyResult就是后端返回的token
    // （如果verifyEmailCode仍返回布尔值，需先调整接口/函数，见下方补充）
    emit('verifySuccess');
  } else {
    console.error('验证码错误、已过期或验证请求失败');
  }

  // 5. 重置验证状态（无论成功/失败，恢复按钮）
  isVerifying.value = false;
};
</script>

<style scoped>
/* 外层容器：控制卡片之间的间距 */
.verify-old-email-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px; /* 卡片之间的间距，彻底隔开 */
}

/* 复用统一的.form-card样式 */
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
  text-align: center; /* 标签居中 */
}

/* 原邮箱文本/加载提示样式（居中，样式统一） */
.email-text {
  width: 100%;
  padding: 14px 16px;
  border-radius: 10px;
  background-color: var(--gray-100);
  color: var(--text-primary);
  font-size: 15px;
  box-sizing: border-box;
  text-align: center; /* 文本/加载提示居中 */
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

/* 验证原邮箱按钮（黑底白字，通宽） */
.verify-old-btn {
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
.verify-old-btn:disabled {
  background: var(--gray-300); /* 禁用背景色 */
  color: var(--text-secondary); /* 禁用文字色 */
  cursor: not-allowed; /* 禁用光标（禁止符号） */
  /* 禁用时取消所有交互动画 */
  transform: none;
  box-shadow: none;
  opacity: 0.8; /* 可选：轻微透明，视觉上区分禁用状态 */
}

.verify-old-btn:active {
  transform: translateY(0);
}
</style>