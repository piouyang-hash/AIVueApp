<template>
  <MyPageLayout>
    <div class="change-email-page">
      <!-- 页面头部 -->
      <PageHeader title="修改邮箱" @back="handleBack"/>

      <!-- 拆分后的两个组件 -->
      <div class="email-form">
        <!-- 步骤1：验证原邮箱（初始显示） -->
        <VerifyOldEmail
            v-if="currentStep === 1"
            @verifySuccess="handleOldEmailVerifySuccess"
            :form-data="formData"
        />
        <!-- 步骤2：设置新邮箱（验证通过后显示） -->
        <SetNewEmail
            v-if="currentStep === 2"

            :form-data="formData"
            @modifySuccess="handleModifySuccess"
        />
        <!--      :old-verify-token="oldEmailVerifyToken"-->
      </div>
    </div>
  </MyPageLayout>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import PageHeader from "@/components/Tiny/PageHeader.vue";
import SetNewEmail
  from "@/components/MyPage/MyHomePageComponents/MySettingPageComponents/ChangeEmailComponents/SetNewEmail.vue";
import VerifyOldEmail
  from "@/components/MyPage/MyHomePageComponents/MySettingPageComponents/ChangeEmailComponents/VerifyOldEmail.vue";
import MyPageLayout from "@/components/MyPage/MyPageLayout.vue";


// 1. 路由实例（handleBack用）
const router = useRouter();

// 2. 流程步骤（互斥核心：1=验证原邮箱，2=设置新邮箱）
const currentStep = ref(1);

// 3. 原邮箱验证通过的临时凭证（传给新邮箱组件）
const oldVerifyToken = ref('');

// 4. 表单数据（存储两个组件的输入内容）
const formData = ref({
  oldEmailCode: '', // 原邮箱验证码
  newEmail: '',     // 新邮箱地址
  newEmailCode: ''  // 新邮箱验证码
});

// 5. 定义模板中绑定的handleBack方法（返回上一页）
const handleBack = () => {
  router.push({ name: 'MySettingMain' });
};

// 6. 定义模板中绑定的handleOldEmailVerifySuccess方法（原邮箱验证成功后触发）
const handleOldEmailVerifySuccess = (token) => {
  // 存储后端返回的验证凭证
  // oldVerifyToken.value = token;
  // 切换到新邮箱步骤
  currentStep.value = 2;
};

// 7. 定义模板中绑定的handleModifySuccess方法（新邮箱修改成功后触发）
const handleModifySuccess = () => {
  // 提示成功 + 返回设置页
  alert('邮箱修改成功！');
  handleBack();
};
</script>

<style scoped>
.email-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 16px 0;
}
</style>