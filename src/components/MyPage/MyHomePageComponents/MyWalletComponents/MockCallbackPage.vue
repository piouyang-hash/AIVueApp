<template>
  <MyWalletLayout>
    <div class="mock-callback-page">
      <!-- 头部（标题已填，返回事件保留） -->
      <PageHeader title="测试版模拟回调" @back="handleBack"/>

      <!-- 核心内容容器 -->
      <div class="callback-content">
        <!-- 正方形图片占位（你后续替换为真实图片即可） -->
        <!-- 正方形图片容器（统一尺寸，适配不同分辨率图片） -->
        <div class="mock-img-box">
          <!-- 根据payType显示对应二维码：1=微信 2=支付宝 -->
          <img
              v-if="payType === '1'"
              :src="wechatPayCode"
              alt="微信支付二维码"
              class="pay-code-img"
          />
          <img
              v-else-if="payType === '2'"
              :src="alipayPayCode"
              alt="支付宝支付二维码"
              class="pay-code-img"
          />
          <!-- 异常兜底 -->
          <div v-else class="img-placeholder">
            <span class="placeholder-text">无效的支付方式</span>
          </div>
        </div>

        <!-- 确认完成支付按钮 -->
        <button class="confirm-pay-btn">
          确认完成支付
        </button>
      </div>
    </div>
  </MyWalletLayout>
</template>

<script setup>
// 导入支付二维码图片（路径按你的配置）
import wechatPayCode from '@/static/images/wechat-pay-code.png'
import alipayPayCode from '@/static/images/alipay-pay-code.png'

// 1. 导入onMounted
import { onMounted } from 'vue'
import PageHeader from "@/components/Tiny/PageHeader.vue";
import { useRouter } from 'vue-router'
import MyWalletLayout from "@/components/MyPage/MyHomePageComponents/MyWalletComponents/MyWalletLayout.vue";
// 实例化router
const router = useRouter()

// 2. 接收两个路由参数（orderNo + payType）
const props = defineProps({
  orderNo: {
    type: String,
    required: true
  },
  payType: {
    type: String, // 支付方式是数字（1/2），所以类型设为Number
    required: true,
    // 可选：校验payType只能是1或2，避免传错值
    validator: (value) => {
      return ["1", "2"].includes(value)
    }
  }
})

// 3. 返回按钮逻辑
const handleBack = () => {
  console.log('返回上一页，当前模拟回调页订单号：', props.orderNo)
}

// 4. onMounted中打印两个参数的值
onMounted(() => {
  console.log('===== 测试版模拟回调页参数 =====')
  console.log('订单号：', props.orderNo)
  console.log('支付方式（原始值）：', props.payType)
  // 可选：友好打印支付方式名称，便于调试
  console.log('支付方式（解析）：', props.payType === 1 ? '微信支付' : '支付宝支付')
})
</script>

<style scoped>
/* 页面容器 */
.mock-callback-page {
  min-height: 100vh;
  background-color: var(--bg-color);
}

/* 核心内容容器（居中布局） */
.callback-content {
  padding: 30px 16px;
  max-width: 500px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

/* 正方形图片容器（固定尺寸，居中） */
.mock-img-box {
  width: 280px;
  height: 280px; /* 强制正方形 */
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--gray-100);
  overflow: hidden; /* 隐藏超出容器的部分 */
}

/* 支付二维码图片样式（统一尺寸，适应容器） */
.pay-code-img {
  width: 100%;    /* 宽度铺满容器 */
  height: 100%;   /* 高度铺满容器 */
  object-fit: contain; /* 保持图片比例，完整显示，不拉伸 */
  object-position: center; /* 居中显示 */
}

/* 占位样式（异常情况） */
.img-placeholder {
  text-align: center;
}
.placeholder-text {
  font-size: 14px;
  color: var(--text-tertiary);
}

/* 确认完成支付按钮（按要求用指定颜色） */
.confirm-pay-btn {
  width: 100%;
  height: 48px;
  border-radius: 24px; /* 和支付页按钮圆角一致 */
  border: none;
  outline: none;
  background-color: var(--primary-color); /* #434a50 */
  color: var(--gray-50); /* 银白文字 */
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* 按钮悬浮效果（可选，提升体验） */
.confirm-pay-btn:hover {
  background-color: var(--gray-800); /* 悬浮加深，贴合你的灰度体系 */
}
</style>