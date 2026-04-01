<!--这个暂时有一个bug，就是发送后倒计时，就是普通的发送后倒计时，并不是后端收到，才开始倒计时-->
<!--暂时不想修，不是什么大问题-->

<template>
  <button
      class="send-code-btn"
      :disabled="!isInputValid || isProcessing || isSendingCode"
      @click="handleSendClick"
  >
    <!-- 状态优先级：处理中 → 倒计时 → 原始文字 -->
    <template v-if="isProcessing">
      正在处理
    </template>
    <template v-else-if="isSendingCode">
      {{ countDown }}s后重新发送
    </template>
    <template v-else>
      {{ buttonText }}
    </template>
  </button>
</template>

<script setup>
import { onUnmounted, ref, defineProps, defineEmits } from 'vue';

// 1. 调整Props：重命名+新增发送函数+非必填倒计时
const props = defineProps({
  // 输入框（邮箱/手机号）是否合法（重命名：is-email-valid → is-input-valid）
  isInputValid: {
    type: Boolean,
    required: true,
    default: false
  },
  // 按钮默认文字
  buttonText: {
    type: String,
    default: '发送验证码'
  },
  // 倒计时时长（非必填，默认60）
  countDownTime: {
    type: Number,
    default: 60
  },
  // 核心：传入的发送验证码异步函数（必填）
  sendCodeApi: {
    type: Function,
    required: true,
    validator: (fn) => typeof fn === 'function' // 校验必须是函数
  }
});

// 2. 组件内部管理请求状态（不再需要父组件传is-requesting）
const isProcessing = ref(false); // 接口请求中（原is-requesting）
const isSendingCode = ref(false); // 倒计时中
const countDown = ref(0);
let timer = null;
const emit = defineEmits(['sendSuccess', 'sendFail']); // 可选：向外暴露结果事件

// 3. 点击按钮：内部自动执行发送函数，处理全流程
const handleSendClick = async () => {
  // 前置校验：输入不合法直接返回
  if (!props.isInputValid) return;

  // 防重复点击：处理中则返回
  if (isProcessing.value) return;

  try {
    isProcessing.value = true; // 标记“正在处理”
    // 执行父组件传入的发送验证码函数
    const res = await props.sendCodeApi();

    // 简化成功判定：仅判断返回值是否为 true
    const isSuccess = res === true;
    if (isSuccess) {
      emit('sendSuccess', res); // 可选：通知父组件发送成功
      startCountDown(); // 自动开始倒计时
    } else {
      // 非 true 均视为失败，抛出明确错误
      throw new Error('验证码发送失败：接口未返回 true');
    }
  } catch (err) {
    emit('sendFail', err); // 可选：通知父组件发送失败
    console.error('验证码发送失败：', err.message);
    resetButton(); // 失败后重置按钮状态
  } finally {
    isProcessing.value = false; // 无论成败，结束处理状态
  }
};

// 4. 开始倒计时逻辑（内部调用）
const startCountDown = () => {
  isSendingCode.value = true;
  countDown.value = props.countDownTime;

  timer = setInterval(() => {
    countDown.value--;
    if (countDown.value <= 0) {
      clearInterval(timer);
      isSendingCode.value = false;
    }
  }, 1000);
};

// 5. 重置按钮状态（内部/外部均可调用）
const resetButton = () => {
  isProcessing.value = false;
  isSendingCode.value = false;
  countDown.value = 0;
  if (timer) clearInterval(timer);
};

// 6. 暴露方法（供父组件紧急重置用，非必需）
defineExpose({ startCountDown, resetButton });

// 7. 组件卸载时清理定时器
onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped>
/* 发送验证码按钮样式（适配灰度体系 + 黑底白字/白底黑字） */
.send-code-btn {
  padding: 14px 20px;
  /* 启用态默认：深墨黑底（接近纯黑但更柔和）+ 白字 */
  background-color: var(--gray-800);
  color: var(--gray-50); /* 银白文字 */
  border: 2px solid var(--gray-700); /* 墨灰边框，和黑底呼应 */
  border-radius: 10px;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  font-weight: 500; /* 加粗文字增强对比 */
}

/* 启用态hover：黑底渐变 + 轻微上浮+阴影，提升交互感 */
.send-code-btn:hover:not(:disabled) {
  /* 深墨灰→暗灰渐变，保持黑底质感且不突兀 */
  background: linear-gradient(90deg, var(--gray-900), var(--gray-700));
  color: var(--gray-50); /* 保持白字 */
  border-color: var(--gray-800); /* 边框随渐变加深 */
  box-shadow: 0 2px 8px var(--shadow-color); /* 灰度阴影更自然 */
  transform: translateY(-1px); /* 轻微上浮 */
}

/* 禁用态：白底 + 黑字（深墨灰）+ 浅灰边框 */
.send-code-btn:disabled {
  background-color: var(--gray-50); /* 银白背景（纯白替代） */
  color: var(--gray-800); /* 深墨灰文字（黑字替代，更柔和） */
  border-color: var(--gray-200); /* 浅灰边框，区分禁用状态 */
  cursor: not-allowed;
  opacity: 0.8; /* 略降不透明度，弱化禁用态但不影响文字可读性 */
  box-shadow: none;
  transform: none; /* 禁用hover上浮效果 */
}
</style>