<template>
    <div class="order-detail-page">

      <PageHeader title="订单详情" @back="handleBack"/>

      <ConfirmModal />

      <!-- 主体内容区 -->
      <main class="content">
        <!-- 订单成功状态模块：仅付款成功显示 -->
        <section
            class="success-section"
            v-if="orderInfo.status === '付款成功'"
        >
          <div class="success-icon">✓</div>
          <h2 class="success-title">已完成</h2>
          <p class="success-desc">订单已支付并开通。</p>
        </section>

        <!-- 商品信息模块 -->
        <section class="info-section">
          <h3 class="section-title">商品信息</h3>
          <div class="info-row">
            <span class="info-label">充值金额：</span>
            <span class="info-value">{{ orderInfo.amount }} 元</span>
          </div>
          <div class="info-row">
            <span class="info-label">到账积分：</span>
            <span class="info-value">{{ orderInfo.point }} 积分</span>
          </div>
        </section>

        <!-- 订单信息模块 -->
        <section class="info-section">
          <h3 class="section-title">订单信息</h3>
          <div class="info-row">
            <span class="info-label">订单号：</span>
            <span class="info-value">{{ orderInfo.id }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">订单类型：</span>
            <span class="info-value">{{ orderInfo.businessType }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">支付方式：</span>
            <span class="info-value">{{ orderInfo.payType }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">订单状态：</span>
            <span class="info-value">{{ orderInfo.status }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">创建时间：</span>
            <span class="info-value">{{ formatDateTime(orderInfo.createTime) }}</span>
          </div>
        </section>

        <!-- 🔥 新增：待付款状态模块 + 立即付款按钮 -->
        <section
            class="pending-section"
            v-if="orderInfo.status === '待付款'"
        >
          <!-- 主按钮：立即付款 -->
          <button class="pay-now-btn" @click="handlePayNow">立即付款</button>
          <!-- 次按钮：关闭订单（红色） -->
          <button class="close-order-btn" @click="handleCloseOrder">关闭订单</button>

          <!-- 🔥 【你要的】分割线 + 文字查询按钮（精准加在这里） -->
          <div class="query-tip">
            <div class="divider"></div>
            <span class="text-btn" @click="handleQueryPaid">已支付？点击查询</span>
          </div>

        </section>

      </main>
    </div>
</template>

<script setup>
import {onMounted, ref} from 'vue'
import PageHeader from "@/components/Tiny/PageHeader.vue";
import MyWalletLayout from "@/components/MyPage/MyHomePageComponents/MyWalletComponents/MyWalletLayout.vue";
import {useRoute, useRouter} from "vue-router";
import {closeUnpaidRechargeOrder, getAiRechargeOrderDetail} from "@/services/ai_chat.order.service.js";
import {ElMessage} from "element-plus";
import { useModalStore } from '@/stores/modalStore'
import ConfirmModal from "@/components/Tiny/ConfirmModal.vue";
import {SERVICE_URLS} from "@/api/constants/serviceUrls.js";

const modalStore = useModalStore()
// 路由实例
const router = useRouter()
const route = useRoute()

// 返回上一页
const handleBack = () => {
  router.back()
}

const orderInfo = ref({})

// 🔥 页面挂载完成：打印路由参数（订单号）
onMounted(async () => {
  // 从路由获取订单号（和路由配置的 :orderNo 对应）
  const orderNo = route.params.orderNo;

  // 校验订单号
  if (!orderNo) {
    console.error('订单号不能为空');
    return;
  }

  try {
    // 调用接口查询订单详情
    const result = await getAiRechargeOrderDetail(orderNo);
    console.log('✅ 查询订单详情成功：', result);

    // 赋值给响应式变量
    orderInfo.value = result;
  } catch (err) {
    console.error('❌ 查询订单详情失败：', err);
  }
});

// 🔥 已支付？点击查询（仅打印日志，后续可补查询逻辑）
const handleQueryPaid = () => {
  const orderNo = route.params.orderNo;
  console.log("点击【已支付查询】，订单号：", orderNo);
  // 后续可以在这里加刷新订单/查询支付状态的逻辑
};

// ===================== 关闭订单（复用之前的确认弹窗） =====================
const handleCloseOrder = () => {
  // 调用确认弹窗：无输入框 + 双回调函数
  modalStore.showConfirmModal(
      '关闭订单',
      '确定要关闭该待付款订单吗？',
      // 确认回调：执行关闭订单API
      async () => {
        try {
          const orderNo = route.params.orderNo;
          await closeUnpaidRechargeOrder(orderNo);
          ElMessage.success('订单关闭成功')
        } catch (error) {
          console.error('❌ 关闭订单失败：', error);
          ElMessage.error('关闭订单失败，请重试');
        }
      },
      // 取消回调：仅关闭弹窗
      () => {
        modalStore.hideConfirmModal();
      },
      false // 隐藏输入框
  )
};

// 新增：立即付款点击事件
const handlePayNow = () => {
  // 直接获取页面路由上的订单ID
  const orderNo = route.params.orderNo;

  // 简单校验
  if (!orderNo) {
    console.error('订单ID不存在，无法支付');
    return;
  }

  console.log('点击【立即付款】，去支付订单号：', orderNo);

  // 跳转支付宝支付接口（和你原来的跳转逻辑一模一样）
  window.location.href = `${SERVICE_URLS.AI_CHAT_SERVICE}/alipay/pay?orderNo=${orderNo}`;
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
.order-detail-page {
  width: 100%;
  height: 100%;           /* 关键：占满 page-container */
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color);
  padding: 15px;
  box-sizing: border-box;
}

/* 🔥 核心：让内容区自动填充并独立滚动 + 超细滚动条 */
.content {
  background-color: var(--bg-color);
  border-radius: 12px;
  overflow-y: auto;       /* 只有这里滚动 */

  /* 👇 超细滚动条样式（全局通用、美观不突兀） */
  &::-webkit-scrollbar {
    width: 3px; /* 超细宽度，可改 2/3/4px */
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--border-color); /* 用你项目的边框色，柔和不刺眼 */
    border-radius: 999px; /* 圆角胶囊样式 */
  }
  &::-webkit-scrollbar-track {
    background: transparent; /* 轨道透明，更隐形 */
  }
}

/* 待付款容器：垂直居中布局 */
.pending-section {
  padding: 40px 24px;
  display: flex;
  flex-direction: column; /* 按钮上下排列 */
  align-items: center;
  gap: 16px; /* 两个按钮之间的间距 */
  background-color: var(--bg-color);
}

/* 立即付款按钮（保留原有样式，统一宽度） */
.pay-now-btn {
  padding: 14px 40px;
  background-color: var(--primary-color);
  color: var(--bg-color);
  border: none;
  border-radius: var(--radius-md);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-default);
  box-shadow: var(--shadow-sm);
  width: 60%;
  max-width: 320px;
}

/* 🔥 关闭订单按钮：红色样式（完全匹配你的变量） */
.close-order-btn {
  padding: 14px 40px;
  background-color: var(--error-color); /* 项目内置红色 */
  color: var(--bg-color);
  border: none;
  border-radius: var(--radius-md);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-default);
  box-shadow: var(--shadow-sm);
  width: 60%;
  max-width: 320px;
}

/* 成功状态模块 */
.success-section {
  padding: 40px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  background-color: var(--bg-color);
}

.success-icon {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #34c759;
  color: var(--bg-color);
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
  color: var(--text-primary);
}

.success-desc {
  margin: 0;
  font-size: 17px;
  color: var(--text-secondary);
  text-align: center;
}

.tutorial-btn {
  background-color: #e65c00;
  color: var(--bg-color);
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
  border-top: 1px solid var(--border-color);
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 22px;
  font-weight: 600;
  color: var(--text-primary);
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
  color: var(--text-secondary);
}

.info-value {
  color: var(--text-primary);
  font-weight: 500;
  text-align: right;
}

/* 已支付查询提示栏 */
.query-tip {
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  align-items: end;
  gap: 12px;
  margin-top: 8px;
}
/* 分割线 */
.divider {
  width: 100%;
  border-top: 1px solid var(--border-color);
}
/* 文字按钮：仅下划线，无背景边框 */
.text-btn {
  font-size: 14px;
  color: var(--text-secondary);
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
  transition: var(--transition-default);
}
</style>