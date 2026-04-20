import { defineStore } from 'pinia';
import { wsClient } from '@/utils/websocketUtil';

/**
 * 🔥 全局WebSocket单例连接管理
 * 登录后初始化一次，全局所有业务（心跳、AI推送、通知）共用这一个连接
 * 绝不重复连接！
 */
export const useWebSocketConnectionStore = defineStore('websocketConnection', {
    state: () => ({
        wsUrl: '',
        messageListeners: [],
    }),

    actions: {
        // ===================== 1. 只在【登录成功】调用一次！ =====================
        initGlobalConnection(url) {

            this.wsUrl = url;
            wsClient.setWsUrl(this.wsUrl);

            // 统一监听WS事件，全局分发
            wsClient.on({
                open: () => {
                    console.log('🌍 全局WS：连接成功 → 全局单例连接就绪');
                    this.dispatchMessage('bind_ready');
                },
                message: (rawData) => {
                    // 🔥 全局消息分发给所有监听的业务（心跳、AI都能收到）
                    this.dispatchMessage(rawData);
                },
                close: () => {
                    console.log('🌍 全局WS：连接断开');
                },
                error: (err) => {
                    console.error('🌍 全局WS：连接异常', err);
                }
            });

            // 启动连接（全局唯一一次）
            wsClient.connect();
        },

        // ===================== 2. 全局发送消息（所有业务调用这个） =====================
        sendGlobalMessage(msg) {
            console.log(msg);
            wsClient.send(msg);
            return true;
        },

        // ===================== 3. 业务层订阅消息（心跳、AI都可订阅） =====================
        subscribeMessage(listener) {
            this.messageListeners.push(listener);
        },

        // ===================== 内部：消息分发 =====================
        dispatchMessage(rawData) {
            this.messageListeners.forEach(listener => listener(rawData));
        },

        // ===================== 4. 全局关闭连接（登出调用） =====================
        closeGlobalConnection() {
            wsClient.close();
            this.messageListeners = [];
            console.log('🌍 全局WS：已关闭全局连接');
        }
    }
});