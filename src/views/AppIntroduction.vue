<template>
  <div class="app-introduction">
    <!-- 页面头部导航 -->
    <header class="header">
      <h1>应用介绍（AppIntroduction）</h1>
      <nav>
        <!-- 路由导航链接 -->
        <router-link to="/" class="nav-link">首页</router-link>
        <router-link to="/personal" class="nav-link">个人中心</router-link>
      </nav>
    </header>

    <!-- 页面主体内容 -->
    <main class="main-content">
      <div class="intro-card">
        <h2>欢迎使用本应用</h2>
        <p>这是应用的介绍主页，你可以在这里展示应用的核心功能、使用说明等内容。</p>
        <el-button type="primary" @click="goToPersonal">前往个人中心</el-button>
      </div>
    </main>

    <!-- 页面底部 -->
    <footer class="footer">
      <p>© 2026 应用介绍页面 - 静态演示</p>
    </footer>
  </div>
</template>

<script setup>
// 引入路由跳转方法
import { useRouter } from 'vue-router'

const router = useRouter()

// 按钮跳转个人中心的方法
const goToPersonal = () => {
  router.push('/personal')
}
</script>

<style scoped>
/* 简单的页面样式，保证美观 */
.app-introduction {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: #409eff;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-link {
  color: white;
  margin-left: 1.5rem;
  text-decoration: none;
}

.nav-link:hover {
  text-decoration: underline;
}

.main-content {
  flex: 1;
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.intro-card {
  width: 600px;
  text-align: center;
  padding: 2rem;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.intro-card h2 {
  color: #303133;
  margin-bottom: 1rem;
}

.intro-card p {
  color: #606266;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.footer {
  text-align: center;
  padding: 1rem;
  color: #909399;
  border-top: 1px solid #e4e7ed;
}
</style>