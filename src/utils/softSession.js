/**
 * 会话列表排序工具类（全局复用）
 * 完全保留原有核心排序规则
 */

/**
 * 🔥 核心1：获取会话排序权重等级（抽离独立函数）
 * @param {Object} item - 会话对象
 * @returns {Number} 排序权重（数字越小越靠前）
 */
export function getChatSessionLevel(item) {
    // 兼容数字/字符串类型的 isTop
    const isTop = Number(item.isTop) === 1
    const status = item?.status || ''

    // 第一优先级：活跃 + 置顶
    if (status === 'ACTIVE' && isTop) return 1
    // 第二优先级：关闭 + 置顶
    if (status === 'CLOSED' && isTop) return 2
    // 第三优先级：活跃 + 不置顶
    if (status === 'ACTIVE' && !isTop) return 3
    // 第四优先级：其余所有
    return 4
}

/**
 * 🔥 核心2：会话列表排序比较器（抽离独立函数，直接给sort用）
 * @param {Object} a - 会话A
 * @param {Object} b - 会话B
 * @returns {Number} 排序差值
 */
export function compareChatSessions(a, b) {
    const levelA = getChatSessionLevel(a)
    const levelB = getChatSessionLevel(b)

    // 规则1：按权重排序
    if (levelA !== levelB) {
        return levelA - levelB
    }

    // 规则2：关闭+置顶 按置顶时间倒序
    if (levelA === 2) {
        const timeA = a.topAt || '0'
        const timeB = b.topAt || '0'
        return timeB.localeCompare(timeA)
    }

    // 规则3：所有同级按创建时间倒序
    const timeA = new Date(a.createTime).getTime()
    const timeB = new Date(b.createTime).getTime()
    return timeB - timeA
}

/**
 * 🔥 便捷方法：直接返回排序后的会话数组（一键调用）
 * @param {Array} chatList - 原始会话列表
 * @returns {Array} 排序后的新数组
 */
export function sortChatList(chatList) {
    // 深拷贝避免修改原数据
    return [...(chatList || [])].sort(compareChatSessions)
}