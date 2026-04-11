// 导入Pinia创建仓库的方法 + Vue响应式API
import { defineStore } from 'pinia'
import {computed, ref} from 'vue'
import {getChatMessages, getUserNormalSessions} from "@/services/ai_chat.session.service.js";
import {getMyAiRoleList} from "@/services/ai_chat.role.service.js";
// 导入配置仓库
import { useAiSoftwareConfigStore } from '@/stores/aiSoftwareConfig'

// 创建会话仓库
export const useSessionStore = defineStore('session', () => {

    // 初始化配置仓库
    const configStore = useAiSoftwareConfigStore()


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

    // ✅【你要的新数据结构】会话UUID => 最后一条消息 键值对映射
    const sessionLastMessage = ref({})

    // 🔥 核心：全会话未读数（自动计算所有会话）
    // 结构：{ [sessionUuid]: { normal: number, split: number } }
    const sessionAllUnreadCount = computed(() => {
        const result = {}

        // 遍历【所有会话】，逐个计算未读数
        chatList.value.forEach(session => {
            const sessionUuid = session.sessionUuid
            if (!sessionUuid) return

            // 获取当前会话的消息数组
            const messages = mergedSessionMessages.value[sessionUuid] || []

            // 1. 计算：非切分未读（消息isRead=false）
            const normal = messages.filter(msg => msg.isRead === false).length

            // 2. 计算：切分未读（分片isRead=false总数）
            let split = 0
            messages.forEach(msg => {
                const splits = msg.splitContent || []
                split += splits.filter(s => s.isRead === false).length
            })

            // 存入结果
            result[sessionUuid] = { normal, split }
        })

        return result
    })

    const BASE_HEIGHT = 40              // 全局：输入框基础高度（统一维护）


    // 🔥 核心新增：会话输入框配置映射
    // 结构：{ sessionUuid: { inputValue: 输入内容, inputHeight: 输入框高度 } }
    // 一个ID 精准对应 一组输入框参数！

    const sessionInputConfig = ref({})


    // 🔥 最终正确结构：会话UUID → { 任务ID: AI正在回复的消息 }
    // 一个会话可以同时存在多个 taskId 任务（插队/连发场景）
    const streamingAiMessage = ref({})

    // 🔥 最终正确结构：会话UUID → { taskId: 等待回复的用户消息 }
    // 对齐AI多任务结构，支持taskId维度存储
    const waitingUserMessage = ref({})

    // 🔥 逆天核心：自动合并【历史消息 + 多任务等待用户消息 + 多任务流式消息】
    // 规则：正常合并 → 全局去重（相同messageId只保留一个，删除重复）
    const mergedSessionMessages = computed(() => {
        const merged = {}

        Object.keys(sessionMessages.value).forEach(sessionUuid => {
            // 1. 历史消息
            const historyMessages = sessionMessages.value[sessionUuid] || []

            // 🔥 核心：提取【历史消息中 所有用户消息的 taskId】（只针对USER）
            const historyUserTaskIds = new Set(
                historyMessages
                    .filter(item => item.role === 'USER' && item.taskId)
                    .map(item => item.taskId)
            )

            // 2. 等待用户消息：过滤掉【和历史用户消息taskId相同】的项
            const waitingTaskMap = waitingUserMessage.value[sessionUuid] || {}
            const userWaitingMessages = Object.values(waitingTaskMap).filter(msg => {
                // 如果等待消息的taskId，在历史用户消息里存在 → 删掉
                return !historyUserTaskIds.has(msg.taskId)
            })

            // 3. AI流式消息（不变）
            const streamingTaskMap = streamingAiMessage.value[sessionUuid] || {}
            const streamingMessages = Object.values(streamingTaskMap)

            // 正常合并
            merged[sessionUuid] = [
                ...historyMessages,
                ...userWaitingMessages,
                ...streamingMessages
            ]
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

        // ✅ 核心：判断是否已经填充过，已填充则直接跳过，不再重复赋值
        if (Object.keys(sessionLastMessage.value).length > 0) {
            console.log('sessionLastMessage 已初始化，跳过填充');
            return;
        }

        // 未填充过，才执行首次赋值
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

        // 核心：直接修改响应式对象（自动触发视图更新）
        // 即使会话UUID不存在，也会自动新增键值对，兼容新会话
        sessionLastMessage.value[sessionUuid] = content;
    };

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

    // 🔥 新增1：给指定会话 设置/覆盖 完整消息数组
    const setSessionMessages = (sessionUuid, messagesArray) => {
        // 直接赋值：键是sessionUuid，值是消息数组
        sessionMessages.value[sessionUuid] = messagesArray || []
        console.log(`会话${sessionUuid} 消息数组已赋值：`, messagesArray)
    }

    // 🔥 新增2：给指定会话 追加单条消息（发消息时用）
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

    // 🔥 最终版：填充临时消息（按 sessionUuid + taskId 精准定位，彻底解耦）
    // 对标 AI：update + clear 二合一，仅操作指定taskId的等待用户消息
    const fillTempMessage = (sessionUuid, meta, taskId) => {
        // 1. 双重校验：必须拿到会话 + taskId 容器
        if (!waitingUserMessage.value[sessionUuid]) return;
        const sessionTaskMap = waitingUserMessage.value[sessionUuid];
        const waitingMsg = sessionTaskMap[taskId];
        if (!waitingMsg) return;

        // 2. 填充字段
        waitingMsg.messageId = meta.userMessageId;
        waitingMsg.content = meta.userMessage;
        waitingMsg.parentMsgId = meta.parentMsgId;
        waitingMsg.sessionUuid = meta.sessionUuid;
        waitingMsg.userId = meta.userId;
        waitingMsg.isComplete = true;
        delete waitingMsg.tempMessage;

        // 覆盖赋值，杜绝残留
        waitingUserMessage.value = { ...waitingUserMessage.value };

        console.log(`✅ 清理完成，无残留：taskId=${taskId}`);
    };

    // 🔥 修正：创建等待中用户消息（参数新增 taskId，结构对齐AI）
    // 🔥 新增参数：messageId（后端生成的用户消息ID）
    const createUserWaitingMessage = (sessionUuid, content, taskId, messageId) => {
        const userMessage = {
            content: content,
            role: 'USER',
            createTime: new Date().toLocaleString(),
            sortTimestamp: Date.now(),
            isComplete: false,
            taskId: taskId,
            messageId: messageId, // 🔥 核心：赋值后端返回的消息ID
        };

        // 1. 会话不存在则初始化空对象
        if (!waitingUserMessage.value[sessionUuid]) {
            waitingUserMessage.value[sessionUuid] = {};
        }
        // 2. 按 taskId 存储（和AI逻辑完全一致）
        waitingUserMessage.value[sessionUuid][taskId] = userMessage;
        // 3. 触发Vue响应式
        waitingUserMessage.value = { ...waitingUserMessage.value };

        // ✅ 用户发送消息 → 立即更新会话最后一条消息
        updateSessionLastMessage(sessionUuid, content);

        return `user_${Date.now()}`;
    };

    // 🔥 修正：创建AI回复消息（按 sessionUuid + taskId 唯一存储）
    const createAiReplyMessage = (sessionUuid, meta, taskId) => {
        const aiMessage = {
            content: meta.aiReplyContent || '',
            role: 'ASSISTANT',
            createTime: new Date().toISOString(),
            messageId: meta.aiMessageId,
            parentMsgId: meta.parentMsgId,
            sessionUuid: meta.sessionUuid,
            sortTimestamp: Date.now(),
            splitContent: meta.aiReplyContent
                ? [{
                    content: meta.aiReplyContent,
                    timestamp: Date.now(),
                    isRead: false // 🔥 初始化分片也加未读
                }]
                : [],
            isComplete: false,
            taskId: taskId,
            // 🔥【核心新增】创建时就标记：默认未读（响应式字段！）
            isRead: false
        };

        // 下面原有代码完全不动
        if (!streamingAiMessage.value[sessionUuid]) {
            streamingAiMessage.value[sessionUuid] = {};
        }
        streamingAiMessage.value[sessionUuid][taskId] = aiMessage;
        streamingAiMessage.value = { ...streamingAiMessage.value };

        updateSessionLastMessage(sessionUuid, aiMessage.content);

        return meta.aiMessageId;
    };

    // 简化版查询函数：自动匹配切分/普通模式
    // @param {string} sessionUuid 会话ID
    // @return {number} 未读数量
    const getSessionUnread = (sessionUuid) => {
        // 无会话直接返回0
        if (!sessionUuid) return 0
        const type = configStore.isSplitMessageEnabled ? 'split' : 'normal'
        // 返回对应未读数
        return sessionAllUnreadCount.value[sessionUuid]?.[type] || 0
    }

    // 🔥 标记单条消息已读（主消息+全分片）【精简最终版】
    const markMessageAsRead = (sessionUuid, messageId) => {
        // 获取当前会话的消息数组
        const messages = mergedSessionMessages.value[sessionUuid] || []
        // 查找目标消息
        const targetMessage = messages.find(msg => msg.messageId === messageId)

        // 无消息 / 已读 直接退出
        if (!targetMessage || targetMessage.isRead) return

        // 标记主消息为已读
        targetMessage.isRead = true

        // 标记所有切分分片为已读（仅修改 false 的项）
        targetMessage.splitContent?.forEach(splitItem => {
            if (splitItem.isRead === false) {
                splitItem.isRead = true
            }
        })
    }

    // 🔥 增强版：标记单个切分消息 + 全部分片读完自动标记主消息
    const markSingleSplitMessageAsRead = (sessionUuid, messageId, splitIndex) => {
        const messages = mergedSessionMessages.value[sessionUuid] || []
        const targetMessage = messages.find(msg => msg.messageId === messageId)

        if (!targetMessage || !targetMessage.splitContent || splitIndex < 0 || splitIndex >= targetMessage.splitContent.length) {
            return
        }

        // 标记单个分片
        const targetSplit = targetMessage.splitContent[splitIndex]
        if (targetSplit.isRead === false) {
            targetSplit.isRead = true
        }

        // 🔥 优化：检查所有分片是否都已读，是则标记主消息为已读
        const allSplitRead = targetMessage.splitContent.every(s => s.isRead === true)
        if (allSplitRead) {
            targetMessage.isRead = true
        }
    }

    // 🔥 清空指定会话的所有未读
    const clearSessionUnread = (sessionUuid) => {
        const messages = mergedSessionMessages.value[sessionUuid] || []
        messages.forEach(msg => {
            msg.isRead = true
            msg.splitContent?.forEach(s => s.isRead = true)
        })
    }

    // 更新AI回复消息（双维度定位：sessionUuid + taskId）
    const updateAiReplyMessage = (sessionUuid, messageId, text, taskId) => {
        // 1. 找到对应会话
        const sessionTaskMap = streamingAiMessage.value[sessionUuid];
        if (!sessionTaskMap) return;

        // 2. 找到对应 taskId 的正在回复的消息
        const aiMessage = sessionTaskMap[taskId];
        if (!aiMessage) return;

        // 双重校验：消息ID + 任务ID 都匹配才更新
        if (aiMessage.messageId !== messageId || aiMessage.taskId !== taskId) return;

        // 正常更新内容
        aiMessage.content += text;
        if (!aiMessage.sortTimestamp) {
            aiMessage.sortTimestamp = Date.now();
        }

        // 🔥【核心修改】给切分分片添加 isRead: false（默认未读）
        aiMessage.splitContent.push({
            content: text,
            timestamp: Date.now(),
            isRead: false  // 切分消息自身的未读标记
        });

        // 响应式更新
        streamingAiMessage.value = { ...streamingAiMessage.value };

        // 实时更新会话最后消息
        updateSessionLastMessage(sessionUuid, text);
    };

    // 🔥 最终版：回写+清理流式消息（按 taskId 精准清理，不影响同会话其他任务）
    const clearStreamingMessageByUuid = (sessionUuid, taskId) => {
        // 1. 基础校验：会话和任务ID必须都存在
        if (!sessionUuid || !taskId || !streamingAiMessage.value[sessionUuid]) return;

        // 2. 获取当前会话下的所有任务消息
        const sessionTaskMap = streamingAiMessage.value[sessionUuid];
        // 3. 找到当前 taskId 对应的流式消息
        const completeMessage = sessionTaskMap[taskId];

        // 4. 消息不存在则直接返回
        if (!completeMessage) return;

        // 5. 标记消息完成（必须加！）
        completeMessage.isComplete = true;

        // 6. 写入会话历史消息（原有逻辑不变）
        pushMessageToSession(sessionUuid, completeMessage);

        // 7. 🔥 核心：只删除当前 taskId 的流式消息，不删除整个会话！
        delete sessionTaskMap[taskId];
        // 8. 触发Vue响应式更新
        streamingAiMessage.value = { ...streamingAiMessage.value };

        console.log(`✅ 流式消息[任务ID:${taskId}]已回写历史：会话【${sessionUuid}】`);
    };

    // 🔥 新增：清空所有会话的流式AI消息（全量清理，如退出登录、重置页面）
    const clearAllStreamingMessages = () => {
        streamingAiMessage.value = {};
        console.log('✅ 已清空所有会话的流式AI消息');
    }

    // 🔥 新增：设置【当前会话】的输入框内容/高度（无参数，自动用当前ID）
    const setCurrentSessionInput = (value = '', height = BASE_HEIGHT) => {
        const uuid = currentSessionUuid.value
        if (!uuid) return
        // 给当前会话绑定输入框参数
        sessionInputConfig.value[uuid] = {
            inputValue: value,
            inputHeight: height
        }
    }

    // 🔥 新增：重置【当前会话】的输入框（清空内容 + 恢复默认高度）
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

    // 🔥 计算属性：当前会话的输入框配置（组件直接用）
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
     * 【新增】便捷方法：直接将任务标记为【已取消】
     */
    const cancelSessionTask = (sessionUuid, taskId) => {
        updateSessionTaskStatus(sessionUuid, taskId, 'canceled')
    }

    /**
     * 【新增核心】取消当前会话【所有进行中】的任务（后端打断时，前端批量取消）
     */
    const cancelAllPendingTasks = (sessionUuid) => {
        const taskList = sessionTaskMap.value[sessionUuid]
        if (!taskList) return

        // 遍历所有任务，把 pending 改为 canceled
        taskList.forEach(item => {
            if (item.status === 'pending') {
                item.status = 'canceled'
                console.log(`【前端取消任务】会话：${sessionUuid}，任务ID：${item.taskId}`)

                // 🔥 核心新增：取消任务时，自动回写该taskId的流式消息并清理
                clearStreamingMessageByUuid(sessionUuid, item.taskId)
            }
        })
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
        sessionLastMessage,
        BASE_HEIGHT,
        sessionInputConfig,
        roleSessionMap,
        waitingUserMessage,
        streamingAiMessage,
        fetchUserSessions,
        updateSessionLastMessage,

        // 未读相关核心导出
        sessionAllUnreadCount, // 全会话未读对象
        getSessionUnread,      // 查询未读数
        markMessageAsRead,     // 标记单条消息已读
        clearSessionUnread,     // 清空会话未读
        markSingleSplitMessageAsRead,

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
        createUserWaitingMessage,
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