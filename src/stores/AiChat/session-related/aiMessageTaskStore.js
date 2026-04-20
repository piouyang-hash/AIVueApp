// 导入Pinia创建仓库的方法 + Vue响应式API
import { defineStore } from 'pinia'
import {computed, ref} from 'vue'
import {useBaseSessionStore} from "@/stores/AiChat/baseSessionStore.js";

// 创建会话仓库
export const useAiMessageTaskStore = defineStore('aiMessageTask', () => {

    const baseSession = useBaseSessionStore()

    // ====================== 🔥 新增：流式任务管理核心存储 ======================
    /**
     * 数据结构设计（完美匹配你的需求）
     * key: sessionUuid  （会话唯一标识）
     * value: Array<{
     *   taskId: string,        // 流式任务唯一ID
     *   status: 'pending' | 'finished',  // 任务状态：进行中/已结束
     *   createTime: number     // 任务创建时间
     * }>
     * 作用：一个会话下可以有多个流式任务，退出页面不丢失，重回页面可重连
     */
    const sessionTaskMap = ref({})

    /**
     * 1. 【改造核心】添加/绑定 会话的流式任务（新任务自动取消旧任务）
     * 新任务到来 → 先取消当前会话所有进行中任务 → 再添加新任务
     */
    const addSessionTask = (sessionUuid, taskId) => {
        if (!sessionUuid || !taskId) return

        // 🔥 关键：添加新任务前，先取消该会话所有【进行中】的旧任务（匹配后端打断）
        // 这个会导致接收不到后端的后续消息（因为有回写逻辑）
        // 注释掉，就可以了，但是不清楚有没有逻辑bug，现在没有测试出来
        // cancelAllPendingTasks(sessionUuid)

        // 初始化会话任务数组
        if (!sessionTaskMap[sessionUuid]) {
            sessionTaskMap[sessionUuid] = []
        }

        // 追加新任务（状态：进行中）
        sessionTaskMap[sessionUuid].unshift({
            taskId,
            status: 'pending',
            createTime: Date.now()
        })
    }

    /**
     * 3. 获取【当前会话】的 进行中任务（重回聊天页 → 重连WebSocket用）
     * @return { taskId: string | null, status: string | null }
     */
    const getCurrentPendingTask = computed(() => {
        const sid = baseSession.currentSessionUuid
        const taskList = sessionTaskMap[sid] || []
        // 找到第一个未完成的任务
        const pendingTask = taskList.find(item => item.status === 'pending')
        return pendingTask || { taskId: null, status: null }
    })

    /**
     * 2. 更新任务状态（AI流式结束时调用）
     * @param {string} sessionUuid - 会话ID
     * @param {string} taskId - 任务ID
     * @param {'pending' | 'finished'} status - 新状态
     */
    const updateSessionTaskStatus = (sessionUuid, taskId, status) => {
        const taskList = sessionTaskMap[sessionUuid]
        if (!taskList) return

        const task = taskList.find(item => item.taskId === taskId)
        if (task) {
            task.status = status
        }
    }

    /**
     * 【新增】便捷方法：直接将任务标记为【已取消】
     */
    const cancelSessionTask = (sessionUuid, taskId) => {
        updateSessionTaskStatus(sessionUuid, taskId, 'canceled')
    }

    /**
     * 4. 清空指定会话的所有任务
     */
    const clearSessionTasks = (sessionUuid) => {
        if (sessionTaskMap[sessionUuid]) {
            sessionTaskMap[sessionUuid] = []
        }
    }

    /**
     * 5. 清空所有任务（退出登录用）
     */
    const clearAllSessionTasks = () => {
        sessionTaskMap.value = {}
    }

    // 暴露所有数据和方法
    return {
        // ======================================
        // 🔥 10. AI任务管理（流式/任务）
        // ======================================
        sessionTaskMap,          // 会话任务映射
        addSessionTask,          // 添加会话任务
        getCurrentPendingTask,   // 获取当前待处理任务
        updateSessionTaskStatus, // 更新任务状态
        clearSessionTasks,       // 清空会话任务
        clearAllSessionTasks     // 清空所有会话任务
    }
})