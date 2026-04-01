/**
 * 反馈类型常量（与后端FeedBackConstants严格对齐）
 * key：后端存储的value（如add_book）
 * value：前端显示的中文描述
 */
export const FEEDBACK_TYPE_MAP = {
    add_book: '请求添加书籍', // 新增的核心类型
    function: '功能问题',
    experience: '体验优化',
    bug: 'Bug反馈',
    suggestion: '功能建议',
    other: '其他问题',
};

/**
 * 获取反馈类型的中文描述
 * @param {string} type - 后端存储的类型key（如add_book）
 * @returns {string} 中文描述（默认“未知类型”）
 */
export const getFeedbackTypeDesc = (type) => {
    return FEEDBACK_TYPE_MAP[type] || '未知类型';
};

/**
 * 反馈类型下拉框选项（供select循环渲染）
 */
export const FEEDBACK_TYPE_OPTIONS = Object.entries(FEEDBACK_TYPE_MAP).map(([value, label]) => ({
    label, // 显示的中文
    value  // 传给后端的value
}));