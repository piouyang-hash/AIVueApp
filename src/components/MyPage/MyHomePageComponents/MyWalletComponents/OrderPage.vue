<template>
  <!-- 页面外层容器 -->
  <MyWalletLayout>
    <div class="order-page-wrapper">

      <!-- 顶部导航栏（返回 + 订单详情） -->
      <PageHeader title="订单详情" @back="handleBack"/>

      <!-- 页面内容 -->
      <div class="order-page">
        <!-- 1. 商品信息模块 → 动态积分 + 两位小数 -->
        <section class="section product-info">
          <h2 class="section-title">商品信息</h2>
          <div class="info-row">
            <span class="label">产品积分：</span>
            <span class="value">{{ Number(orderInfo.point) }} 积分</span>
          </div>
        </section>

        <!-- 2. 订单信息模块（无修改，保留原有逻辑） -->
        <section class="section order-info">
          <div class="section-header">
            <h2 class="section-title">订单信息</h2>
            <button class="close-order-btn" @click="handleCloseOrder">关闭订单</button>
          </div>
          <div class="info-row">
            <span class="label">订单号：</span>
            <span class="value">{{ orderInfo?.id }}</span>
          </div>
          <div class="info-row">
            <span class="label">创建时间：</span>
            <span class="value">{{ formatDateTime(orderInfo?.createTime) }}</span>
          </div>
        </section>

        <!-- 3. 支付方式模块（动态读取后端支付方式，自动适配） -->
        <section class="section payment-method">
          <h2 class="section-title">支付方式</h2>
          <div class="payment-option">
            <input
                type="radio"
                id="pay-way"
                v-model="selectedPayment"
                value="multi_pay"
                class="radio-input"
                disabled
            >
            <label for="pay-way" class="radio-label">{{ orderInfo?.payType }}支付</label>
          </div>
        </section>

        <!-- 4. 订单总额模块 → 全动态 + 金额两位小数 -->
        <section class="section total-section">
          <h2 class="section-title">订单总额</h2>
          <div class="order-item">
            <!-- 动态积分（两位小数） -->
            <span class="item-name">AI积分充值： {{ Number(orderInfo.point) }} 积分</span>
            <!-- 动态金额（两位小数） -->
            <span class="item-price">¥{{ Number(orderInfo?.amount).toFixed(2) }}</span>
          </div>
          <div class="total-row">
            <span class="total-label">总计</span>
            <!-- 总计动态金额（两位小数） -->
            <span class="total-amount">¥{{ Number(orderInfo?.amount).toFixed(2) }}</span>
          </div>
        </section>

        <!-- 5. 底部结账按钮 -->
        <button class="checkout-btn" @click="handleCheckout">
          <span class="checkout-icon">✓</span> 结账
        </button>
      </div>
    </div>
    <ConfirmModal/>
  </MyWalletLayout>
</template>

<script setup>
import {onMounted, ref} from 'vue';
import {useRoute, useRouter} from "vue-router";
import {closeUnpaidRechargeOrder, getAiRechargeOrderDetail} from "@/services/ai_chat.order.service.js";
import {SERVICE_URLS} from "@/api/constants/serviceUrls.js";
import PageHeader from "@/components/Tiny/PageHeader.vue";
import MyWalletLayout from "@/components/MyPage/MyHomePageComponents/MyWalletComponents/MyWalletLayout.vue";
import {ElMessage} from "element-plus";

// 1. 先获取路由实例（顶层没问题）
const route = useRoute();
const orderInfo = ref({});
const router = useRouter();

// 🔥 所有逻辑必须放在 onMounted 里！（组件挂载后再执行）
onMounted(async () => {
  // 2. 在这里获取参数！！！
  const orderId = route.params?.orderId;
  console.log('获取到订单ID：', orderId);

  // 校验ID
  if (!orderId) {
    console.error('订单ID不能为空');
    return;
  }

  try {
    // 调用接口
    const result = await getAiRechargeOrderDetail(orderId);
    console.log('✅ 订单详情返回：', result);
    orderInfo.value = result;
  } catch (err) {
    console.error('❌ 查询失败：', err);
  }
});

// 支付方式
const selectedPayment = ref('multi_pay');

// 返回 → 订单详情页
const handleBack = () => {
  router.push({ name: 'OrderDetailPage' })
}

// 返回
const handleGoBack = () => {
  console.log('返回上一页');
  history.back();
};

import {useModalStore} from '@/stores/modalStore'
import ConfirmModal from "@/components/Tiny/ConfirmModal.vue";

const modalStore = useModalStore()

// 关闭订单（弹出确认框）
const handleCloseOrder = () => {
  // 调用确认弹窗：无输入框 + 双回调函数
  modalStore.showConfirmModal(
      '关闭订单',                          // 弹窗标题
      '确定要关闭该待付款订单吗？',        // 弹窗提示文字
      // 🔥 确认回调：执行关闭订单API
      async () => {
        try {
          const orderId = route.params.orderId;
          await closeUnpaidRechargeOrder(orderId);
          ElMessage.success('订单关闭成功');
          // ✅ 核心：关闭成功后 返回上一页
          router.back();
        } catch (error) {
          console.error('❌ 关闭订单失败：', error);
          ElMessage.error('关闭订单失败，请重试');
        }
      },
      // 🔥 取消回调：仅关闭弹窗，无其他操作
      () => {
        modalStore.hideConfirmModal();
      },
      false                                // 关键：隐藏输入框
  )
};

const handleCheckout = () => {
  // 直接获取页面上的订单ID
  const orderId = route.params.orderId;

  // 简单校验
  if (!orderId) {
    console.error('订单ID不存在，无法支付');
    return;
  }

  console.log('去支付，订单号：', orderId);

  // 直接跳转支付宝支付接口（最简单粗暴）
  window.location.href = `${SERVICE_URLS.AI_CHAT_SERVICE}/alipay/pay?orderId=${orderId}`;
};

// ============= 🔥 时间格式化工具函数 =============
function formatDateTime(timeStr) {
  // 如果时间为空，直接返回空字符串
  if (!timeStr) return '';
  const date = new Date(timeStr);
  // 年月日
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  // 时分秒
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  // 返回标准格式：2026-05-10 17:21:16
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
</script>

<style scoped>
/* 页面最外层包裹器 */
.order-page-wrapper {
  min-height: 100vh;
  background-color: var(--bg-color);
}

/* 页面内容容器 */
.order-page {
  padding: 20px;
}

/* 模块 - 加大间距 */
.section {
  background-color: var(--card-bg);
  margin-bottom: 24px; /* 🔥 加大间距，不拥挤 */
  padding: 20px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

/* 标题间距加大 */
.section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 20px 0;
}

/* 信息行间距加大 */
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.label {
  font-size: 16px;
  color: var(--text-tertiary);
}

.value {
  font-size: 16px;
  color: var(--text-primary);
  font-weight: 500;
}

/* 订单头部 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.close-order-btn {
  background-color: var(--error-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-default);
}

.close-order-btn:hover {
  filter: brightness(1.1);
}

/* 支付方式 */
.payment-option {
  display: flex;
  align-items: center;
  gap: 12px;
}

.radio-input {
  width: 20px;
  height: 20px;
  accent-color: var(--primary-color);
  cursor: pointer;
}

.radio-label {
  font-size: 16px;
  color: var(--text-primary);
  cursor: pointer;
}

/* 订单总额模块（浅色高级版，替换原有深色） */
.total-section {
  background-color: var(--gray-300);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.total-section .section-title {
  color: var(--text-primary);
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  /* 统一页面边框样式 */
  border-bottom: 1px solid var(--border-color);
}

.item-name {
  font-size: 18px;
  font-weight: 500;
  color: var(--text-primary);
}

.item-price {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.total-label {
  font-size: 16px;
  color: var(--text-secondary);
}

.total-amount {
  font-size: 36px;
  font-weight: 700;
  color: var(--text-primary);
}

/* 结账按钮 */
.checkout-btn {
  width: 100%;
  height: 48px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: var(--transition-default);
  margin-top: 12px;
}

.checkout-btn:hover {
  filter: brightness(1.1);
}

.checkout-icon {
  font-size: 20px;
}
</style>