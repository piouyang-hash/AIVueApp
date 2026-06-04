<template>
  <div class="detail-page">
    <!-- 头部导航：左返回 + 右标题 -->
    <header class="detail-header">
      <div class="back-btn" @click="handleBack">
        <SvgIcon
            icon-class="back-arrow"
            size="1.1rem"
            className="back-icon"
            color="var(--text-primary)"
        />
        <span class="back-text">返回</span>
      </div>
      <h1 class="page-title">商品详情</h1>
    </header>

    <!-- 商品详情主体 -->
    <main class="detail-container">
      <!-- 商品大图 -->
      <div class="goods-img-box">
        <img :src="goodsInfo.image" alt="商品详情图" class="detail-img" />
      </div>

      <!-- 商品信息 -->
      <div class="goods-info">
        <h2 class="goods-name">{{ goodsInfo.name }}</h2>
        <p class="goods-price">¥{{ goodsInfo.price.toFixed(2) }}</p>
        <div class="goods-desc">
          <h3>商品介绍</h3>
          <p>{{ goodsInfo.desc }}</p>
        </div>
      </div>

      <!-- 购买按钮 -->
      <div class="buy-box">
        <button class="buy-btn" @click="handleBuy">立即购买</button>
      </div>
    </main>
  </div>
</template>

<script setup>
// 模拟商品详情数据（实际项目中通过路由/父组件传递）
const goodsInfo = {
  id: 1,
  name: '高级简约T恤',
  price: 99.9,
  image: 'https://picsum.photos/400/500?random=1',
  desc: '精选优质面料，柔软亲肤，简约百搭设计，适合日常休闲穿着，透气不闷汗，四季可穿。'
}

// 返回按钮点击事件
const handleBack = () => {
  console.log('点击返回，返回商品列表页')
}

// 立即购买点击事件
const handleBuy = () => {
  console.log('点击购买，商品信息：', goodsInfo)
}
</script>

<style>
/* 详情页整体 */
.detail-page {
  min-height: 100vh;
}

/* 头部样式 */
.detail-header {
  background-color: var(--control-bg);
  box-shadow: var(--control-shadow);
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
}

/* 返回按钮 */
.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: var(--transition-default);
}
.back-btn:hover {
  opacity: 0.8;
}
.back-text {
  color: var(--text-primary);
  font-size: 16px;
}

/* 页面标题 */
.page-title {
  color: var(--text-primary);
  font-size: 22px;
  font-weight: bold;
}

/* 详情容器 */
.detail-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 24px 16px;
}

/* 商品图片容器 */
.goods-img-box {
  width: 100%;
  background-color: var(--card-bg);
  border-radius: var(--radius-md);
  padding: 8px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  margin-bottom: 24px;
}
.detail-img {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: var(--radius-sm);
}

/* 商品信息 */
.goods-info {
  margin-bottom: 32px;
}
.goods-info h2 {
  color: var(--text-primary);
  font-size: 24px;
  margin-bottom: 12px;
}
.goods-price {
  color: var(--primary-color);
  font-size: 26px;
  font-weight: bold;
  margin-bottom: 20px;
}
.goods-desc h3 {
  color: var(--text-secondary);
  font-size: 18px;
  margin-bottom: 8px;
}
.goods-desc p {
  color: var(--text-tertiary);
  line-height: 1.6;
  font-size: 15px;
}

/* 购买按钮容器 */
.buy-box {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--control-bg);
  box-shadow: var(--control-shadow);
  padding: 16px 24px;
  display: flex;
  justify-content: center;
}

/* 购买按钮 */
.buy-btn {
  width: 100%;
  max-width: 500px;
  height: 48px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: var(--transition-default);
  box-shadow: var(--shadow-sm);
}
.buy-btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}
.buy-btn:active {
  transform: translateY(0);
}
</style>