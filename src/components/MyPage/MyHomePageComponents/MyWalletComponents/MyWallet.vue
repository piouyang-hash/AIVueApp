<template>
    <div class="wallet-page">
      <!-- 页面头部 -->
      <PageHeader title="我的钱包" @back="handleBack"/>

      <UnpaidOrderModal />
      <!-- 新增：右上角订单详情按钮 -->
      <div class="order-detail-btn" @click="handleOrderDetail">订单详情</div>

      <!-- 钱包主体区域 -->
      <div class="wallet-container">
        <!-- 余额展示卡片 -->
        <div class="balance-card">
          <div class="balance-label">账户积分</div>
          <!-- ✅ 替换变量名，直接展示积分 -->
          <div class="balance-amount">
            {{ isLoading ? '请求中...' : userPoint }}
          </div>
          <div class="balance-desc">积分是和AI聊天的消耗性代币</div>
        </div>

        <!-- 充值按钮 -->
        <div class="recharge-btn" @click="handleRecharge">
          立即充值
        </div>

        <!-- 钱包说明（可选，增加页面完整性） -->
        <div class="wallet-tips">
          充值的金额可能要1到3分钟到账，支持微信和支付宝
        </div>
      </div>
      <RechargeAmountCard/>
      <CreateOrderModal/>
    </div>
</template>

<script setup>
import PageHeader from "@/components/Tiny/PageHeader.vue";
import { useRouter } from 'vue-router'
// 新增：导入modalStore
import { useModalStore } from '@/stores/modalStore.js';
import RechargeAmountCard from "@/components/MyPage/MyHomePageComponents/MyWalletComponents/RechargeAmountCard.vue";
import CreateOrderModal from "@/components/MyPage/MyHomePageComponents/MyWalletComponents/CreateOrderModal.vue";
import {onMounted, ref} from "vue";
import {fetchMyAccountBalance} from "@/services/account.service.js";
import MyWalletLayout from "@/components/MyPage/MyHomePageComponents/MyWalletComponents/MyWalletLayout.vue";
import {getUserPointBalance} from "@/services/ai_chat.token.service.js";
import UnpaidOrderModal from "@/components/MyPage/MyHomePageComponents/MyWalletComponents/UnpaidOrderModal.vue";

// 新增：请求加载状态（初始为true，代表正在请求）
const isLoading = ref(true)
const userPoint = ref(0)

// 组件挂载时查询积分
onMounted(async () => {
  // 调用函数
  const result = await getUserPointBalance()
  // 打印接口返回的完整VO对象
  console.log('getUserPointBalance 调用结果：', result)

  // 请求完成，关闭加载
  isLoading.value = false

  // ✅ 核心修改：取 totalPoint，自动保留小数点后两位，无数据则为 0
  userPoint.value = result?.totalPoint ? Number(result.totalPoint).toFixed(2) : 0
})

const router = useRouter()
// 新增：实例化modalStore
const modalStore = useModalStore();

const handleBack = () => {
  router.push({ name: 'MyHomePageMain' })
}

// 新增：立即充值按钮点击事件 → 打开充值挡位弹窗
const handleRecharge = () => {
  modalStore.openMyPageRechargeAmountModal();
}

// 订单详情按钮点击事件（路由跳转）
const handleOrderDetail = () => {
  // 通过 name 跳转（最稳定，不依赖路径）
  router.push({ name: 'OrderDetailPage' })
}

</script>

<style scoped>
/* 页面整体容器 */
.wallet-page {
  width: 100%;
  height: 100%;
  padding: 15px;
  background-color: var(--bg-color);
}

/* 钱包主体容器 */
.wallet-container {
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

.order-detail-btn {
  /* 沿用返回按钮精准定位 */
  position: absolute;
  right: 15px;
  top: 20px;
  /* 保留边框文字样式 */
  padding: 6px 12px;
  background: transparent;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
  border-radius: var(--radius-sm);
  font-size: 13px;
  cursor: pointer;
  transition: var(--transition-default);
}

/* 余额卡片 */
.balance-card {
  width: 100%;
  max-width: 500px;
  padding: 32px 24px;
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: 0 4px 12px var(--shadow-color);
  text-align: center;
  transition: background-color 0.2s ease;
}

.balance-card:hover {
  background-color: var(--card-hover);
}

.balance-label {
  color: var(--text-secondary);
  font-size: 16px;
  margin-bottom: 8px;
}

.balance-amount {
  color: var(--text-primary);
  font-size: 36px;
  font-weight: 600;
  margin-bottom: 12px;
}

.balance-desc {
  color: var(--text-tertiary);
  font-size: 14px;
}

/* 充值按钮 */
.recharge-btn {
  width: 100%;
  max-width: 500px;
  height: 48px;
  line-height: 48px;
  background-color: var(--primary-color);
  color: var(--gray-50);
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  box-shadow: 0 2px 8px var(--shadow-color);
  transition: all 0.2s ease;
  cursor: pointer;
}

.recharge-btn:hover {
  background-color: var(--gray-700);
  transform: translateY(-2px);
}

.recharge-btn:active {
  transform: translateY(0);
}

/* 钱包说明文字 */
.wallet-tips {
  color: var(--text-tertiary);
  font-size: 12px;
  margin-top: 8px;
}
</style>
