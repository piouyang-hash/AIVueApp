// 导入Pinia创建仓库的方法 + Vue响应式API
import { defineStore } from 'pinia'
import {computed, ref} from 'vue'
import {getChatMessages, getUserNormalSessions} from "@/services/ai_chat.session.service.js";
import {getMyAiRoleList} from "@/services/ai_chat.role.service.js";

// 创建会话仓库
export const useSessionStore = defineStore('session', () => {
    // 1. 会话列表（原有）
    const chatList = ref([])
    // 2. 当前选中的会话UUID（原有）
    const currentSessionUuid = ref('')

    const isThinkMode = ref(false)      // 全局：思考模式
    const isNetworkMode = ref(false)    // 全局：联网模式

    // 🔥 【新增】AI角色列表（你的需求）
    const aiRoleList = ref([])

    // 🔥 【新增】当前选中的角色ID（参照你写法来的）
    const currentRoleId = ref(null)

    // 🔥 新增：当前展开的角色ID（控制下拉会话）
    const expandedRoleId = ref(null);

    // 🔥 核心新增：会话消息映射
    // 结构：{ sessionUuid1: [消息1, 消息2], sessionUuid2: [消息数组] }
    const sessionMessages = ref({})

    const BASE_HEIGHT = 40              // 全局：输入框基础高度（统一维护）

    // ==============================================
    // 🔥 核心新增：会话输入框配置映射
    // 结构：{ sessionUuid: { inputValue: 输入内容, inputHeight: 输入框高度 } }
    // 一个ID 精准对应 一组输入框参数！
    // ==============================================
    const sessionInputConfig = ref({})


    // 🔥 核心解耦：独立存储【每个会话正在流式回复的AI消息】
    // 结构：{ sessionUuid1: 单条AI流式消息, sessionUuid2: 单条AI流式消息 }
    // 规则：一个会话同一时间只会有一条AI正在回复，一对一存储
    const streamingAiMessage = ref({})

    // 🔥 逆天核心：自动合并【历史消息 + 流式消息】计算属性
    // 规则：同一个UUID → 历史消息数组 + 追加流式消息（如果存在）
    // 结构：{ sessionUuid: [完整消息列表] }
    const mergedSessionMessages = computed(() => {
        // 创建合并后的结果对象
        const merged = {}

        // 遍历所有历史会话消息
        Object.keys(sessionMessages.value).forEach(sessionUuid => {
            // 1. 获取当前会话的历史消息数组
            const historyMessages = sessionMessages.value[sessionUuid] || []
            // 2. 获取当前会话的流式AI消息（0或1条）
            const streamingMsg = streamingAiMessage.value[sessionUuid]

            // 3. 合并：历史消息 + 流式消息（有就追加，没有就原样）
            merged[sessionUuid] = streamingMsg
                ? [...historyMessages, streamingMsg]
                : [...historyMessages]
        })

        return merged
    })

    // 🔥 便捷方法：获取【当前会话】合并后的完整消息列表（组件直接用）
    const getCurrentMergedMessages = computed(() => {
        const uuid = currentSessionUuid.value
        return mergedSessionMessages.value[uuid] || []
    })

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

    // 原有：获取会话列表
    const fetchUserSessions = async () => {
        console.log('开始调用getUserNormalSessions接口...')
        const realSessionData = await getUserNormalSessions()
        console.log('从接口获取的正常会话数据：', realSessionData)
        chatList.value = realSessionData || []
    }

    // 🔥 【新增】获取我的AI角色列表（完全对标你的原有方法）
    const fetchMyAiRoleList = async () => {
        console.log('开始调用getMyAiRoleList接口...')
        const realRoleData = await getMyAiRoleList()
        console.log('从接口获取的AI角色数据：', realRoleData)
        aiRoleList.value = realRoleData || []
    }

    // 🔥 核心：computed 自动构建【roleId => 会话数组】映射
    // 自动依赖 chatList，数据变化时实时更新！
    const roleSessionMap = computed(() => {
        const map = {}
        // 遍历所有会话，按角色ID分组
        chatList.value.forEach(session => {
            const roleId = session.roleId
            // 不存在则初始化空数组
            if (!map[roleId]) {
                map[roleId] = []
            }
            // 推入当前会话（包含sessionUuid/roleId等全部信息）
            map[roleId].push(session)
        })
        return map
    })

    // 原有：设置当前会话UUID
    const setCurrentSessionUuid = (uuid) => {
        currentSessionUuid.value = uuid
        console.log('已设置当前会话UUID：', uuid)
    }

    // 🔥 【新增】设置当前选中角色ID（完全对标你的格式）
    const setCurrentRoleId = (roleId) => {
        currentRoleId.value = roleId
    }

    /**
     * 设置【占位符会话】
     * @param {string} sessionUuid - 传入的会话UUID
     * @description 创建仅包含会话ID+角色ID的极简占位会话，推入聊天列表，自动去重
     */
    const setPlaceholderSession = (sessionUuid) => {
        // 安全校验：传入的UUID不能为空
        if (!sessionUuid) return

        // 🔴 核心去重：字段改成 sessionUuid（和你查找的字段完全一致）
        const isExist = chatList.value.some(item => item.sessionUuid === sessionUuid)
        if (isExist) return

        // 🎯 关键修复：字段名改成 sessionUuid，完美匹配你的 getAiAvatarUrl 查找逻辑
        const placeholderSession = {
            sessionUuid: sessionUuid,   // 👈 就改这里！和你原有代码完全对齐
            roleId: currentRoleId.value
        }

        // ✅ 将占位符添加到会话列表
        chatList.value.push(placeholderSession)

        // 自动将该占位符设为当前选中会话
        currentSessionUuid.value = sessionUuid
    }

    // 🔥 新增：切换角色展开/收起（核心方法）
    const toggleExpandRole = (roleId) => {
        // 点击当前已展开角色 → 收起；点击其他角色 → 展开新角色
        expandedRoleId.value = expandedRoleId.value === roleId ? null : roleId;
        // 同时设置当前选中角色
        setCurrentRoleId(roleId);
        console.log('切换角色展开状态，角色ID：', roleId);
    };

    // ====================== 【新增】根据UUID删除会话 ======================
    const deleteSessionByUuid = (sessionUuid) => {
        if (!sessionUuid) return

        // 1. 从会话列表中过滤掉当前删除的会话
        chatList.value = chatList.value.filter(item => item.sessionUuid !== sessionUuid)

        // 2. 如果删除的是当前选中的会话，清空选中状态
        if (currentSessionUuid.value === sessionUuid) {
            currentSessionUuid.value = ''
        }

        // 3. 清理该会话对应的消息数据（避免内存冗余）
        if (sessionMessages.value[sessionUuid]) {
            delete sessionMessages.value[sessionUuid]
        }

        // 4. 清理该会话对应的输入框配置数据
        if (sessionInputConfig.value[sessionUuid]) {
            delete sessionInputConfig.value[sessionUuid]
        }

        console.log(`会话【${sessionUuid}】删除并清理完成`);
    }

    // ==============================================
    // 🔥 新增1：给指定会话 设置/覆盖 完整消息数组
    // ==============================================
    const setSessionMessages = (sessionUuid, messagesArray) => {
        // 直接赋值：键是sessionUuid，值是消息数组
        sessionMessages.value[sessionUuid] = messagesArray || []
        console.log(`会话${sessionUuid} 消息数组已赋值：`, messagesArray)
    }

    // ==============================================
    // 🔥 新增2：给指定会话 追加单条消息（发消息时用）
    // ==============================================
    const pushMessageToSession = (sessionUuid, messageItem) => {
        // 🔧 核心处理：校验messageId，无则添加临时消息标记
        // 展开原消息所有标准字段，无messageId时自动追加 tempMessage: true
        const finalMessage = {
            ...messageItem,
            ...(!messageItem.messageId && { tempMessage: true })
        };

        // 如果这个会话还没有消息数组，先初始化空数组
        if (!sessionMessages.value[sessionUuid]) {
            sessionMessages.value[sessionUuid] = [];
        }

        // 追加处理完成的标准消息
        sessionMessages.value[sessionUuid].push(finalMessage);

        // 🔥 强制触发 Vue 响应式更新
        sessionMessages.value = { ...sessionMessages.value };
    };

    // 🔥 新增3：填充临时消息（接口返回真实消息后用）
    // 修正版：填充用户临时消息（仅处理USER角色，跳过AI，字段精准映射）
    const fillTempMessage = (sessionUuid, meta) => {
        // 1. 获取当前会话的消息列表，不存在则直接返回
        const messageList = sessionMessages.value[sessionUuid];
        if (!messageList || messageList.length === 0) return;

        // 2. 查找【用户临时消息】：
        //    ① 必须是 tempMessage: true
        //    ② 必须是 USER 角色（只处理用户消息，跳过AI）
        //    ③ 按创建时间升序，取最早的一条
        const tempMessage = messageList
            .filter(item => item.tempMessage === true && item.role === 'USER')
            .sort((a, b) => new Date(a.createTime) - new Date(b.createTime))[0];

        // 3. 没找到符合条件的用户临时消息，直接返回
        if (!tempMessage) return;

        // 4. 🔥 核心：精准填充字段（严格按你的要求映射，跳过aiMessageId）
        tempMessage.messageId = meta.userMessageId;    // userMessageId 改名 → messageId
        tempMessage.content = meta.userMessage;        // userMessage 赋值 → content（字段名保留content）
        tempMessage.parentMsgId = meta.parentMsgId;    // 填充父消息ID
        tempMessage.sessionUuid = meta.sessionUuid;    // 填充会话UUID
        tempMessage.userId = meta.userId;              // 填充用户ID

        // 5. 删除临时标记（核心）
        delete tempMessage.tempMessage;

        // 6. 强制触发 Vue 响应式更新
        sessionMessages.value = { ...sessionMessages.value };
    };

    // 🔥 修正：创建AI回复消息（新增 taskId 参数，外部传入）
    const createAiReplyMessage = (sessionUuid, meta, taskId) => {
        const aiMessage = {
            content: meta.aiReplyContent || '',
            role: 'ASSISTANT',
            createTime: new Date().toISOString(),
            messageId: meta.aiMessageId,
            parentMsgId: meta.parentMsgId,
            sessionUuid: meta.sessionUuid,
            // ✅ 修改：初始化为【对象数组】，前端生成时间戳
            splitContent: meta.aiReplyContent
                ? [{ content: meta.aiReplyContent, timestamp: Date.now() }]
                : [],
            isComplete: false,
            taskId: taskId, // 🔥 新增：存储任务ID，外部传参
        };

        streamingAiMessage.value[sessionUuid] = aiMessage;
        streamingAiMessage.value = { ...streamingAiMessage.value };

        return meta.aiMessageId;
    };

    // 🔥 修正：更新AI回复消息（新增 taskId 参数，接口统一）
    const updateAiReplyMessage = (sessionUuid, messageId, text, taskId) => {
        const aiMessage = streamingAiMessage.value[sessionUuid];
        if (!aiMessage || aiMessage.messageId !== messageId) return;

        aiMessage.content += text;
        // ✅ 修改：push【对象】，前端生成时间戳
        aiMessage.splitContent.push({ content: text, timestamp: Date.now() });
        streamingAiMessage.value = { ...streamingAiMessage.value };
    };

    // 🔥 修正：回写+清理流式消息（新增 taskId 参数，接口统一）
    const clearStreamingMessageByUuid = (sessionUuid, taskId) => {
        if (!sessionUuid || !streamingAiMessage.value[sessionUuid]) return;

        const completeMessage = streamingAiMessage.value[sessionUuid];
        // completeMessage.isComplete = true;

        // 调用你的方法写入历史
        pushMessageToSession(sessionUuid, completeMessage);

        delete streamingAiMessage.value[sessionUuid];
        streamingAiMessage.value = { ...streamingAiMessage.value };

        console.log(`✅ 流式消息[任务ID:${taskId}]已回写历史：会话【${sessionUuid}】`);
    };

    // ==============================================
    // 🔥 新增：清空所有会话的流式AI消息（全量清理，如退出登录、重置页面）
    // ==============================================
    const clearAllStreamingMessages = () => {
        streamingAiMessage.value = {};
        console.log('✅ 已清空所有会话的流式AI消息');
    }

    // ==============================================
    // 🔥 新增：设置【当前会话】的输入框内容/高度（无参数，自动用当前ID）
    // ==============================================
    const setCurrentSessionInput = (value = '', height = BASE_HEIGHT) => {
        const uuid = currentSessionUuid.value
        if (!uuid) return
        // 给当前会话绑定输入框参数
        sessionInputConfig.value[uuid] = {
            inputValue: value,
            inputHeight: height
        }
    }

    // ==============================================
    // 🔥 新增：重置【当前会话】的输入框（清空内容 + 恢复默认高度）
    // ==============================================
    const resetCurrentSessionInput = () => {
        const uuid = currentSessionUuid.value
        if (!uuid) return
        // 清空内容，高度恢复基础值
        sessionInputConfig.value[uuid] = {
            inputValue: '',
            inputHeight: BASE_HEIGHT
        }
        console.log(`会话${uuid} 输入框已重置`)
    }

    // ==============================================
    // 🔥 计算属性：当前会话的输入框配置（组件直接用）
    // ==============================================
    const currentInputConfig = computed(() => {
        const uuid = currentSessionUuid.value
        // 没有配置时返回默认值，防止报错
        return sessionInputConfig.value[uuid] || {
            inputValue: '',
            inputHeight: BASE_HEIGHT
        }
    })

    // 🔥 核心新增：无参数获取【当前会话】的消息列表
    // 组件直接调用，无需传参！内部自动用 currentSessionUuid
    // ==============================================
    const fetchCurrentSessionMessages = async () => {
        // 1. 自动获取当前选中的会话UUID（仓库内部取值，组件无传参）
        const sessionUuid = currentSessionUuid.value

        // 2. 安全判断：没有选中会话时直接终止
        if (!sessionUuid) {
            console.warn('未选中任何会话，无法获取消息');
            return;
        }

        try {
            console.log(`开始获取会话【${sessionUuid}】的消息...`);
            // 3. 调用你的接口（自动传当前sessionUuid）
            const messageList = await getChatMessages(sessionUuid);
            console.log(`会话【${sessionUuid}】消息获取成功：`, messageList);

            // 🔥 核心修改：调用统一的 set 方法赋值，不再直接操作 ref
            setSessionMessages(sessionUuid, messageList);
        } catch (error) {
            console.error(`获取会话【${sessionUuid}】消息失败：`, error);
            // 🔥 核心修改：失败时也调用 set 方法，赋值空数组
            setSessionMessages(sessionUuid, []);
        }
    }

    // 切换全局思考模式
    const toggleThinkMode = () => {
        isThinkMode.value = !isThinkMode.value
    }

    // 切换全局联网模式
    const toggleNetworkMode = () => {
        isNetworkMode.value = !isNetworkMode.value
    }

    /**
     * 1. 添加/绑定 会话的流式任务（发送AI消息时调用）
     * @param {string} sessionUuid - 会话ID
     * @param {string} taskId - 流式任务ID
     */
    const addSessionTask = (sessionUuid, taskId) => {
        if (!sessionUuid || !taskId) return

        // 初始化会话任务数组
        if (!sessionTaskMap.value[sessionUuid]) {
            sessionTaskMap.value[sessionUuid] = []
        }

        // 追加新任务（状态：进行中）
        sessionTaskMap.value[sessionUuid].unshift({
            taskId,
            status: 'pending',
            createTime: Date.now()
        })
    }

    /**
     * 2. 更新任务状态（AI流式结束时调用）
     * @param {string} sessionUuid - 会话ID
     * @param {string} taskId - 任务ID
     * @param {'pending' | 'finished'} status - 新状态
     */
    const updateSessionTaskStatus = (sessionUuid, taskId, status) => {
        const taskList = sessionTaskMap.value[sessionUuid]
        if (!taskList) return

        const task = taskList.find(item => item.taskId === taskId)
        if (task) {
            task.status = status
        }
    }

    /**
     * 3. 获取【当前会话】的 进行中任务（重回聊天页 → 重连WebSocket用）
     * @return { taskId: string | null, status: string | null }
     */
    const getCurrentPendingTask = computed(() => {
        const sid = currentSessionUuid.value
        const taskList = sessionTaskMap.value[sid] || []
        // 找到第一个未完成的任务
        const pendingTask = taskList.find(item => item.status === 'pending')
        return pendingTask || { taskId: null, status: null }
    })

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
        chatList,
        aiRoleList,
        currentSessionUuid,
        currentRoleId,
        isThinkMode,
        isNetworkMode,
        sessionMessages, // 暴露消息映射
        BASE_HEIGHT,
        sessionInputConfig,
        roleSessionMap,
        fetchUserSessions,
        getCurrentMergedMessages,
        mergedSessionMessages,
        expandedRoleId, // 👈 新增
        setPlaceholderSession,
        toggleExpandRole, // 👈 新增
        fetchMyAiRoleList,
        deleteSessionByUuid,
        setCurrentSessionUuid,
        setCurrentRoleId,
        setSessionMessages, // 暴露设置全量消息
        pushMessageToSession, // 暴露追加单条消息
        currentInputConfig, // 组件直接用：当前输入框配置
        setCurrentSessionInput,
        clearStreamingMessageByUuid,
        fillTempMessage,
        createAiReplyMessage,
        updateAiReplyMessage,
        resetCurrentSessionInput, // 重置当前输入框
        fetchCurrentSessionMessages, // 🔥 组件无参数调用的方法
        toggleThinkMode,
        toggleNetworkMode,


        sessionTaskMap,
        addSessionTask,              // 发送消息 → 绑定taskId
        updateSessionTaskStatus,     // 流式结束 → 标记完成
        getCurrentPendingTask,       // 重回页面 → 获取未完成taskId
        clearSessionTasks,
        clearAllSessionTasks
    }
})