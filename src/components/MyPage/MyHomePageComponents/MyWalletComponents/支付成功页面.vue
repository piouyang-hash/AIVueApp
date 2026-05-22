<template>
  <div class="success-page-wrapper">
    <!-- 顶部导航 -->
    <!-- 🔥 高级质感头部（三段式对称布局） -->
    <div class="page-header">
      <!-- 左侧：返回按钮 -->
      <div class="page-header__side left">
        <button class="back-btn" @click="handleGoBack">
          <span class="back-icon">←</span>
          <span class="back-text">返回</span>
        </button>
      </div>
      <!-- 中间：居中标题（核心视觉） -->
      <div class="page-header__main">
        <h1 class="page-header__title">支付结果</h1>
      </div>
      <!-- 右侧：占位保持对称（高级布局必备） -->
      <div class="page-header__side right"></div>
    </div>

    <!-- 成功主体区域 -->
    <div class="success-container">
      <!-- 成功图标 -->
      <div class="success-icon">✓</div>
      <h2 class="success-text">支付成功</h2>
      <p class="success-desc">已成功充值AI积分</p>

      <!-- 订单信息卡片 -->
      <div class="info-card">
        <div class="info-row">
          <span class="label">订单号</span>
          <span class="value">{{ orderId }}</span>
        </div>
        <div class="info-row">
          <span class="label">支付金额</span>
          <span class="value amount-text">¥{{ amount }}</span>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="btn-group">
        <button class="btn btn-outline" @click="goHome">返回首页</button>
        <button class="btn btn-primary" @click="goOrderDetail">查看订单</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

// 接收路由参数
const orderId = route.params.orderId || '';
const amount = route.params.amount || '0.00';

// 返回上一页
const handleGoBack = () => {
  router.back();
};

// 返回首页
const goHome = () => {
  router.push({ name: 'HomePage' });
};

// 跳转到订单详情
const goOrderDetail = () => {
  router.push({
    name: 'OrderPage',
    params: { orderId }
  });
};
</script>

<style scoped>
/* ===================== 高级页面头部 ===================== */
.page-header {
  display: flex;
  align-items: center;
  /* 统一规范：固定高度 + 内边距 */
  height: 4.5rem;
  padding: 0 1.2rem;
  box-sizing: border-box;

  /* 沿用你的设计系统 */
  background-color: var(--bg-color);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  user-select: none;
  position: sticky;
  top: 0;
  z-index: 999;
}

/* 左右两侧布局（对称核心） */
.page-header__side {
  flex: 1;
  display: flex;
  align-items: center;
}
.page-header__side.left {
  justify-content: flex-start;
}
.page-header__side.right {
  justify-content: flex-end;
}

/* 中间标题（绝对居中） */
.page-header__main {
  flex: 0 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 标题样式 */
.page-header__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  white-space: nowrap;
  letter-spacing: 0.5px; /* 微调字距，提升高级感 */
}

/* 返回按钮（精致化，非简陋文字） */
.back-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: transparent;
  border: none;
  outline: none;
  cursor: pointer;
  padding: 0.4rem 0.6rem;
  border-radius: var(--radius-sm);
  transition: var(--transition-default);
}
.back-btn:hover {
  background-color: var(--btn-hover-bg);
}
.back-icon {
  font-size: 1.1rem;
  color: var(--text-primary);
}
.back-text {
  font-size: 0.95rem;
  color: var(--text-primary);
  font-weight: 500;
}

.success-container {
  padding: 40px 20px;
  text-align: center;
}
.success-icon {
  width: 80px;
  height: 80px;
  line-height: 80px;
  border-radius: 50%;
  background: var(--success-color);
  color: #fff;
  font-size: 40px;
  margin: 0 auto 20px;
}
.success-text {
  font-size: 24px;
  color: var(--text-primary);
  margin: 0 0 8px;
}
.success-desc {
  color: var(--text-secondary);
  margin-bottom: 30px;
}

.info-card {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  padding: 20px;
  margin-bottom: 40px;
  border: 1px solid var(--border-color);
}
.info-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  font-size: 15px;
}
.label {
  color: var(--text-secondary);
}
.value {
  color: var(--text-primary);
}
.amount-text {
  color: var(--success-color);
  font-weight: 600;
}

.btn-group {
  display: flex;
  gap: 16px;
  justify-content: center;
}
.btn {
  width: 140px;
  height: 44px;
  border-radius: var(--radius-md);
  font-size: 16px;
}
.btn-outline {
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-primary);
}
.btn-primary {
  background: var(--success-color);
  color: #fff;
  border: none;
}
</style>