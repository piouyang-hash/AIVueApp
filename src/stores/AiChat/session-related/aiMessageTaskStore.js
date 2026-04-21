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
        console.log('=== 添加会话任务开始 ===');
        console.log('传入会话ID:', sessionUuid);
        console.log('传入任务ID:', taskId);

        // 校验参数
        if (!sessionUuid || !taskId) {
            console.log('❌ 参数缺失，会话ID或任务ID为空，终止添加');
            console.log('=== 添加会话任务结束 ===\n');
            return;
        }

        // 初始化会话任务数组
        if (!sessionTaskMap.value[sessionUuid]) {
            console.log('ℹ️ 该会话暂无任务列表，初始化空数组');
            sessionTaskMap.value[sessionUuid] = [];
        }

        // 打印当前会话原有任务列表
        console.log('添加前 - 当前会话任务列表:', sessionTaskMap.value[sessionUuid]);

        // 追加新任务（状态：进行中）
        const newTask = {
            taskId,
            status: 'pending',
            createTime: Date.now()
        };
        sessionTaskMap.value[sessionUuid].unshift(newTask);

        console.log('✅ 新任务添加成功:', newTask);
        console.log('添加后 - 当前会话任务列表:', sessionTaskMap.value[sessionUuid]);
        console.log('=== 添加会话任务结束 ===\n');
    }
    /**
     * 3. 获取【当前会话】的 进行中任务（重回聊天页 → 重连WebSocket用）
     * @return { taskId: string | null, status: string | null }
     */
    const getCurrentPendingTask = computed(() => {
        const sid = baseSession.currentSessionUuid
        const taskList = sessionTaskMap.value[sid] || []
        // 找到第一个未完成的任务
        const pendingTask = taskList.find(item => item.status === 'pending')
        return pendingTask || { taskId: null, status: null }
    })

    /**
     * 2. 更新任务状态（AI流式结束时调用）
     * @param {string} sessionUuid - 会话ID
     * @param {string} taskId - 任务ID
     * @param {'pending' | 'finished' | 'canceled'} status - 新状态
     */
    const updateSessionTaskStatus = (sessionUuid, taskId, status) => {
        // 🔥 调试打印1：输出函数调用的所有入参
        console.log('=== 更新任务状态开始 ===');
        console.log('会话ID(sessionUuid):', sessionUuid);
        console.log('任务ID(taskId):', taskId);
        console.log('目标状态(status):', status);

        const taskList = sessionTaskMap.value[sessionUuid];
        // 🔥 调试打印2：输出当前会话的任务列表
        console.log('当前会话的任务列表:', taskList);

        if (!taskList) {
            console.log('❌ 未找到该会话的任务列表，会话ID：', sessionUuid);
            return;
        }

        const task = taskList.find(item => item.taskId === taskId);
        // 🔥 调试打印3：输出找到的任务
        console.log('查找到的任务:', task);

        if (task) {
            console.log('✅ 找到任务，原状态：', task.status, '，即将更新为：', status);
            task.status = status;
            console.log('✅ 任务状态更新完成！最终任务：', task);
        } else {
            console.log('❌ 未找到对应任务，任务ID：', taskId);
        }

        console.log('=== 更新任务状态结束 ===\n');
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
        if (sessionTaskMap.value[sessionUuid]) {
            sessionTaskMap.value[sessionUuid] = []
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
        sessionTaskMap,
        addSessionTask,
        getCurrentPendingTask,
        updateSessionTaskStatus,
        clearSessionTasks,
        clearAllSessionTasks
    }
})