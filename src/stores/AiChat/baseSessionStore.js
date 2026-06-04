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

    // ====================== 🔥 新增三个核心方法 ======================
    /**
     * 1. 关闭所有会话
     * 将所有会话的状态统一修改为 CLOSED
     */
    const closeAllSessions = () => {
        if (!chatList.value.length) return
        chatList.value.forEach(item => {
            item.status = 'CLOSED'
        })
        console.log('✅ 已关闭所有会话')
    }

    /**
     * 2. 激活单个会话
     * @param {string} sessionUuid - 要激活的会话UUID
     */
    const activateSingleSession = (sessionUuid) => {
        if (!sessionUuid) {
            console.warn('激活失败：缺少会话UUID')
            return
        }
        const targetSession = chatList.value.find(item => item.sessionUuid === sessionUuid)
        if (targetSession) {
            targetSession.status = 'ACTIVE'
            console.log(`✅ 已激活会话：${sessionUuid}`)
        } else {
            console.warn(`激活失败：未找到会话 ${sessionUuid}`)
        }
    }

    /**
     * 3. 仅激活指定一个会话（关闭全部 + 激活当前）
     * @param {string} sessionUuid - 要唯一激活的会话UUID
     */
    const activateOnlyOneSession = (sessionUuid) => {
        if (!sessionUuid) {
            console.warn('唯一激活失败：缺少会话UUID')
            return
        }
        // 先关闭所有
        closeAllSessions()
        // 再激活指定会话
        activateSingleSession(sessionUuid)
        console.log(`✅ 已唯一激活会话：${sessionUuid}`)
    }

    // ====================== 🔥 新增：置顶/取消置顶 专用方法 ======================
    /**
     * 更新单个会话的信息（支持置顶、修改属性等）
     * @param {string} sessionUuid - 会话ID
     * @param {object} updateData - 要更新的数据 { isTop: 1, topAt: 'xxx' }
     */
    const updateSession = (sessionUuid, updateData) => {
        // 找到 Pinia 里的源会话对象
        const targetSession = chatList.value.find(item => item.sessionUuid === sessionUuid)
        if (targetSession) {
            // 批量更新属性（响应式更新，切页不会丢失）
            Object.assign(targetSession, updateData)
            console.log(`✅ Pinia 会话已同步更新：${sessionUuid}`, updateData)
        }
    }

    // 暴露所有数据和方法
    return {
        chatList,
        currentSessionUuid,
        sessionLastMessage,
        fetchUserSessions,
        setCurrentSessionUuid,
        updateSessionLastMessage,
        // 🔥 新增导出
        closeAllSessions,
        activateSingleSession,
        activateOnlyOneSession,
        updateSession,
    }
})