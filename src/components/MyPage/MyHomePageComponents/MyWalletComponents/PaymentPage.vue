<template>
  <MyWalletLayout>
    <div class="payment-page">
      <!-- 头部 -->
      <PageHeader title="支付页面" @back="handleBack"/>

      <!-- 主内容区 -->
      <div class="content">
        <!-- 充值金额突出展示 -->
        <div class="amount-card">
          <div class="amount-label">充值金额</div>
          <!-- 动态渲染接口返回的金额，保留两位小数 -->
          <div class="amount-value">¥{{ (orderDetail.amount || 0).toFixed(2) }}</div>
        </div>

        <!-- 信息卡片（仅保留订单号、业务类型、支付状态） -->
        <div class="info-card">
          <div class="info-item">
            <span class="label">订单号</span>
            <span class="value">{{ orderNo || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">业务类型</span>
            <!-- 翻译业务类型：RECHARGE → 充值 -->
            <span class="value">{{
                orderDetail.businessType === 'RECHARGE' ? '充值' : orderDetail.businessType || '-'
              }}</span>
          </div>
          <div class="info-item">
            <span class="label">支付状态</span>
            <!-- 翻译支付状态：WAIT_PAY→待支付，SUCCESS→已支付，FAIL→支付失败 -->
            <span class="value">
        {{ getPayStatusText(orderDetail.status) }}
      </span>
          </div>
        </div>

        <!-- 支付方式选择（示例，可自行扩展） -->
        <div class="pay-method-card">
          <div class="card-title">选择支付方式</div>
          <!-- 微信支付：绑定选择事件，动态控制active类 -->
          <div
              class="method-item"
              :class="{ active: selectedPayMethod === 1 }"
              @click="handleSelectPayMethod({ name: '微信支付', value: 1 })"
          >
            <div class="method-info">
              <div class="method-name">微信支付</div>
            </div>
          </div>
          <!-- 支付宝支付：绑定选择事件，动态控制active类 -->
          <!-- 组件里面直接使用变量名，不要加value，没有用！-->
          <div
              class="method-item"
              :class="{ active: selectedPayMethod === 2 }"
              @click="handleSelectPayMethod({ name: '支付宝支付', value: 2 })"
          >
            <div class="method-info">
              <div class="method-name">支付宝支付</div>
            </div>
          </div>
        </div>

        <!-- 服务协议勾选（新增/修改） -->
        <div
            class="agreement"
            @click="handleAgreeChange"
            :class="{ 'agreement-animate': animateAgreement }"
        >
          <div
              class="checkbox-box"
              :class="{ checked: isAgreed }"
          >
            <span class="check-icon" v-if="isAgreed">✓</span>
          </div>
          <span class="text">
    我已阅读并同意
    <span class="link" @click.stop="goToAgreementPage">《充值服务协议》</span>
  </span>
        </div>
      </div>

      <!-- 底部固定支付按钮（新增/修改） -->
      <div class="footer-btn">
        <!-- 按钮禁用条件：未同意协议 || 非待支付状态 || 请求中 -->
        <!-- 移除原生:disabled，仅保留样式类控制禁用视觉效果 -->
        <button
            class="pay-button"
            :class="{ disabled: !canPay || isLoading }"
            @click="handlePay"
        >
          <!-- 请求中显示“请求中”，否则显示“确认支付” -->
          {{ isLoading ? '请求中...' : '确认支付' }}
        </button>
      </div>
    </div>
  </MyWalletLayout>
</template>

<script setup>
import PageHeader from "@/components/Tiny/PageHeader.vue"
import {computed, onMounted, ref} from 'vue'

import {useRouter} from 'vue-router'
import {getRechargeOrderDetail, updateRechargeOrderPayType} from "@/services/order.recharge.service.js";
import {useToastStore} from "@/stores/toastStore.js";
import MyWalletLayout from "@/components/MyPage/MyHomePageComponents/MyWalletComponents/MyWalletLayout.vue";

const router = useRouter()

// 返回上一页
const handleBack = () => {
  router.push({name: 'MyWallet'}) // 或跳转到指定页面 router.push('/personal-page/my')
}

const toastStore = useToastStore()

// 接收路由参数 orderNo（因为上面设置了 props: true）
const props = defineProps({
  orderNo: {
    type: String,
    required: true
  }
})

// 定义响应式变量，存储订单详情（用于模板动态渲染）
const orderDetail = ref({})

// 支付状态翻译函数（根据后端返回的status映射中文，新增WAIT_SELECT_PAYMENT状态）
const getPayStatusText = (status) => {
  const statusMap = {
    'WAIT_SELECT_PAYMENT': '等待选择支付方式', // 新增：对应后端枚举的默认状态
    'WAIT_PAY': '等待付款',
    'PAY_SUCCESS': '付款成功', // 对应后端PAY_SUCCESS
    'ORDER_TIMEOUT': '订单超时', // 对应后端ORDER_TIMEOUT
    'PAY_FAIL': '支付失败', // 对应后端PAY_FAIL
    'PAY_ERROR': '付款错误', // 对应后端PAY_ERROR
    'SUCCESS': '已支付', // 保留原有兼容项
    'FAIL': '支付失败', // 保留原有兼容项
    'REFUND': '已退款' // 保留原有兼容项
  }
  return statusMap[status] || status || '未知状态'
}

// ========== 服务协议勾选核心逻辑 ==========
// 1. 响应式变量：控制勾选状态（默认未选中）
const isAgreed = ref(false)
const animateAgreement = ref(false)
/**
 * 2. 勾选状态切换事件
 * 点击整个协议区域，切换选中/未选中状态，并打印日志
 */
const handleAgreeChange = () => {
  isAgreed.value = !isAgreed.value
  // 打印选中状态（方便调试/后续业务处理）
  console.log('服务协议勾选状态：', isAgreed.value ? '已勾选' : '未勾选')
  // 勾选后重置动画状态（恢复默认样式）
  animateAgreement.value = false
  // 可选：后续提交支付时的校验逻辑示例
  // if (!isAgreed.value) {
  //   alert('请先阅读并同意《充值服务协议》')
  //   return false
  // }
}

const selectedPayMethod = ref(1)

/**
 * 支付方式选择事件
 * @param {Object} payMethod - 支付方式对象 { name: 显示名称, value: 传给后端的数字 }
 */
const handleSelectPayMethod = (payMethod) => {
  // 更新选中的支付方式
  selectedPayMethod.value = payMethod.value
  // 打印选择信息（方便调试）
  console.log(`选中的支付方式：${payMethod.name}，传给后端的值：${payMethod.value}`)
  console.log(`当前订单号：${props.orderNo}，待提交的参数：订单号=${props.orderNo}，支付方式=${payMethod.value}`)
}

// 2. 修改onMounted：调用接口并打印结果
onMounted(async () => { // 注意加async，因为要调用异步函数
  const orderNo = props.orderNo

  // 赋值给响应式变量，模板自动更新
  orderDetail.value = await getRechargeOrderDetail(orderNo)
})

// ========== 支付按钮核心逻辑 ==========
// 1. 请求中状态（禁用按钮）
const isLoading = ref(false)

// 2. 支付合法性校验：计算属性（仅当协议同意 + 订单状态为WAIT_SELECT_PAYMENT时可支付）
const canPay = computed(() => {
  return isAgreed.value && orderDetail.value.status === 'WAIT_SELECT_PAYMENT'
})

/**
 * 支付按钮点击事件（实际为更新订单支付方式）
 * 包含：合法性校验 → 请求中状态 → 更新订单支付方式 → finally重置状态
 */
const handlePay = async () => {

  // 未同意协议：触发动画提示，不弹alert
  if (!isAgreed.value) {
    animateAgreement.value = true // 触发动画
    // 动画结束后自动重置（动画时长1s，这里设1.2s确保动画完成）
    setTimeout(() => {
      animateAgreement.value = false
    }, 1200)
    return
  }

  // 双重校验（防止前端计算属性失效）
  if (!canPay.value) {
    // 替换alert为toast错误提示
    toastStore.show('更新条件不满足：请同意服务协议且订单状态为待支付', 'error')
    return
  }

  try {
    // 请求中状态（函数第一句话）
    isLoading.value = true
    console.log('请求中...更新订单支付方式')

    // 核心打印：点击了“提交”按钮
    console.log('点击了“提交”按钮')

    // ========== 真实业务逻辑：更新订单支付方式 ==========
    // 调用更新订单支付方式API，参数：订单号 + 选中的支付方式
    await updateRechargeOrderPayType(props.orderNo, selectedPayMethod.value)
    console.log('更新订单支付方式成功，订单号：', props.orderNo, '支付方式：', selectedPayMethod.value)
    // 成功提示
    toastStore.show('更新订单支付方式成功！')
    await router.push({
      name: 'MockCallbackPage',
      params: {
        orderNo: props.orderNo,
        payType: selectedPayMethod.value
      }
    })
    // ========== 真实业务逻辑结束 ==========

  } catch (error) {
    // 异常处理
    console.error('更新订单支付方式失败：', error.message)
    // 替换alert为toast错误提示
    toastStore.show(`更新失败：${error.message}`, 'error')
  } finally {
    // finally逻辑：无论成功/失败，都重置请求中状态
    isLoading.value = false
    console.log('请求结束，重置加载状态')
  }
}

// 新增：跳转到充值服务协议页面（通过name跳转）
const goToAgreementPage = () => {
  router.push({ name: 'RechargeAgreementPage' })
}
</script>

<style scoped>
.payment-page {
  min-height: 100vh;
  background-color: var(--bg-color);
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  padding: 16px;
}

/* 充值金额卡片 */
.amount-card {
  background-color: var(--card-bg);
  border-radius: 12px;
  padding: 24px 16px;
  text-align: center;
  margin-bottom: 24px;
}

.amount-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.amount-value {
  font-size: 36px;
  font-weight: bold;
  color: var(--text-primary);
}

/* 信息展示卡片 */
.info-card {
  background-color: var(--card-bg);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  font-size: 15px;
}

.info-item:not(:last-child) {
  border-bottom: 1px solid var(--gray-200);
}

.info-item .label {
  color: var(--text-secondary);
}

.info-item .value {
  color: var(--text-primary);
  font-weight: 500;
}

/* 支付方式卡片 */
.pay-method-card {
  background-color: var(--card-bg);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 24px;
}

.card-title {
  padding: 12px 16px;
  font-size: 14px;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--gray-200);
}

/* 未选中状态：灰色背景（极浅灰）+ 黑色系字体（深墨灰） */
.method-item {
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--gray-100); /* 极浅灰背景（未选中） */
  color: var(--gray-800); /* 深墨灰字体（接近黑色） */
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease; /* 过渡动画，切换更丝滑 */
}

/* 选中状态：相反色 - 深色背景（深墨灰）+ 浅色系字体（银白） */
.method-item.active {
  background-color: var(--gray-800); /* 深墨灰背景（选中） */
  color: var(--gray-50); /* 银白字体（和背景反色） */
}

/* 支付方式名称样式，继承父级颜色 */
.method-name {
  font-size: 15px;
  font-weight: 500;
  color: inherit; /* 关键：继承父级（.method-item）的颜色，无需单独设置 */
}

/* 协议勾选 */
.agreement {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 24px;
  font-size: 13px;
  color: var(--text-tertiary);
  pointer-events: auto;
}

/* 勾选框容器：黑色系样式 */
.checkbox-box {
  width: 18px;
  height: 18px;
  border: 2px solid var(--gray-800); /* 深墨灰边框（未选中） */
  border-radius: 3px;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

/* 勾选状态：深墨灰背景 + 白色对勾 */
.checkbox-box.checked {
  background-color: var(--gray-800); /* 深墨灰背景（选中） */
}

/* 核心：协议提示动画（勾选框+文字同步变红+摇晃） */
.agreement.agreement-animate {
  animation: agreementWarn 1s ease-in-out; /* 整体摇晃动画 */
}

/* 动画触发时：勾选框变红 */
.agreement.agreement-animate .checkbox-box {
  border-color: #f56c6c !important;
  background-color: rgba(245, 108, 108, 0.1) !important;
}

/* 动画触发时：文字变红（包括链接） */
.agreement.agreement-animate .text {
  color: #f56c6c !important;
}
.agreement.agreement-animate .text .link {
  color: #f56c6c !important;
}

/* 动画关键帧：整体上下小幅度旋转（摇晃） */
@keyframes agreementWarn {
  0% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-5deg); /* 小幅度左摇 */
  }
  50% {
    transform: rotate(5deg); /* 小幅度右摇 */
  }
  75% {
    transform: rotate(-5deg); /* 再次左摇 */
  }
  100% {
    transform: rotate(0deg); /* 回到初始位置 */
  }
}

/* 对勾样式 */
.check-icon {
  color: var(--gray-50); /* 银白对勾，对比黑色背景更清晰 */
  font-size: 12px;
  font-weight: bold;
}

/* 协议链接样式（核心修改） */
.link {
  color: var(--gray-700); /* 墨灰（比文字稍浅，区分链接） */
  /* 底部下划线 */
  border-bottom: 1px solid var(--gray-700);
  cursor: pointer; /* 按钮手型 */
  margin: 0 2px;
  /* 按钮交互优化：点击无选中效果 */
  user-select: none;
  /* 轻微padding，扩大点击区域 */
  padding-bottom: 1px;
  /* 悬浮效果 */
  transition: all 0.2s ease;
}
/* 关键：阻止冒泡（避免点击链接时触发协议勾选） */
.link {
  pointer-events: auto;
}

/* 底部按钮区域 */
.footer-btn {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 12px 16px 30px; /* 上抬 30px + 按钮自身高度 */
  background-color: var(--bg-color);
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.06);
}

.pay-button {
  width: 100%;
  height: 48px;
  border-radius: 24px; /* 圆角按你提供的24px */
  font-size: 16px;
  font-weight: bold;
  border: none;
  outline: none;
  cursor: pointer;
  transition: all 0.2s ease; /* 加过渡，切换更丝滑 */
  /* 正常启用状态（你提供的样式） */
  background-color: var(--primary-color); /* #434a50 */
  color: var(--gray-50); /* 银白文字 */
}

/* 默认禁用状态（背景和文字颜色反过来） */
.pay-button.disabled {
  background-color: var(--gray-400);
  color: var(--primary-color);
  opacity: 0.8;
}
</style>