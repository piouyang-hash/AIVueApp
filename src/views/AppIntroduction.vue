<template>
  <div class="app-container">
    <!-- 顶部导航栏 -->
    <header class="app-header">
      <div class="header-logo">应用中心</div>
      <nav class="header-nav">
        <router-link to="/" class="nav-item active">首页</router-link>
        <router-link to="/test" class="nav-item">功能测试</router-link>
        <router-link to="/personal" class="nav-item">个人中心</router-link>
      </nav>
    </header>

    <!-- 主体内容区（仅保留测试模块） -->
    <main class="app-main">
      <!-- 测试功能模块 -->
      <section class="test-section">
        <div class="section-header">
          <h2 class="section-title">功能测试区</h2>
          <p class="section-desc">页面交互、路由跳转、接口调用测试</p>
        </div>
        <div class="test-card">
          <div class="test-desc">
            点击下方按钮跳转到独立测试页面，进行支付宝支付等接口调试
          </div>
          <div class="test-btn-group">
            <!-- 修改为跳转到测试页面 -->
            <el-button type="primary" @click="goToTestPage">
              前往功能测试页面
            </el-button>
            <el-button @click="handleTest">
              测试：交互按钮
            </el-button>
          </div>
        </div>
      </section>
    </main>

    <!-- 底部页脚 -->
    <footer class="app-footer">
      <p>© 2026 Application Center - All Rights Reserved</p>
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 跳转 独立测试页面
const goToTestPage = () => {
  router.push('/test')
}

// 测试按钮交互
const handleTest = () => {
  ElMessage.success('测试按钮触发成功！')
}
</script>

<style scoped>
/* 全局容器 - 严格使用你的CSS变量 */
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color);
  transition: var(--transition-default);
}

/* 顶部导航 */
.app-header {
  background-color: var(--control-bg);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--control-shadow);
  padding: 0 2rem;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 99;
}

.header-logo {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.header-nav {
  display: flex;
  gap: 1rem;
}

.nav-item {
  padding: 6px 12px;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  text-decoration: none;
  transition: var(--transition-default);
}

.nav-item.active {
  background-color: var(--primary-color);
  color: #fff;
}

.nav-item:hover:not(.active) {
  background-color: var(--btn-hover-bg);
  color: var(--text-primary);
}

/* 主体内容 */
.app-main {
  flex: 1;
  padding: 2rem 1rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

/* 公共模块头部 */
.section-header {
  text-align: center;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 24px;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  font-weight: 600;
}

.section-desc {
  font-size: 14px;
  color: var(--text-tertiary);
  margin: 0;
}

/* 测试功能模块 */
.test-card {
  background-color: var(--card-bg);
  border-radius: var(--radius-md);
  padding: 2.5rem;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  text-align: center;
}

.test-desc {
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.test-btn-group {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* 底部页脚 */
.app-footer {
  text-align: center;
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
  color: var(--text-tertiary);
  font-size: 14px;
}
</style>