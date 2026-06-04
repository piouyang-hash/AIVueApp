<template>
  <MyWalletLayout>
    <div class="order-page">
      <!-- 页面头部 -->
      <PageHeader title="我的订单" @back="handleBack" />

      <!-- 空状态：无订单时显示 -->
      <div class="empty-order" v-if="realOrderList.length === 0">
        <div class="empty-text">暂无充值订单</div>
        <div class="empty-desc">快去充值获取AI积分吧～</div>
      </div>

      <!-- 订单列表区域 -->
      <div class="order-list">
        <!-- 核心修改：v-for 循环 realOrderList -->
        <div class="order-item" v-for="(item, index) in realOrderList" :key="item.id" @click="handleOrderItemClick(item)">
          <!-- 左侧：套餐名称 + 格式化时间 -->
          <div class="order-left">
            <!-- 订单名称：使用 businessType -->
            <div class="order-title">{{ item.businessType }}</div>
            <!-- 时间格式化：ISO 转 年月日 时分秒 -->
            <div class="order-time">{{ formatOrderTime(item.createTime) }}</div>
          </div>

          <!-- 右侧：金额 + 状态 -->
          <div class="order-right">
            <!-- 金额显示：添加 ¥ 符号，保留两位小数 -->
            <div class="order-price">¥{{ formatPrice(item.amount) }}</div>
            <div class="order-status">
              <!-- 状态圆点：根据 status 映射对应的类 -->
              <span class="status-dot" :class="mapStatusToClass(item.status)"></span>
              <!-- 状态文本：直接显示 status -->
              {{ item.status }}
            </div>
          </div>

          <!-- 右侧箭头 -->
          <SvgIcon
              icon-class="goto"
              size="20px"
              className="order-arrow"
              color="var(--gray-900)"
          />
        </div>
      </div>
    </div>
  </MyWalletLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'  // 新增 onMounted 引入
import { useRouter } from 'vue-router'
import PageHeader from "@/components/Tiny/PageHeader.vue";
import MyWalletLayout from "@/components/MyPage/MyHomePageComponents/MyWalletComponents/MyWalletLayout.vue";
import {getAiRechargeOrderList} from "@/services/ai_chat.order.service.js";

const router = useRouter()

// 钱包页返回 → 我的钱包页
const handleBack = () => {
  router.push({ name: 'MyWallet' })
}

// 点击订单条目 → 跳转到查询订单页面
const handleOrderItemClick = (item) => {
  console.log("点击订单：", item);
  // 跳转到查询订单页，携带 orderNo
  router.push({
    name: 'OrderQueryPage',
    params: {
      orderNo: item.id // 订单号
    }
  })
};

// 1. 日期格式化函数：ISO 转 2026-05-20 20:39:42
const formatOrderTime = (isoTime) => {
  if (!isoTime) return ''
  const date = new Date(isoTime)
  const year = date.getFullYear()
  const month = String(date.getMonth()+1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const formatPrice = (amount) => {
  return Number(amount).toFixed(2)
}

// 3. 状态映射到样式类
const mapStatusToClass = (status) => {
  switch (status) {
    case "待付款":
      return "pending"
    case "付款成功":
      return "success"
    case "已取消":
      return "cancel"
    default:
      return ""
  }
}

// 2. 真实接口数据（新增变量，与模拟数据完全区分）
const realOrderList = ref([])  // 真实订单列表
const isLoading = ref(false)   // 加载状态（可选，提升用户体验）
const errorMsg = ref('')       // 错误信息（可选）

// 3. 定义异步请求函数
const fetchRealOrderList = async () => {
  try {
    isLoading.value = true

    // 调用业务封装接口（handleApiResponse已处理异常）
    const result = await getAiRechargeOrderList()

    // 赋值给真实数据变量
    realOrderList.value = result

    // 打印返回结果（按要求）
    console.log('接口返回完整结果：', result)
    console.log('接口返回订单列表数据：', realOrderList.value)

    errorMsg.value = ''
  } catch (error) {
    // 错误处理
    console.error('获取订单列表失败：', error)
    errorMsg.value = error.message || '获取订单列表失败，请稍后重试'
    realOrderList.value = []
  } finally {
    isLoading.value = false
  }
}

// 4. onMounted 时调用接口（核心要求）
onMounted(() => {
  console.log('组件挂载完成，开始请求真实订单数据')
  fetchRealOrderList()  // 调用接口函数
})
</script>

<style scoped>
/* 页面容器 - 适配底部导航栏 */
.order-page {
  height: 100%;
  background-color: var(--bg-color);
}

/* 空状态样式 */
.empty-order {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 20px;
  color: var(--text-tertiary);
}
.empty-text {
  font-size: 16px;
  margin-bottom: 8px;
}
.empty-desc {
  font-size: 13px;
}

.order-list {
  width: 100%;
}

/* 订单项容器 - 精简内边距，更精致 */
.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  position: relative;
}

/* 左侧内容 */
.order-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
/* 核心：标题缩小，轻量化 */
.order-title {
  font-size: 16px;
  color: var(--text-primary);
  font-weight: 500;
}
/* 时间缩小，更细腻 */
.order-time {
  font-size: 13px;
  color: var(--text-tertiary);
}

/* 右侧内容 */
.order-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  padding-right: 24px;
}
/* 核心：金额缩小，和标题统一 */
.order-price {
  font-size: 16px;
  color: var(--text-primary);
  font-weight: 500;
}
/* 状态文字缩小，轻量化 */
.order-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-secondary);
}

/* 状态圆点 */
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}
.status-dot.pending {
  background-color: var(--error-color);
}
.status-dot.cancel {
  background-color: var(--gray-400);
}
.status-dot.success {
  background-color: var(--success-color);
}

/* 右侧箭头 */
.order-arrow {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
}
</style>