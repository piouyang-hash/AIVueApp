<template>
  <MyWalletLayout>
    <div class="recharge-agreement-page">
      <!-- 头部（保留你指定的PageHeader，标题已填） -->
      <PageHeader title="充值服务协议" @back="handleBack"/>

      <!-- 协议内容容器（可滚动） -->
      <div class="agreement-content">
        <!-- 协议前言 -->
        <div class="agreement-preamble">
          <p>
            欢迎你使用本平台的充值服务（以下简称“本服务”）。本协议是你与本平台之间关于使用充值服务所订立的有效合约。通过点击“同意”或使用本服务，即表示你已阅读并同意本协议的全部条款。如果你不同意本协议，请停止使用本服务。</p>
        </div>

        <!-- 协议章节1：服务范围 -->
        <div class="agreement-chapter">
          <h3 class="chapter-title">一、服务范围</h3>
          <ul class="chapter-content">
            <li>1.1
              本平台充值服务（以下简称“充值服务”）指用户通过本平台支持的支付方式（微信支付、支付宝等）向自身账号充值虚拟货币/金额的服务。
            </li>
            <li>1.2
              充值后的金额仅可用于本平台内的指定消费场景（如打赏作者、购买会员、解锁内容等），不可提现、转让或兑换为法定货币。
            </li>
          </ul>
        </div>

        <!-- 协议章节2：充值规则 -->
        <div class="agreement-chapter">
          <h3 class="chapter-title">二、充值规则</h3>
          <ul class="chapter-content">
            <li>2.1 用户可选择平台提供的固定充值挡位，也可自定义充值金额（自定义金额需≥1元，且为整数）。</li>
            <li>2.2 充值请求提交后，平台将在1-5分钟内完成金额到账；若超过10分钟未到账，请联系平台客服核实。</li>
            <li>2.3
              因用户自身原因（如支付账号异常、网络中断、误操作等）导致充值失败的，平台不承担责任，用户可通过支付渠道查询退款情况。
            </li>
          </ul>
        </div>

        <!-- 协议章节3：退款规则 -->
        <div class="agreement-chapter">
          <h3 class="chapter-title">三、退款说明</h3>
          <ul class="chapter-content">
            <li>3.1 充值金额一旦到账，除法律法规另有规定外，不支持退款、提现或转让。</li>
            <li>3.2
              因平台系统故障导致充值金额重复到账或未到账的，平台有权追回多充金额或补充未到账金额，用户需配合核实相关信息。
            </li>
            <li>3.3 未成年人充值的，需由法定监护人联系平台客服，并提供有效证明材料，平台将根据实际情况酌情处理。</li>
          </ul>
        </div>

        <!-- 协议章节4：用户责任 -->
        <div class="agreement-chapter">
          <h3 class="chapter-title">四、用户责任</h3>
          <ul class="chapter-content">
            <li>4.1 用户需妥善保管自身账号及支付信息，因账号被盗、密码泄露等导致的充值损失，平台不承担赔偿责任。</li>
            <li>4.2
              禁止用户通过非法途径（如盗刷、套现、恶意退款等）使用充值服务，一经发现，平台有权冻结账号、扣除违规金额，并保留追究法律责任的权利。
            </li>
          </ul>
        </div>

        <!-- 协议章节5：协议变更 -->
        <div class="agreement-chapter">
          <h3 class="chapter-title">五、协议变更与生效</h3>
          <ul class="chapter-content">
            <li>5.1 平台有权根据业务发展需要修改本协议条款，修改后的协议将在平台公示，公示后7日自动生效。</li>
            <li>5.2 用户继续使用充值服务的，视为接受修改后的协议；若不接受，应停止使用本服务。</li>
            <li>5.3 本协议的解释权归本平台所有，若用户与平台发生争议，可通过协商、投诉或诉讼方式解决。</li>
          </ul>
        </div>

        <!-- 协议底部说明 -->
        <div class="agreement-footer">
          <p class="footer-text">本协议自发布之日起生效，如有疑问请联系平台客服：400-xxxx-xxxx</p>
        </div>
      </div>
    </div>
  </MyWalletLayout>
</template>

<script setup>
// 返回按钮逻辑（你可根据项目路由调整）
import PageHeader from "@/components/Tiny/PageHeader.vue";


import { useRouter } from 'vue-router'
import MyWalletLayout from "@/components/MyPage/MyHomePageComponents/MyWalletComponents/MyWalletLayout.vue";
// 实例化router
const router = useRouter()

const handleBack = () => {
  router.back()
}
</script>

<style scoped>
/* 页面容器 */
.recharge-agreement-page {
  min-height: 100vh;
  background-color: var(--bg-color);
}

/* 协议内容容器（可滚动，适配小屏） */
.agreement-content {
  padding: 20px 16px;
  max-width: 800px;
  margin: 0 auto;
  background-color: var(--gray-100);
  border-radius: 8px;
  margin: 16px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

/* 协议前言 */
.agreement-preamble {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.8;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--gray-200);
}

/* 章节标题 */
.chapter-title {
  font-size: 16px;
  color: var(--text-primary);
  font-weight: bold;
  margin: 20px 0 12px 0;
}

/* 章节内容 */
.chapter-content {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.8;
  padding-left: 20px;
  margin: 0;
}

.chapter-content li {
  margin-bottom: 8px;
}

/* 协议底部 */
.agreement-footer {
  margin-top: 32px;
  padding-top: 16px;
  border-top: 1px solid var(--gray-200);
}

.footer-text {
  font-size: 12px;
  color: var(--text-tertiary);
  text-align: center;
  line-height: 1.6;
}

/* 滚动条样式优化（贴合灰度风格） */
.agreement-content::-webkit-scrollbar {
  width: 6px;
}

.agreement-content::-webkit-scrollbar-track {
  background: var(--gray-200);
  border-radius: 3px;
}

.agreement-content::-webkit-scrollbar-thumb {
  background: var(--gray-400);
  border-radius: 3px;
}

.agreement-content::-webkit-scrollbar-thumb:hover {
  background: var(--gray-500);
}
</style>