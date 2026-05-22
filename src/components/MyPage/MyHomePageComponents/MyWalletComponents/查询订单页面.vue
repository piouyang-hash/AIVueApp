<template>
  <div class="order-detail-page">
    <!-- 顶部蓝色导航栏 -->
    <header class="header-bar">
      <!-- 左侧菜单按钮（你可以替换成自己的SvgIcon） -->
      <button class="menu-btn">☰</button>
      <h1 class="header-title">订单详情</h1>

    </header>

    <!-- 主体内容区 -->
    <main class="content">
      <!-- 订单成功状态模块 -->
      <section class="success-section">
        <div class="success-icon">✓</div>
        <h2 class="success-title">已完成</h2>
        <p class="success-desc">订单已支付并开通。</p>
        <button class="tutorial-btn">📖 查看使用教程</button>
      </section>

      <!-- 商品信息模块 -->
      <section class="info-section">
        <h3 class="section-title">商品信息</h3>
        <div class="info-row">
          <span class="info-label">产品流量：</span>
          <span class="info-value">{{ productInfo.traffic }}</span>
        </div>
      </section>

      <!-- 订单信息模块 -->
      <section class="info-section">
        <h3 class="section-title">订单信息</h3>
        <div class="info-row">
          <span class="info-label">订单号：</span>
          <span class="info-value">{{ orderInfo.orderNo }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">创建时间：</span>
          <span class="info-value">{{ orderInfo.createTime }}</span>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 示例数据，后续可以替换成接口返回的真实数据
const productInfo = ref({
  traffic: '100 GB'
})

const orderInfo = ref({
  orderNo: '2026050714055323919477922',
  createTime: '2026-05-07 14:21:53'
})
</script>

<style scoped>
/* 全局容器 */
.order-detail-page {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
}

/* 顶部蓝色导航栏 */
.header-bar {
  background-color: #007aff; /* 还原iOS风格蓝色 */
  color: white;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.menu-btn {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
}

.header-title {
  flex: 1;
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  text-align: left;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.action-btn {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
}

/* 主体内容区 */
.content {
  flex: 1;
  background-color: white;
}

/* 成功状态模块 */
.success-section {
  padding: 40px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  background-color: white;
}

.success-icon {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #34c759; /* 还原绿色对勾背景 */
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: bold;
}

.success-title {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: #1d1d1f;
}

.success-desc {
  margin: 0;
  font-size: 17px;
  color: #86868b;
  text-align: center;
}

.tutorial-btn {
  background-color: #e65c00; /* 还原橙色按钮 */
  color: white;
  border: none;
  border-radius: 24px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 8px;
  transition: background-color 0.2s ease;
}

.tutorial-btn:hover {
  background-color: #cc5200;
}

/* 信息模块通用样式 */
.info-section {
  padding: 24px;
  border-top: 1px solid #e5e7eb;
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 22px;
  font-weight: 600;
  color: #1d1d1f;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-size: 17px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  color: #86868b;
}

.info-value {
  color: #1d1d1f;
  font-weight: 500;
  text-align: right;
}
</style>