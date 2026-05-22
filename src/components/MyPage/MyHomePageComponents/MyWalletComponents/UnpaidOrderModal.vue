<template>
  <!-- 遮罩层：使用 modalStore 控制显示 -->
  <div class="modal-overlay" v-if="modalStore.pageModals.MyPage.UnpaidOrderModal.Visible" @click.self="handleClose">
    <!-- 弹窗主体 -->
    <div class="modal-card">
      <!-- 图标 + 标题 -->
      <div class="modal-header">
        <div class="icon-box">
          <span class="question-icon">?</span>
        </div>
        <h2 class="modal-title">注意</h2>
      </div>

      <!-- 提示文本 -->
      <div class="modal-body">
        <p class="tip-text">
          您还有未完成的订单，购买前需要先取消，<br>
          确定要取消之前的订单吗？
        </p>
      </div>

      <!-- 按钮组：仅打印，无emit -->
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="handleGoOrders">
          返回我的订单
        </button>
        <button class="btn btn-primary" @click="handleConfirmCancel">
          确定取消
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// 1. 导入并使用模态框状态管理
import { useModalStore } from '@/stores/modalStore.js';
import {closeUnpaidRechargeOrder} from "@/services/ai_chat.order.service.js";
import { useRouter } from 'vue-router';
import {ElMessage} from "element-plus";

const modalStore = useModalStore();
const router = useRouter();

// 关闭弹窗（操作 modalStore）
const handleClose = () => {
  modalStore.closeMyPageUnpaidOrderModal();
};

// 返回我的订单：仅打印
const handleGoOrders = () => {
  console.log('点击：返回我的订单');
  router.push({ name: 'OrderDetailPage' });
  handleClose();
};

// 🔥 确定取消订单：调用接口关闭订单 + 成功提示
const handleConfirmCancel = async () => {
  try {
    // 从modalStore获取待支付订单ID（必定有值）
    const orderId = modalStore.pageModals.MyPage.UnpaidOrderModal.UnpaidOrder.id;
    console.log('点击：确定取消未支付订单，订单ID：', orderId);

    // 调用关闭订单接口
    await closeUnpaidRechargeOrder(orderId);

    // ✅ Element Plus 成功提示
    ElMessage.success('订单取消成功');

    // 关闭弹窗
    handleClose();
  } catch (error) {
    console.error('❌ 取消订单失败：', error);
    ElMessage.error('取消订单失败，请重试'); // 可选：失败也提示
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  /* 保持上移位置 */
  padding-bottom: 450px;
}

.modal-card {
  background: #ffffff;
  border-radius: 12px;
  /* 再次缩小内边距 */
  padding: 20px 22px;
  width: 90%;
  /* 再次缩小整体宽度 */
  max-width: 350px;
  box-sizing: border-box;
  font-family: system-ui, -apple-system, sans-serif;
}

/* 图标 + 标题区域 */
.modal-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

/* 再次缩小图标盒子 */
.icon-box {
  width: 36px;
  height: 36px;
  border: 3px solid #ffb800;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
}

.question-icon {
  font-size: 20px;
  color: #ffb800;
  font-weight: bold;
}

/* 再次缩小标题字体 */
.modal-title {
  font-size: 22px;
  color: #1a1a1a;
  margin: 0;
  font-weight: 600;
}

/* 提示文本区域：左侧留白，对齐标题文字 */
.modal-body {
  margin-bottom: 20px;
  margin-left: 48px;
}

/* 再次缩小正文文字 */
.tip-text {
  font-size: 15px;
  color: #666666;
  line-height: 1.5;
  margin: 0;
}

/* 按钮区域 */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 再次缩小按钮尺寸 */
.btn {
  padding: 8px 22px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  outline: none;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: #ffffff;
  color: #666666;
  border: 1px solid #cccccc;
}

.btn-secondary:hover {
  background: #f5f5f5;
}

.btn-primary {
  background: #1677ff;
  color: #ffffff;
}

.btn-primary:hover {
  background: #4096ff;
}
</style>