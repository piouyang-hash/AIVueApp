<template>
  <div class="test-container">
    <!-- 顶部导航 -->
    <header class="test-header">
      <h1>功能测试页面</h1>
      <nav>
        <router-link to="/" class="nav-link">返回首页</router-link>
        <router-link to="/personal" class="nav-link">个人中心</router-link>
      </nav>
    </header>

    <!-- 测试主体区域 -->
    <main class="test-main">
      <div class="test-panel">
        <h2>支付宝支付测试</h2>
        <p>本页面为独立测试页面，无业务逻辑，仅用于接口调试</p>

        <!-- 测试按钮 -->
        <div class="btn-box">
          <el-button type="primary" size="large" @click="testAlipay">
            点击测试支付宝支付
          </el-button>
        </div>
      </div>
    </main>

    <!-- 底部 -->
    <footer class="test-footer">
      <p>© 2026 测试专用页面 - 接口调试工具</p>
    </footer>
  </div>
</template>

<script setup>
import {ElMessage} from 'element-plus'
// 导入你之前的 无登录测试接口


// 支付宝支付测试
const testAlipay = () => {
  ElMessage.info('正在发起支付测试...');

  // 直接构造后端接口的完整 URL
  // 如果是开发环境，通常是 http://localhost:8080/alipay/pay
  // 直接跳转，浏览器会自动解析后端返回的 Form 并提交
  window.location.href = `${import.meta.env.VITE_TEST_API_BASE}/alipay/pay`;
};
</script>

<style scoped>
/* 100% 使用你全局的 CSS 变量，风格统一 */
.test-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color);
}

.test-header {
  background: var(--primary-color);
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}

.nav-link {
  color: white;
  margin-left: 1.5rem;
  text-decoration: none;
  transition: var(--transition-default);
}

.nav-link:hover {
  text-decoration: underline;
}

.test-main {
  flex: 1;
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.test-panel {
  width: 700px;
  background-color: var(--card-bg);
  padding: 2.5rem;
  border-radius: var(--radius-md);
  box-shadow: var(--control-shadow);
  border: 1px solid var(--border-color);
  text-align: center;
}

.test-panel h2 {
  color: var(--text-primary);
  margin-bottom: 1rem;
  font-size: 22px;
}

.test-panel p {
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.btn-box {
  display: flex;
  justify-content: center;
}

.test-footer {
  text-align: center;
  padding: 1rem;
  color: var(--text-tertiary);
  border-top: 1px solid var(--border-color);
}
</style>