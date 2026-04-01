<template>
  <MyPageLayout>
    <MyHomeHeader/>
    <UserProfile/>
    <FunctionButton/>

  </MyPageLayout>
</template>

<script setup>
import UserProfile from "@/components/MyPage/MyHomePageComponents/MyHomePageMainComponents/UserProfile.vue";
import FunctionButton from "@/components/MyPage/MyHomePageComponents/MyHomePageMainComponents/FunctionButton.vue";
import MyHomeHeader from "@/components/MyPage/MyHomePageComponents/MyHomePageMainComponents/MyHomeHeader.vue";

import MyPageLayout from "@/components/MyPage/MyPageLayout.vue";
defineOptions({
  name: 'MyHomePageMain'
})
</script>

<style scoped>
</style>