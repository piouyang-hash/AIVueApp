// src/api/constants/serviceUrls.js
// 所有微服务的基础地址（从.env读取）
export const SERVICE_URLS = {
    TEST_METHOD: import.meta.env.VITE_TEST_API_BASE, // 测试：7999
    USER_SERVICE: import.meta.env.VITE_USER_API_BASE, // 用户微服务：8083
    BOOK_SERVICE: import.meta.env.VITE_BOOK_API_BASE, // 书籍微服务：比如8084
    ORDER_SERVICE: import.meta.env.VITE_ORDER_API_BASE, // 订单微服务：8088（对应充值模块）
    ACCOUNT_SERVICE: import.meta.env.VITE_ACCOUNT_API_BASE, //账户微服务：8087
    CONNECT_SERVICE: import.meta.env.VITE_CONNECT_API_BASE, //连接微服务：8093
    AI_CHAT_SERVICE: import.meta.env.VITE_AI_CHAT_API_BASE, // AI聊天微服务：8086（新增）
    WS_SERVICE: import.meta.env.VITE_WS_API_BASE
}

