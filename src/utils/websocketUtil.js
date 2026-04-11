// @/utils/websocketUtil.js
import { ref, readonly } from 'vue'

/**
 * 纯底层WebSocket工具类（仅负责WS基础通信，无任何业务逻辑）
 * 修复：移除Vue ref响应式，纯JS实现，兼容全局/Pinia调用
 */
class WebSocketClient {
    constructor(config = {}) {
        this.config = {
            reconnectInterval: config.reconnectInterval || 3000,
            maxReconnectTimes: config.maxReconnectTimes || 10
        }

        // 🔥 修复：普通变量，无 ref / .value
        this._connected = false
        this._connecting = false
        this._error = null
        this._reconnectCount = 0
        this._manualClosed = false

        // 🔥 修复：用 getter 对外暴露状态（替代Vue readonly）
        Object.defineProperties(this, {
            connected: { get: () => this._connected },
            connecting: { get: () => this._connecting },
            error: { get: () => this._error },
            reconnectCount: { get: () => this._reconnectCount }
        })

        this.ws = null
        this.reconnectTimer = null
        this.wsUrl = ''

        this._callbacks = {
            open: null,
            close: null,
            error: null,
            message: null
        }
    }

    setWsUrl(url) {
        if (typeof url !== 'string' || !url) {
            // console.error('WS地址必须是有效字符串');
            return;
        }
        this.wsUrl = url;
        // console.log(`WS工具类：已设置连接地址 → ${url}`);
    }

    connect() {
        // 🔥 修复：直接赋值，无 .value
        if (this._connecting || this._connected) {
            // console.warn('WS工具类：连接已在进行中/已连接，跳过重复连接');
            return;
        }

        if (!this.wsUrl) {
            // console.error('WS工具类：未设置连接地址，无法初始化连接');
            return;
        }

        this._connecting = true;
        this._error = null;
        const self = this;

        try {
            this.ws = new WebSocket(this.wsUrl);

            this.ws.onopen = (event) => {
                // console.log(`WS工具类：连接成功 → ${this.wsUrl}`);
                self._connected = true;
                self._connecting = false;
                self._reconnectCount = 0;
                self._callbacks.open?.(event);
            };

            this.ws.onmessage = (event) => {
                const rawData = event.data;
                // console.log(`WS工具类：收到原始消息 → ${rawData}`);
                self._callbacks.message?.(rawData, event);
            };

            this.ws.onerror = (error) => {
                // console.error('WS工具类：连接错误', error);
                self._error = error;
                self._callbacks.error?.(error);
            };

            this.ws.onclose = (event) => {
                // console.log(`WS工具类：连接关闭 → 状态码${event.code}，原因${event.reason}`);
                self._connected = false;
                self._connecting = false;
                self._callbacks.close?.(event);
                self._handleReconnect();
            };
        } catch (error) {
            // console.error('WS工具类：初始化连接失败', error);
            self._error = error;
            self._connecting = false;
            self._handleReconnect();
        }
    }

    send(data) {
        if (!this._connected || !this.ws) {
            // console.error('WS工具类：未连接，无法发送消息');
            return false;
        }

        try {
            this.ws.send(data);
            // console.log(`WS工具类：发送原始消息 → ${data}`);
            return true;
        } catch (error) {
            // console.error('WS工具类：发送消息失败', error);
            return false;
        }
    }

    close(code = 1000, reason = '') {
        this._manualClosed = true;

        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        if (this.ws) {
            this.ws.close(code, reason);
            this.ws = null;
        }

        this._connected = false;
        this._connecting = false;
        this._reconnectCount = 0;
        // console.log(`WS工具类：手动关闭连接 → 状态码${code}，原因${reason}`);
    }

    on(callbacks = {}) {
        Object.keys(callbacks).forEach(key => {
            if (['open', 'close', 'error', 'message'].includes(key) && typeof callbacks[key] === 'function') {
                this._callbacks[key] = callbacks[key];
            }
        });
    }

    _handleReconnect() {
        if (this._manualClosed) {
            // console.log("WS工具类：主动关闭连接，禁止重连");
            return;
        }

        if (this._connected || (this.config.maxReconnectTimes !== -1 && this._reconnectCount >= this.config.maxReconnectTimes)) {
            if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
            // console.log(`WS工具类：停止重连 → 已连接/达到最大重连次数(${this.config.maxReconnectTimes})`);
            return;
        }

        this._reconnectCount += 1;
        this.reconnectTimer = setTimeout(() => {
            // console.log(`WS工具类：第${this._reconnectCount}次重连 → ${this.wsUrl}`);
            this.connect();
        }, this.config.reconnectInterval);
    }
}

// 导出单例 + 类
export const wsClient = new WebSocketClient({
    reconnectInterval: 3000,
    maxReconnectTimes: 10
});

export default WebSocketClient;

// // 1. 初始化WS连接
// wsClient.initConnect();
//
// // 2. 注册WS事件回调
// wsClient.on({
//     // WS连接成功：触发第一次心跳
//     open: () => {
//         if (props.autoPlay) {
//             triggerAnimation();
//             startCountdown();
//         }
//     },
//     // 接收WS消息：比如服务端下发心跳间隔配置
//     message: (data) => {
//         if (data.type === 'heartbeatInterval') {
//             // 更新Pinia中的心跳间隔（响应式同步）
//             heartbeatStore.updateBeatInterval(data.interval);
//         }
//     },
//     // WS错误：打印日志
//     error: (error) => {
//         console.error('心跳组件WS错误：', error);
//     },
//     // WS关闭：停止心跳（可选）
//     close: () => {
//         console.log('心跳组件WS连接关闭');
//     }
// });