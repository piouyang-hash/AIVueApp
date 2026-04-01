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
            <h3 class="faq-question">Q：如何登录账号？</h3>
            <p class="faq-answer">
              A：进入“我的”页面，点击“登录”按钮，输入手机号/邮箱和密码即可登录；也可选择验证码快捷登录。</p>
          </div>
          <div class="faq-item">
            <h3 class="faq-question">Q：忘记密码怎么办？</h3>
            <p class="faq-answer">A：登录页面点击“忘记密码”，通过绑定的手机号或邮箱接收验证码，重置新密码即可。</p>
          </div>
        </div>

        <!-- 书籍操作 -->
        <div class="help-section">
          <h2 class="section-title">书籍操作</h2>
          <div class="faq-item">
            <h3 class="faq-question">Q：如何上传书籍？</h3>
            <p class="faq-answer">
              A：进入“图书馆”页面，点击右上角“上传书籍”按钮，选择本地EPUB格式文件即可上传，目前仅支持EPUB格式。</p>
          </div>
          <div class="faq-item">
            <h3 class="faq-question">Q：图书馆的书籍如何分类？</h3>
            <p class="faq-answer">A：图书馆默认分为“已上传”“已收藏”“最近阅读”三类，也可手动创建自定义书架分类管理书籍。</p>
          </div>
        </div>

        <!-- 阅读相关 -->
        <div class="help-section">
          <h2 class="section-title">阅读相关</h2>
          <div class="faq-item">
            <h3 class="faq-question">Q：阅读进度会自动保存吗？</h3>
            <p class="faq-answer">
              A：会的！阅读时每翻页或停留超过10秒，系统会自动保存当前章节和页码，下次打开书籍可直接回到上次阅读位置。</p>
          </div>
          <div class="faq-item">
            <h3 class="faq-question">Q：如何调整阅读字体和背景？</h3>
            <p class="faq-answer">A：阅读页面点击屏幕中央唤起菜单，可调整字体大小、字体样式、背景颜色，支持护眼模式切换。</p>
          </div>
        </div>

        <!-- 其他问题 -->
        <div class="help-section">
          <h2 class="section-title">其他问题</h2>
          <div class="faq-item">
            <p class="faq-answer">如有其他使用问题，可通过“我的-意见反馈”提交问题，我们会尽快回复处理~</p>
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
  router.push({name: 'MyHomePageMain'}) // 或跳转到指定页面 router.push('/personal-page/my')
}
</script>

<style scoped>
.help-center-page {
  overflow-y: auto;
  /* 新增：底部预留60px空间，避开导航栏 */
  padding-bottom: 60px;
  /* 可选：防止padding撑开容器高度，加盒模型优化（通用最佳实践） */
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