// 导入Pinia创建仓库的方法 + Vue响应式API
import { defineStore } from 'pinia'
import {ref} from 'vue'
import {getUserNormalSessions} from "@/services/ai_chat.session.service.js";

// 创建会话仓库
export const useBaseSessionStore = defineStore('baseSession', () => {
    // 1. 会话列表（原有）
    const chatList = ref([])

    // 2. 当前选中的会话UUID（原有）
    const currentSessionUuid = ref('')

    // ✅【你要的新数据结构】会话UUID => 最后一条消息 键值对映射
    const sessionLastMessage = ref({})

    // 原有：获取会话列表
    // 🔥 修改后：有数据就不请求接口（会话列表）
    const fetchUserSessions = async () => {
        // ✅ 修复1：ref 数组判断必须加 .value
        if (chatList.value && chatList.value.length > 0) {
            return;
        }

        const realSessionData = await getUserNormalSessions()
        chatList.value = realSessionData || []

        // 已填充过最后消息，直接跳过
        if (Object.keys(sessionLastMessage.value).length > 0) {
            return;
        }

        // 初始化并赋值最后消息
        sessionLastMessage.value = {}
        if (realSessionData?.length) {
            realSessionData.forEach(item => {
                sessionLastMessage.value[item.sessionUuid] = item.lastMessageContent
            })
        }
    }

    /**
     * 更新指定会话的最后一条消息
     * @param {string} sessionUuid - 会话唯一ID
     * @param {string} content - 新的最后消息内容
     */
    const updateSessionLastMessage = (sessionUuid, content) => {
        // 校验：必须传入会话UUID，否则不执行
        if (!sessionUuid) {
            console.warn('更新失败：缺少会话UUID');
            return;
        }

        // ✅ 修复2：ref 对象赋值必须加 .value
        sessionLastMessage.value[sessionUuid] = content;
    };

    // 原有：设置当前会话UUID
    const setCurrentSessionUuid = (uuid) => {
        currentSessionUuid.value = uuid
        console.log('已设置当前会话UUID：', uuid)
    }

    // 暴露所有数据和方法
    return {
        chatList,
        currentSessionUuid,
        sessionLastMessage,
        fetchUserSessions,
        setCurrentSessionUuid,
        updateSessionLastMessage,
    }
})