<template>
  <MyPageLayout>
    <div class="help-center-page">
      <!-- 页面标题 -->
      <PageHeader title="帮助中心" @back="handleBack"/>

      <!-- 帮助内容容器 -->
      <div class="help-content">
        <!-- 账户相关 -->
        <div class="help-section">
          <h2 class="section-title">账户相关</h2>
          <div class="faq-item">
            <h3 class="faq-question">Q：如何登录/注册账号？</h3>
            <p class="faq-answer">
              A：进入「我的」页面，点击登录/注册按钮，支持手机号验证码快捷登录，无需密码即可快速使用。</p>
          </div>
          <div class="faq-item">
            <h3 class="faq-question">Q：如何退出登录？</h3>
            <p class="faq-answer">A：进入「我的」页面，滑动至底部，点击退出登录按钮，即可安全退出当前账号。</p>
          </div>
        </div>

        <!-- AI对话使用 -->
        <div class="help-section">
          <h2 class="section-title">AI对话使用</h2>
          <div class="faq-item">
            <h3 class="faq-question">Q：如何发起AI对话？</h3>
            <p class="faq-answer">A：进入聊天页面，在底部输入框输入你的问题，点击发送按钮，AI会立即为你解答。</p>
          </div>
          <div class="faq-item">
            <h3 class="faq-question">Q：如何复制AI回复内容？</h3>
            <p class="faq-answer">A：长按AI消息气泡，在弹出的菜单中选择「复制」，即可快速复制回复内容。</p>
          </div>
        </div>

        <!-- 会话管理 -->
        <div class="help-section">
          <h2 class="section-title">会话管理</h2>
          <div class="faq-item">
            <h3 class="faq-question">Q：如何创建新会话？</h3>
            <p class="faq-answer">A：在聊天列表页面，点击右上角新建按钮，即可创建全新的AI对话会话。</p>
          </div>
          <div class="faq-item">
            <h3 class="faq-question">Q：如何删除会话？</h3>
            <p class="faq-answer">A：左滑会话条目，点击删除按钮，确认后即可删除该会话及所有对话记录。</p>
          </div>
        </div>

        <!-- 角色功能 -->
        <div class="help-section">
          <h2 class="section-title">角色功能</h2>
          <div class="faq-item">
            <h3 class="faq-question">Q：如何切换AI角色？</h3>
            <p class="faq-answer">A：在聊天列表选择对应角色会话，或新建会话时选择想要的AI角色即可切换。</p>
          </div>
          <div class="faq-item">
            <h3 class="faq-question">Q：角色支持自定义吗？</h3>
            <p class="faq-answer">A：目前支持使用预设AI角色，后续会逐步开放自定义角色功能。</p>
          </div>
        </div>

        <!-- 其他问题 -->
        <div class="help-section">
          <h2 class="section-title">其他问题</h2>
          <div class="faq-item">
            <p class="faq-answer">如有其他使用问题，可通过「我的-意见反馈」提交问题，我们会尽快为你处理~</p>
          </div>
        </div>
      </div>
    </div>
  </MyPageLayout>
</template>

<script setup>
import PageHeader from "@/components/Tiny/PageHeader.vue";

import {useRouter} from 'vue-router'
import MyPageLayout from "@/components/MyPage/MyPageLayout.vue";

const router = useRouter()

// 返回上一页
const handleBack = () => {
  router.push({name: 'MyHomePageMain'})
}
</script>

<style scoped>
.help-center-page {
  overflow-y: auto;
  padding-bottom: 60px;
  box-sizing: border-box;
}

.help-content {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.help-section {
  background-color: var(--card-bg);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 5px var(--shadow-color);
}

.section-title {
  font-size: 16px;
  color: var(--text-primary);
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

.faq-item {
  margin-bottom: 12px;
}

.faq-question {
  font-size: 14px;
  color: var(--text-primary);
  margin-bottom: 5px;
  font-weight: 500;
}

.faq-answer {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
}
</style>