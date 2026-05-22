<template>
    <div class="feedback-page">
      <!-- 页面标题 -->
      <PageHeader title="意见反馈" @back="handleBack"/>

      <!-- 反馈表单 -->
      <div class="feedback-form">
        <!-- 问题类型选择 -->
        <div class="form-card">
          <label class="form-label">问题类型（必填）</label>
          <!-- 动态渲染select，绑定feedbackType -->
          <select class="form-select" v-model="feedbackForm.feedbackType">
            <option value="">请选择问题类型</option>
            <option
                v-for="item in FEEDBACK_TYPE_OPTIONS"
                :key="item.value"
                :value="item.value"
            >
              {{ item.label }}
            </option>
          </select>
        </div>

        <!-- 反馈内容：绑定content + 字数统计 -->
        <div class="form-card">
          <label class="form-label">反馈内容（必填）</label>
          <textarea
              class="form-textarea"
              placeholder="请详细描述您遇到的问题或建议..."
              rows="6"
              maxlength="200"
              v-model="feedbackForm.content"
              @input="updateFeedbackWordCount"
          ></textarea>
          <!-- 新增：字数统计显示（复用word-count样式，不用改CSS） -->
          <span class="word-count">{{ feedbackWordCount }}/200</span>
        </div>

        <!-- 联系方式：绑定contact -->
        <div class="form-card">
          <label class="form-label">联系方式（选填）</label>
          <input
              class="form-input"
              type="text"
              placeholder="手机号/邮箱，方便我们回复您"
              v-model="feedbackForm.contact"
          />
        </div>

        <!-- 提交按钮：加禁用判断 + 绑定点击事件 -->
        <div class="form-submit">
          <button
              class="submit-btn"
              @click="handleSubmit"
              :disabled="isSubmitDisabled"
          >
            提交反馈
          </button>
        </div>
      </div>
    </div>
</template>

<script setup>
import PageHeader from "@/components/Tiny/PageHeader.vue"
import {useRouter} from 'vue-router'
import {FEEDBACK_TYPE_OPTIONS} from '@/constants/feedback'
import {computed, ref} from 'vue'
import {submitFeedbackWithHandle} from "@/services/user.action.service.js";
import MyPageLayout from "@/components/MyPage/MyPageLayout.vue";

const router = useRouter()

// 完善表单数据：包含所有字段的响应式对象
const feedbackForm = ref({
  feedbackType: '', // 问题类型value（如add_book/function）
  content: '',      // 反馈内容
  contact: ''       // 联系方式（选填）
})

const handleBack = () => {
  router.push({name: 'MyHomePageMain'})
}
const feedbackWordCount = ref(0) // 反馈内容字数（新增）

// ===== 新增：更新反馈内容字数 =====
const updateFeedbackWordCount = () => {
  // 逻辑：有内容取长度，无内容设为0
  feedbackWordCount.value = feedbackForm.value.content ? feedbackForm.value.content.length : 0
}

// 新增：计算属性 - 判断提交按钮是否禁用（问题类型为空 或 反馈内容为空）
const isSubmitDisabled = computed(() => {
  // 问题类型未选择 或 反馈内容为空（去除首尾空格后）
  return !feedbackForm.value.feedbackType || !feedbackForm.value.content.trim()
})

// 核心：提交方法（先打印，不调用接口）
const handleSubmit = async () => {
  // 1. 必填项校验
  if (!feedbackForm.value.feedbackType) {
    alert('请选择问题类型！')
    return // 校验不通过，终止提交
  }
  if (!feedbackForm.value.content.trim()) { // 去除首尾空格后判断
    alert('反馈内容不能为空！')
    return
  }
  // 2. 调用二次封装接口
  await submitFeedbackWithHandle(feedbackForm.value);
}
</script>

<style scoped>
.feedback-page {
  padding: 15px;
}

.feedback-form {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 统一表单卡片 */
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

/* 通用输入控件 */
.form-select,
.form-input,
.form-textarea {
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

.form-select::placeholder,
.form-input::placeholder,
.form-textarea::placeholder {
  color: var(--text-tertiary);
}

/* 聚焦状态 */
.form-select:focus,
.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color) 20%, transparent);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

/* 提交区域 */
.form-submit {
  margin-top: 8px;
  text-align: center;
}

.word-count {
  display: block;
  text-align: right;
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 6px;
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
  filter: brightness(0.9);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px color-mix(in srgb, var(--primary-color) 20%, transparent);
}

.submit-btn:disabled {
  background: var(--gray-300);
  color: var(--text-secondary);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.submit-btn:active {
  transform: translateY(0);
}
</style>