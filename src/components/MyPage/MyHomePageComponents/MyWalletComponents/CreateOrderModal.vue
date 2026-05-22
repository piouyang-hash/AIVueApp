<template>
  <!-- 订单弹窗遮罩层 -->
  <div
      class="create-order-modal-overlay"
      v-show="modalStore.pageModals.MyPage.CreateOrderModal.Visible"
      @click="modalStore.closeMyPageCreateOrderModal"
  >
    <!-- 弹窗内容容器（阻止冒泡） -->
    <div class="create-order-container" @click.stop>
      <h3 class="order-title">确认创建充值订单</h3>

      <!-- 1. 金额确认区域 -->
      <div class="amount-confirm">
        <span class="label">充值选项：</span>
        <span class="amount">{{ modalStore.pageModals.MyPage.CreateOrderModal.amount }} 积分</span>
      </div>

      <!-- 2. 充值理由选择区域（仅修改 optional 部分） -->
      <div class="reason-section">
        <div class="reason-label">
          充值理由：
          <!-- 把“选填”替换为当前选中的具体理由 -->
          <span class="optional">{{ selectedReason }}</span>
        </div>
        <div class="reason-options">
          <div
              class="reason-item"
              :class="{ active: selectedReason === item }"
              v-for="item in reasonList"
              :key="item"
              @click="selectedReason = item"
          >
            {{ item }}
          </div>
        </div>
      </div>

      <!-- 3. 按钮区域 -->
      <div class="btn-group">
        <!-- 取消按钮：白底黑字 -->
        <div class="cancel-btn" @click="modalStore.closeMyPageCreateOrderModal">
          取消
        </div>
        <!-- 创建订单按钮：支持加载状态 -->
        <div
            class="create-btn"
            :class="{ disabled: creatingOrder }"
            @click="handleCreateOrder"
        >
          {{ creatingOrder ? '前往收银台...' : '去支付' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useModalStore } from '@/stores/modalStore.js';
import {createRechargeOrder} from "@/services/order.recharge.service.js";
import { useToastStore } from '@/stores/toastStore'
import { useRouter } from 'vue-router'

const router = useRouter()
const toastStore = useToastStore()
const modalStore = useModalStore();

// 充值理由列表（平铺选择）
const reasonList = ref(['投喂给作者！', '解锁付费内容', '支持平台运营', '其他']);
// 默认选中：投喂给作者！
const selectedReason = ref('投喂给作者！');

const creatingOrder = ref(false)

// 创建订单按钮点击事件
const handleCreateOrder = async () => {
  // 防止重复点击
  if (creatingOrder.value) return

  const amount = modalStore.pageModals.MyPage.CreateOrderModal.amount
  const reason = selectedReason.value // 你原来的备注/理由

  console.log('创建订单：', { amount, reason })

  creatingOrder.value = true
  try {
    // 调用接口，默认 payType = 1（微信）
    const orderId = await createRechargeOrder(
        amount,     // 金额
        reason // remark，可有可无
    )

    toastStore.show('创建订单成功！')

    // 成功后关闭弹窗（根据你的 store 调整）
    modalStore.closeMyPageCreateOrderModal()
    modalStore.closeMyPageRechargeAmountModal()

    // 可选：跳转到支付页面或刷新数据
    await router.push({name: 'PaymentPage', params: {orderNo: orderId}})

  } catch (err) {
    toastStore.show('操作失败，请重试！', 'error')
    console.error('创建订单失败：', err)
  } finally {
    creatingOrder.value = false
  }
}
</script>

<style scoped>
/* 弹窗遮罩层（和充值挡位弹窗样式统一） */
.create-order-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(var(--accent-color-rgb), 0.5);
  z-index: 1001; /* 层级比充值挡位弹窗高一点，确保覆盖 */
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
  cursor: pointer;
}

/* 弹窗内容容器 */
.create-order-container {
  width: 90%;
  max-width: 360px;
  padding: 24px;
  background: var(--bg-color);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(var(--accent-color-rgb), 0.2);
  cursor: default;
}

/* 标题样式 */
.order-title {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
}

/* 金额确认区域（核心加了flex+居中属性） */
.amount-confirm {
  margin-bottom: 20px;
  padding: 12px;
  background: var(--gray-100);
  border-radius: 8px;
  font-size: 16px;
  color: var(--text-primary);
  /* 新增：水平+垂直居中 */
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中（适配padding的高度） */
}

.amount-confirm .label {
  color: var(--text-secondary);
}

.amount-confirm .amount {
  font-weight: 700;
  color: var(--gray-800);
}

/* 充值理由区域 */
.reason-section {
  margin-bottom: 24px;
}

.reason-label {
  margin-bottom: 12px;
  font-size: 14px;
  color: var(--text-primary);
}

.reason-label .optional {
  color: var(--text-tertiary);
  font-size: 12px;
  margin-left: 8px;
}

/* 充值理由平铺选择项 */
.reason-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.reason-item {
  padding: 6px 12px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.reason-item.active {
  background: var(--gray-700);
  color: var(--gray-50);
  border-color: transparent;
}

.reason-item:hover:not(.active) {
  border-color: var(--accent-color);
  color: var(--text-primary);
}

/* 按钮组 */
.btn-group {
  display: flex;
  gap: 12px;
}

/* 取消按钮：白底黑字（和充值挡位的取消按钮样式一致） */
.cancel-btn {
  flex: 1;
  height: 48px;
  line-height: 48px;
  background-color: var(--card-bg);
  color: var(--text-primary);
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 4px var(--shadow-color);
  transition: all 0.2s ease;
  cursor: pointer;
}

.cancel-btn:hover {
  background-color: var(--card-hover);
  border-color: var(--accent-color);
  box-shadow: 0 4px 8px rgba(var(--accent-color-rgb), 0.1);
  transform: translateY(-1px);
}

/* 创建订单按钮：黑底白字（和充值挡位卡片样式一致） */
.create-btn {
  flex: 1;
  height: 48px;
  line-height: 48px;
  background-color: var(--gray-700);
  color: var(--gray-50);
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  border: 1px solid transparent;
  box-shadow: 0 2px 8px var(--shadow-color);
  transition: all 0.2s ease;
  cursor: pointer;
}

/* 禁用/加载状态：背景和文字颜色互换 */
.create-btn.disabled {
  background-color: var(--gray-300);
  color: var(--gray-700);
  cursor: not-allowed;
  opacity: 0.9;
  box-shadow: none;
}

</style>