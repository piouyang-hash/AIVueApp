<template>
  <!-- 弹窗遮罩层 + 居中容器（绑定显隐状态） -->
  <div class="recharge-modal-overlay"
       v-show="modalStore.pageModals.MyPage.RechargeAmountModal.Visible"
       @click="modalStore.closeMyPageRechargeAmountModal">
    <!-- 充值挡位弹窗内容（居中显示） -->
    <div class="recharge-amount-container" @click.stop>

      <h3 class="recharge-title">选择充值选项</h3>
      <!-- 关闭按钮 -->
      <div class="recharge-close-btn" @click="modalStore.closeMyPageRechargeAmountModal">
        ×
      </div>
      <div class="amount-grid">
        <div
            v-for="amount in rechargeAmounts"
            :key="amount"
            class="amount-card"
            :class="{ active: selectedAmount === amount }"
            @click="handleSelectAmount(amount)"
        >
          <span class="amount-num">{{ amount }}</span>
          <span class="amount-unit">积分</span>
        </div>
      </div>

      <div
          class="pay-btn"
          :class="{ disabled: !canPay }"
          @click="handleToPay"
      >
        去支付
      </div>

      <!-- 取消按钮（白底黑字） -->
      <div class="cancel-btn" @click="modalStore.closeMyPageRechargeAmountModal">
        取消
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import {useModalStore} from '@/stores/modalStore.js';
import {createAiRechargeOrder, getUnpaidRechargeOrder} from "@/services/ai_chat.order.service.js";
import { useRouter } from 'vue-router';
import {getAiRechargeGoodsList} from "@/services/ai_chat.goods.service.js";

// 初始化
const router = useRouter();
const modalStore = useModalStore();

// ===================== 核心改造：存储完整商品数据 =====================
// 完整充值商品列表（对象数组，后台返回）
const rechargeGoods = ref([]);
// 当前选中的商品对象（核心：用于获取goodsId创建订单）
const selectedGood = ref(null);

// ===================== 保留原有变量（兼容你的模板渲染） =====================
// 充值金额数组（纯数字，用于页面渲染）
const rechargeAmounts = ref([]);
// 选中的金额（兼容原有逻辑）
const selectedAmount = ref(null);
// 支付按钮状态
const canPay = ref(false);

// 🔥 重写：充值金额选择事件（绑定商品对象）
const handleSelectAmount = (amount) => {
  // 1. 找到选中金额对应的商品对象
  const good = rechargeGoods.value.find(item => item.amount === amount);
  if (!good) return;

  // 2. 赋值选中数据
  selectedAmount.value = amount;
  selectedGood.value = good;
  canPay.value = true;

  console.log('选中充值金额：', amount, ' 对应商品ID：', good.id);
};

// 3. 挂载后调用接口，获取并解析后端数据
onMounted(async () => {
  try {
    // 1. 获取商品列表
    const resData = await getAiRechargeGoodsList();

    console.log(resData);
    // 2. 存储完整商品数据
    if (Array.isArray(resData) && resData.length > 0) {
      // 过滤有效商品
      rechargeGoods.value = resData.filter(item => {
        const amount = Number(item?.amount);
        return !isNaN(amount) && amount > 0;
      });

      // 提取纯金额数组（兼容模板渲染）
      rechargeAmounts.value = rechargeGoods.value.map(item => Number(item.amount));
    }

    // 3. 默认选中第一个
    if (rechargeAmounts.value.length > 0) {
      selectedAmount.value = rechargeAmounts.value[0];
      selectedGood.value = rechargeGoods.value[0];
      canPay.value = true;
    }

  } catch (error) {
    // 仅打印错误，无任何兜底数据
    console.error('获取充值商品列表失败：', error);
  }
});

// 🔥 去支付点击事件（核心：传入商品ID，而非金额）
const handleToPay = async () => {
  if (!canPay.value) {
    console.log('支付按钮已禁用，无法点击');
    return;
  }

  if (!selectedAmount.value || !selectedGood.value) {
    console.error('请先选择充值金额');
    return;
  }

  try {
    // ===================== 检查待支付订单（原有逻辑不变） =====================
    const unpaidResult = await getUnpaidRechargeOrder();

    if (unpaidResult) {
      console.log('⚠️ 存在待支付订单，打开确认弹窗');
      // 🔥 核心：调用Store的打开方法，传入订单对象
      modalStore.openMyPageUnpaidOrderModal(unpaidResult);
      return;
    }
    // ========================================================================

    // 🔥 核心修改：传入商品ID，而非金额
    const result = await createAiRechargeOrder(selectedGood.value.id);

    console.log('订单创建成功：', result);
    await router.push({
      name: 'OrderPage',
      params: { orderId: result }
    });

  } catch (error) {
    console.error('❌ 操作失败：', error);
  }
};
</script>

<style scoped>
/* 弹窗遮罩层：占满屏幕、半透明背景、居中对齐 */
.recharge-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(var(--accent-color-rgb), 0.5); /* 半透明灰，适配灰度体系 */
  z-index: 9998; /* 确保遮罩在最上层 */
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px); /* 可选：背景模糊，提升高级感 */
  cursor: pointer; /* 提示可点击 */
}

/* 充值弹窗容器：保留原有样式 */
.recharge-amount-container {
  width: 90%;
  max-width: 360px;
  padding: 24px; /* 弹窗内边距24px，是定位的基准 */
  background: var(--bg-color);
  border-radius: 12px;
  position: relative;
  box-shadow: 0 8px 24px rgba(var(--accent-color-rgb), 0.2);
  cursor: default;
}

/* 标题：加行高，让文字垂直中心和关闭按钮对齐 */
.recharge-title {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
  /* 核心1：加行高=关闭按钮高度（28px），让文字垂直居中 */
  line-height: 28px;
  /* 可选：给标题加一点顶部内边距，和弹窗顶部拉开距离 */
  padding-top: 0;
}

/* 关闭按钮：调整top值，让垂直中心和标题文字对齐 */
.recharge-close-btn {
  position: absolute;
  /* 核心2：top值改为24px（弹窗padding值），和标题的top起点一致 */
  top: 24px;
  right: 16px; /* 横向位置保留，视觉更舒适 */
  font-size: 18px;
  color: var(--text-secondary);
  cursor: pointer;
  width: 28px; /* 高度=标题行高=28px，保证中心对齐 */
  height: 28px;
  display: flex;
  align-items: center; /* 按钮内文字垂直居中 */
  justify-content: center;
  line-height: 1;
  border-radius: 50%;
  background-color: rgba(var(--accent-color-rgb), 0.05);
  transition: all 0.2s ease;
}

.amount-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  /* 核心修改1：加大行列间距（原16px → 24px，可按需调整） */
  gap: 24px;
  /* 核心修改2：增加网格内边距，让整体空间更宽松（上下左右各加12px） */
  padding: 12px;
  margin-bottom: 20px; /* 保留和取消按钮的间距 */
}

/* 充值挡位卡片：和【取消按钮】颜色完全统一 */
.amount-card {
  height: 48px; /* 和充值按钮高度一致 */
  line-height: 48px; /* 文字垂直居中 */
  /* 🔥 颜色改为和取消按钮一致 */
  background-color: var(--card-bg); /* 极浅灰背景（取消按钮同款） */
  color: var(--text-primary); /* 深墨灰文字（取消按钮同款） */
  border: 1px solid var(--border-color); /* 边框（取消按钮同款） */
  border-radius: 8px; /* 和充值按钮圆角一致 */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease; /* 和充值按钮过渡速度一致 */
  box-shadow: 0 2px 4px var(--shadow-color); /* 和取消按钮阴影一致 */
  font-weight: 500; /* 和充值按钮字重一致 */
}

/* 🔥 🔥 选中状态：和【去支付按钮】颜色完全统一 */
.amount-card.active {
  background-color: var(--primary-color); /* 去支付按钮同款主色背景 */
  color: #ffffff; /* 白色文字 */
  border: 1px solid var(--primary-color); /* 主色边框 */
  box-shadow: 0 2px 4px var(--shadow-color); /* 统一阴影 */
}

/* 金额数字样式：和按钮文字风格统一 */
.amount-num {
  font-size: 16px; /* 和充值按钮字号一致 */
  font-weight: 500;
  margin-right: 4px;
}

/* 单位样式：适配深色背景 */
.amount-unit {
  font-size: 14px;
}

.pay-btn {
  width: 100%;
  height: 48px;
  line-height: 48px;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  box-shadow: 0 2px 4px var(--shadow-color);
  transition: all 0.2s ease;
  cursor: pointer;
  margin-bottom: 12px; /* 和取消按钮留出间距 */

  /* 🔥 可用状态：主色按钮 */
  background-color: var(--primary-color);
  color: #ffffff;
  border: 1px solid var(--primary-color);
}

/* 🔥 禁用状态样式 */
.pay-btn.disabled {
  background-color: var(--gray-100);
  color: var(--text-primary);
  border: 1px solid var(--gray-200);
  cursor: not-allowed;
  box-shadow: none;
}

/* 取消按钮（白底黑字，和最初金额挡位样式一致） */
.cancel-btn {
  width: 100%;
  height: 48px; /* 和充值卡片/按钮高度一致 */
  line-height: 48px;
  background-color: var(--card-bg); /* 白底（极浅灰），还原最初样式 */
  color: var(--text-primary); /* 黑字（深墨灰），白底黑字 */
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px; /* 和其他按钮/卡片圆角一致 */
  border: 1px solid var(--border-color); /* 加边框，还原最初样式 */
  box-shadow: 0 2px 4px var(--shadow-color);
  transition: all 0.2s ease;
  cursor: pointer;
}
</style>