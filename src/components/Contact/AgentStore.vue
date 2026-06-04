<template>
  <!-- 页面整体容器 -->
  <div class="mall-page">
    <!-- 🔥 修改后的头部导航 -->
    <header class="mall-header">
      <!-- 左侧：返回按钮（图标+文字） -->
      <div class="back-btn" @click="handleBack">
        <SvgIcon
            icon-class="back-arrow"
            size="1.1rem"
            className="back-icon"
            color="var(--text-primary)"
        />
        <span class="back-text">返回</span>
      </div>

      <!-- 右侧：商城标题 -->
      <h1 class="logo">极简商城</h1>
    </header>

    <!-- 商品列表主体（不变） -->
    <main class="goods-container">
      <div
          class="goods-card"
          v-for="item in goodsList"
          :key="item.id"
          @click="handleGoodsClick(item)"
      >
        <img :src="item.image" alt="商品图片" class="goods-img" />
        <h3 class="goods-name">{{ item.name }}</h3>
        <p class="goods-price">¥{{ item.price.toFixed(2) }}</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
// 商品数据（不变）
const goodsList = [
  { id: 1, name: '高级简约T恤', price: 99.9, image: 'https://picsum.photos/300/200?random=1' },
  { id: 2, name: '休闲百搭长裤', price: 129.9, image: 'https://picsum.photos/300/200?random=2' },
  { id: 3, name: '透气运动鞋', price: 299.9, image: 'https://picsum.photos/300/200?random=3' },
  { id: 4, name: '时尚双肩包', price: 159.9, image: 'https://picsum.photos/300/200?random=4' },
  { id: 5, name: '简约手表', price: 399.9, image: 'https://picsum.photos/300/200?random=5' },
  { id: 6, name: '防晒遮阳帽', price: 49.9, image: 'https://picsum.photos/300/200?random=6' },
]

// 点击商品事件（不变）
const handleGoodsClick = (item) => {
  console.log('你点击了商品：', item)
}

// 🔥 返回按钮点击事件：回退到上一页
const handleBack = () => {
  console.log('点击了返回按钮，正在返回上一页')
  // 核心：路由回退（等价于浏览器后退按钮）
  router.push({ name: 'ContactPage' })
}
</script>

<style>
/* 页面整体（不变） */
.mall-page {
  min-height: 100vh;
}

/* 🔥 修改后的头部样式 */
.mall-header {
  background-color: var(--control-bg);
  box-shadow: var(--control-shadow);
  padding: 16px 24px;
  display: flex;
  justify-content: space-between; /* 左右分开布局 */
  align-items: center;
  position: sticky;
}

/* 返回按钮容器 */
.back-btn {
  display: flex;
  align-items: center;
  gap: 6px; /* 图标和文字间距 */
  cursor: pointer;
  transition: var(--transition-default);
}

/* 返回文字样式 */
.back-text {
  color: var(--text-primary);
  font-size: 16px;
}

/* 右侧logo样式（不变） */
.logo {
  color: var(--text-primary);
  font-size: 22px;
  font-weight: bold;
}

/* 商品列表容器（不变） */
.goods-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: center;
}

/* 商品卡片（不变） */
.goods-card {
  width: 280px;
  background-color: var(--card-bg);
  border-radius: var(--radius-md);
  padding: 16px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  transition: var(--transition-default);
  cursor: pointer;
}

/* 商品图片（不变） */
.goods-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  margin-bottom: 12px;
}

/* 商品名称（不变） */
.goods-name {
  color: var(--text-primary);
  font-size: 16px;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 商品价格（不变） */
.goods-price {
  color: var(--primary-color);
  font-size: 18px;
  font-weight: bold;
}
</style>