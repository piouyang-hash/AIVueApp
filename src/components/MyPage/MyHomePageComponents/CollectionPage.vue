<template>
  <MyPageLayout>
    <div class="collection-page">
      <!-- 页面头部 -->
      <PageHeader title="我的收藏" @back="handleBack"/>

      <!-- 空收藏状态 -->
      <div class="empty-collection">
        <p class="empty-text">你还没有收藏任何书籍</p>
        <p class="empty-tip">快去图书馆收藏喜欢的书籍吧~</p>
      </div>
    </div>
  </MyPageLayout>
</template>

<script setup>
import { useRouter } from 'vue-router'
import PageHeader from "@/components/Tiny/PageHeader.vue";
import MyPageLayout from "@/components/MyPage/MyPageLayout.vue";

const router = useRouter()

// 返回上一页
const handleBack = () => {
  router.push({ name: 'MyHomePageMain' })
}
</script>

<style scoped>

.empty-collection {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 20px;
}

.empty-text {
  font-size: 18px;
  color: var(--text-primary);
  margin-bottom: 12px;
  font-weight: 500;
}

.empty-tip {
  font-size: 14px;
  color: var(--text-secondary);
}
</style>