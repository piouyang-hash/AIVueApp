<template>
  <MyPageLayout>
    <div class="edit-profile-page">
      <!-- 页面头部 -->
      <PageHeader title="修改个人信息" @back="handleBack"/>

      <!-- 表单主体 -->
      <div class="profile-form">
        <!-- 头像区域 -->
        <div class="form-card avatar-item">
          <label class="form-label">头像</label>
          <div class="avatar-container">
            <!-- 当前头像（优先使用store中的头像） -->
            <div class="current-avatar">
              <img
                  :src="tempEditInfo.avatarUrl
                 ? (tempEditInfo.avatarUrl.startsWith('data:image')
                 ? tempEditInfo.avatarUrl
                 : `${SERVICE_URLS.USER_SERVICE}${tempEditInfo.avatarUrl}`)
                 : defaultAvatar"
                  alt="当前头像"
                  class="avatar-img"
              />
            </div>
            <!-- 更换头像按钮 -->
            <label class="change-avatar-btn">
              <input
                  type="file"
                  accept="image/*"
                  class="avatar-input"
                  @change="handleAvatarChange"
              />
              <span>更换头像</span>
            </label>
          </div>
        </div>

        <!-- 昵称输入（绑定store数据+点击选中全部文字） -->
        <div class="form-card">
          <label class="form-label">昵称</label>
          <input
              type="text"
              class="form-input"
              placeholder="请输入昵称"
              v-model="tempEditInfo.nickname"
              @click="selectAllText"
          />
        </div>

        <!-- 简介输入（绑定store数据+动态字数统计+点击选中全部文字） -->
        <div class="form-card">
          <label class="form-label">个人简介</label>
          <textarea
              class="form-textarea"
              placeholder="请输入个人简介（最多50字）"
              rows="3"
              maxlength="50"
              v-model="tempEditInfo.description"
              @input="updateWordCount"
              @click="selectAllText"
          ></textarea>
          <span class="word-count">{{ currentWordCount }}/50</span>
        </div>

        <!-- 提交按钮 -->
        <div class="form-submit">
          <button class="submit-btn" @click="handleSave">保存修改</button>
        </div>
      </div>
    </div>
  </MyPageLayout>
</template>

<script setup>
// 关键：先导入本地默认头像（解决直接写路径不生效的坑）
import defaultAvatar from '@/static/images/avatar-default.png';
import { useRouter } from 'vue-router'
import {ref, onMounted, reactive} from 'vue'
import { useUserStore } from '@/stores/user' // 导入Pinia的user store
import PageHeader from "@/components/Tiny/PageHeader.vue"
import {SERVICE_URLS} from "@/api/constants/serviceUrls.js";
import {updateProfileAndSync} from "@/services/user.action.service.js";
import { useToastStore } from '@/stores/toastStore'
import MyPageLayout from "@/components/MyPage/MyPageLayout.vue";

const toast = useToastStore()
const router = useRouter()
const userStore = useUserStore() // 获取user store实例
const currentWordCount = ref(0)

// 初始化：因为userInfo肯定有数据，直接处理字数统计
onMounted(() => {
  currentWordCount.value = userStore.userInfo.bio?.length || 0
})

// 点击切换：选中所有文字 / 取消选中（光标移到末尾）
const selectAllText = (e) => {
  const target = e.target
  // 判断是否已经全选
  const isAllSelected = target.selectionStart === 0 && target.selectionEnd === target.value.length

  if (isAllSelected) {
    // 已全选 → 取消选中，光标移到文本末尾
    target.selectionStart = target.selectionEnd = target.value.length
  } else {
    // 未全选 → 选中所有文字
    target.select()
  }
}

// 返回按钮逻辑
const handleBack = () => {
  router.push({ name: 'MySettingMain' })
}


// 定义临时变量对象，直接从Pinia赋值初始化
const tempEditInfo = reactive({
  nickname: userStore.userInfo.nickname || '',
  description: userStore.userInfo.bio || '',
  avatarUrl: userStore.userInfo.avatarUrl || '',
  avatarFile: null
})

// 更新简介字数统计
const updateWordCount = () => {
  currentWordCount.value = tempEditInfo.description.length || 0
}

// 头像上传处理：修改tempEditInfo.avatarUrl
const handleAvatarChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    tempEditInfo.avatarFile = file
    const reader = new FileReader()
    reader.onload = (event) => {
      tempEditInfo.avatarUrl = event.target.result // 直接改reactive对象属性
    }
    reader.readAsDataURL(file)
  }
}

// 保存修改逻辑（严格适配后端接口）
// 保存修改逻辑
const handleSave = async () => {
  try {
    // 组件内的调用逻辑（改造后）
    const userProfileObj = {
      id: userStore.userInfo.id,
      userId: userStore.userId,
      nickname: tempEditInfo.nickname,
      bio: tempEditInfo.description
    };

    // 直接传 userProfileObj + 头像文件（可选）
    await updateProfileAndSync(userProfileObj, tempEditInfo.avatarFile);

    // 3. 弹出弹窗
    toast.show('资料更新成功！',"success")


  } catch (error) {
    console.error('❌ 更新失败：', error.response?.data?.message || error.message);
  }
};
</script>

<style scoped>

.profile-form {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 统一表单卡片 */
.form-card {
  background-color: var(--card-bg);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px var(--shadow-color);
  border: 1px solid var(--border-color);
  transition: background-color 0.2s ease;
}

.form-card:hover {
  background-color: var(--card-hover);
}

.form-label {
  display: block;
  font-size: 15px;
  color: var(--text-primary);
  margin-bottom: 12px;
  font-weight: 500;
}

/* 头像区域 */
.avatar-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.avatar-container {
  display: flex;
  align-items: center;
  gap: 20px;
}

.current-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--border-color);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.change-avatar-btn {
  padding: 8px 16px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.change-avatar-btn:hover {
  filter: brightness(0.9);
  transform: translateY(-1px);
}

.avatar-input {
  display: none;
}

/* 输入框 & 文本域 */
.form-input,
.form-textarea {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background-color: var(--gray-50);
  color: var(--text-primary);
  font-size: 15px;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: var(--text-tertiary);
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color) 20%, transparent);
}

.form-textarea {
  resize: none;
}

.word-count {
  display: block;
  text-align: right;
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 6px;
}

/* 提交区域 */
.form-submit {
  margin-top: 8px;
  text-align: center;
}

.submit-btn {
  width: 100%;
  padding: 16px 0;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px color-mix(in srgb, var(--primary-color) 15%, transparent);
}

.submit-btn:hover {
  filter: brightness(0.9);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px color-mix(in srgb, var(--primary-color) 20%, transparent);
}

.submit-btn:active {
  transform: translateY(0);
}
</style>