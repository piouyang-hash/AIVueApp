<template>
  <!-- 弹窗遮罩层 + 居中容器（绑定显隐状态） -->
  <div class="recharge-modal-overlay"
       v-show="modalStore.pageModals.MyPage.RechargeAmountModal.Visible"
       @click="modalStore.closeMyPageRechargeAmountModal">
    <!-- 充值挡位弹窗内容（居中显示） -->
    <div class="recharge-amount-container" @click.stop>

      <h3 class="recharge-title">选择充值金额</h3>
      <!-- 关闭按钮 -->
      <div class="recharge-close-btn" @click="modalStore.closeMyPageRechargeAmountModal">
        ×
      </div>
      <div class="amount-grid">
        <!-- 循环渲染充值卡片（替换硬编码） -->
        <div
            v-for="amount in rechargeAmounts"
            :key="amount"
            class="amount-card"
            @click="handleSelectAmount(amount)"
        >
          <span class="amount-num">{{ amount }}</span>
          <span class="amount-unit">元</span>
        </div>
      </div>

      <!-- 取消按钮（白底黑字） -->
      <div class="cancel-btn" @click="modalStore.closeMyPageRechargeAmountModal">
        取消
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useModalStore } from '@/stores/modalStore.js';
import {fetchRechargeAmounts} from "@/services/order.recharge.service.js";

const modalStore = useModalStore();

// 1. 定义响应式数据：存储解析后的充值金额（数字）
const rechargeAmounts = ref([]);

// 2. 统一的充值金额选择事件
// 充值挡位弹窗的 script setup 中
const handleSelectAmount = (amount) => {
  console.log(`选中充值金额：${amount}元`);
  // 打开创建订单弹窗，并传入选中的金额
  modalStore.openMyPageCreateOrderModal(amount);
};

// 3. 挂载后调用接口，获取并解析后端数据
onMounted(async () => {
  try {
    // 调用接口获取后端数据（包含fixedAmounts数组）
    const resData = await fetchRechargeAmounts();
    // 解析fixedAmounts：从"RECHARGE_10"这类字符串中提取数字
    if (resData?.fixedAmounts && Array.isArray(resData.fixedAmounts)) {
      rechargeAmounts.value = resData.fixedAmounts.map(item => {
        // 正则提取数字（兼容RECHARGE_10/RECHARGE_200等格式）
        const num = item.match(/\d+/);
        return num ? Number(num[0]) : 0; // 转成数字，异常情况返回0
      }).filter(num => num > 0); // 过滤掉解析失败的0
    }
  } catch (error) {
    console.error('获取充值金额配置失败：', error);
    // 可选：解析失败时给默认金额（避免空页面）
    rechargeAmounts.value = [10, 20, 50, 100, 200, 500];
  }
});
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
  z-index: 1000; /* 确保遮罩在最上层 */
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

.recharge-close-btn:hover {
  color: var(--text-primary);
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

/* 充值挡位卡片：和充值按钮风格统一，深色底色 */
.amount-card {
  height: 48px; /* 和充值按钮高度一致 */
  line-height: 48px; /* 文字垂直居中 */
  background-color: var(--gray-700); /* 更深的底色（墨灰），比primary-color更暗 */
  color: var(--gray-50); /* 银白文字，和充值按钮文字色一致 */
  border: 1px solid transparent; /* 消除hover边框跳动 */
  border-radius: 8px; /* 和充值按钮圆角一致 */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease; /* 和充值按钮过渡速度一致 */
  box-shadow: 0 2px 8px var(--shadow-color); /* 和充值按钮阴影一致 */
  font-weight: 500; /* 和充值按钮字重一致 */
}

/* 卡片hover效果：底色稍浅，加边框，保持高级感 */
.amount-card:hover {
  background-color: var(--gray-600); /* 暗灰，比hover前稍浅 */
  border-color: var(--gray-500);
  box-shadow: 0 4px 12px rgba(var(--accent-color-rgb), 0.15);
  transform: translateY(-1px); /* 轻微上浮，不夸张 */
}

/* 金额数字样式：和按钮文字风格统一 */
.amount-num {
  font-size: 16px; /* 和充值按钮字号一致 */
  font-weight: 500;
  color: var(--gray-50); /* 银白，和按钮文字色一致 */
  margin-right: 4px;
}

/* 单位样式：适配深色背景 */
.amount-unit {
  font-size: 14px;
  color: var(--gray-100); /* 极浅灰，在深色背景更清晰 */
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

.cancel-btn:hover {
  background-color: var(--card-hover); /* 纯白hover背景 */
  border-color: var(--accent-color);
  box-shadow: 0 4px 8px rgba(var(--accent-color-rgb), 0.1);
  transform: translateY(-1px);
}
</style>