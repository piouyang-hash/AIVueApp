<template>
  <MyWalletLayout>
    <div class="wallet-page">
      <!-- 页面头部 -->
      <PageHeader title="我的钱包" @back="handleBack"/>

      <!-- 钱包主体区域 -->
      <div class="wallet-container">
        <!-- 余额展示卡片 -->
        <div class="balance-card">
          <div class="balance-label">账户余额</div>
          <!-- 根据请求状态显示「请求中」或真实余额 -->
          <div class="balance-amount">
            {{ isLoading ? '请求中...' : `¥ ${balance}` }}
          </div>
          <div class="balance-desc">余额可用于充值、消费等场景</div>
        </div>

        <!-- 充值按钮 -->
        <div class="recharge-btn" @click="handleRecharge">
          立即充值
        </div>

        <!-- 钱包说明（可选，增加页面完整性） -->
        <div class="wallet-tips">
          充值金额实时到账，支持多种支付方式
        </div>
      </div>
      <RechargeAmountCard/>
      <CreateOrderModal/>
    </div>
  </MyWalletLayout>
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

// 新增：请求加载状态（初始为true，代表正在请求）
const isLoading = ref(true)
const balance = ref('0.00')

// 组件挂载时查询余额
onMounted(async () => {

  // 直接调用余额查询函数（极简，无try/catch）
  const result = await fetchMyAccountBalance()

  // 核心：请求完成后，关闭加载状态
  isLoading.value = false

  // 只有查询成功且有值时，更新余额（保留两位小数）
  if (result !== null) {
    balance.value = result.toFixed(2)
  }
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

</script>

<style scoped>
/* 页面整体容器 */
.wallet-page {
  width: 100%;
  min-height: 100vh;
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
