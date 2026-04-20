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
        // ✅【核心新增】开头判断：已有数据，直接return，不发请求
        if (chatList && chatList.length > 0) {
            console.log('会话列表已有数据，跳过接口请求');
            return;
        }

        console.log('开始调用getUserNormalSessions接口...')
        const realSessionData = await getUserNormalSessions()
        console.log('从接口获取的正常会话数据：', realSessionData)
        chatList.value = realSessionData || []

        // 原有逻辑：判断是否已经填充过，已填充则直接跳过
        if (Object.keys(sessionLastMessage).length > 0) {
            console.log('sessionLastMessage 已初始化，跳过填充');
            return;
        }

        // 未填充过，才执行首次赋值
        sessionLastMessage.value = {}
        if (realSessionData?.length) {
            realSessionData.forEach(item => {
                sessionLastMessage[item.sessionUuid] = item.lastMessageContent
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

        // 核心：直接修改响应式对象（自动触发视图更新）
        // 即使会话UUID不存在，也会自动新增键值对，兼容新会话
        sessionLastMessage[sessionUuid] = content;
    };

    // 原有：设置当前会话UUID
    const setCurrentSessionUuid = (uuid) => {
        currentSessionUuid.value = uuid
        console.log('已设置当前会话UUID：', uuid)
    }

    // 暴露所有数据和方法
    return {
        // ======================================
        // 🔥 1. 核心列表数据（页面主数据）
        // ======================================
        chatList,                // 会话列表

        // ======================================
        // 🔥 2. 当前选中状态（页面激活项）
        // ======================================
        currentSessionUuid,      // 当前会话ID

        // ======================================
        // 🔥 3. 消息数据存储（所有聊天消息）
        // =====================================
        sessionLastMessage,      // 会话最后一条消息

        // ======================================
        // 🔥 7. 数据获取（接口请求）
        // ======================================
        fetchUserSessions,       // 获取用户会话列表

        // ======================================
        // 🔥 8. 会话核心操作
        // ======================================
        setCurrentSessionUuid,   // 设置当前会话ID
        updateSessionLastMessage,// 更新会话最后一条消息
    }
})