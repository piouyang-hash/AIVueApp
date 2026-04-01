// @/utils/websocketUtil.js
import { ref, readonly } from 'vue'

/**
 * 纯底层WebSocket工具类（仅负责WS基础通信，无任何业务逻辑）
 * 核心能力：连接、重连、发送消息、关闭连接、转发原始消息/事件
 * 所有业务逻辑（bind、心跳、消息解析）均由外部通过回调处理
 */
class WebSocketClient {
    /**
     * 构造函数（仅保留WS连接相关配置，无任何业务配置）
     * @param {Object} config 纯WS连接配置
     * @param {Number} config.reconnectInterval 重连间隔(ms)，默认3000
     * @param {Number} config.maxReconnectTimes 最大重连次数，默认10（-1表示无限重连）
     */
    constructor(config = {}) {
        // 仅保留WS连接核心配置（无任何业务配置）
        this.config = {
            reconnectInterval: config.reconnectInterval || 3000,
            maxReconnectTimes: config.maxReconnectTimes || 10
        }

        // WS连接核心状态（仅描述WS本身，无业务状态）
        this._connected = ref(false)    // 是否已连接
        this._connecting = ref(false)   // 是否正在连接
        this._error = ref(null)         // 连接错误信息
        this._reconnectCount = ref(0)   // 已重连次数

        // 对外暴露只读状态（外部可监听，不可修改）
        this.connected = readonly(this._connected)
        this.connecting = readonly(this._connecting)
        this.error = readonly(this._error)
        this.reconnectCount = readonly(this._reconnectCount)

        // 内部私有变量（仅WS连接相关）
        this.ws = null                  // WS实例
        this.reconnectTimer = null      // 重连定时器
        this.wsUrl = ''                 // WS连接地址（外部设置）

        // 基础事件回调（仅转发原始事件，无业务处理）
        this._callbacks = {
            open: null,    // 连接成功回调 (event) => void
            close: null,   // 连接关闭回调 (event) => void
            error: null,   // 连接错误回调 (error) => void
            message: null  // 接收消息回调 (data, event) => void（原始数据+原始事件）
        }
    }

    /**
     * 【底层】设置WS连接地址（外部传入，工具类不关心地址含义）
     * @param {String} url WS完整地址（如ws://localhost:8094/ws）
     */
    setWsUrl(url) {
        if (typeof url !== 'string' || !url) {
            console.error('WS地址必须是有效字符串');
            return;
        }
        this.wsUrl = url;
        console.log(`WS工具类：已设置连接地址 → ${url}`);
    }

    /**
     * 【底层】初始化WS连接（仅做连接，无任何业务操作）
     */
    connect() {
        // 防止重复连接
        if (this._connecting.value || this._connected.value) {
            console.warn('WS工具类：连接已在进行中/已连接，跳过重复连接');
            return;
        }

        // 校验地址
        if (!this.wsUrl) {
            console.error('WS工具类：未设置连接地址，无法初始化连接');
            return;
        }

        // 重置状态
        this._connecting.value = true;
        this._error.value = null;
        const self = this; // 固定this指向（核心）

        try {
            // 创建WS实例
            this.ws = new WebSocket(this.wsUrl);

            // 连接成功：仅转发事件，无业务逻辑
            this.ws.onopen = (event) => {
                console.log(`WS工具类：连接成功 → ${this.wsUrl}`);
                self._connected.value = true;
                self._connecting.value = false;
                self._reconnectCount.value = 0; // 重置重连次数
                self._callbacks.open?.(event); // 转发原始open事件
            };

            // 接收消息：仅转发原始数据，不解析任何业务格式
            this.ws.onmessage = (event) => {
                const rawData = event.data;
                console.log(`WS工具类：收到原始消息 → ${rawData}`);
                self._callbacks.message?.(rawData, event); // 转发原始数据+原始事件
            };

            // 连接错误：仅转发错误，无业务处理
            this.ws.onerror = (error) => {
                console.error('WS工具类：连接错误', error);
                self._error.value = error;
                self._callbacks.error?.(error); // 转发原始error事件
            };

            // 连接关闭：仅转发事件+处理重连，无业务逻辑
            this.ws.onclose = (event) => {
                console.log(`WS工具类：连接关闭 → 状态码${event.code}，原因${event.reason}`);
                self._connected.value = false;
                self._connecting.value = false;
                self._callbacks.close?.(event); // 转发原始close事件
                self._handleReconnect(); // 内部重连逻辑（纯WS操作）
            };
        } catch (error) {
            console.error('WS工具类：初始化连接失败', error);
            self._error.value = error;
            self._connecting.value = false;
            self._handleReconnect();
        }
    }

    /**
     * 【底层】发送原始消息（仅转发字节/字符串，不拼接任何业务格式）
     * @param {String|ArrayBuffer|Blob} data 原始消息数据
     * @returns {Boolean} 是否发送成功
     */
    send(data) {
        if (!this._connected.value || !this.ws) {
            console.error('WS工具类：未连接，无法发送消息');
            return false;
        }

        try {
            this.ws.send(data);
            console.log(`WS工具类：发送原始消息 → ${data}`);
            return true;
        } catch (error) {
            console.error('WS工具类：发送消息失败', error);
            return false;
        }
    }

    /**
     * 【底层】手动关闭WS连接（纯WS操作，无业务逻辑）
     * @param {Number} code 关闭状态码，默认1000（正常关闭）
     * @param {String} reason 关闭原因，默认''
     */
    close(code = 1000, reason = '') {
        // 清除重连定时器
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        // 关闭WS连接
        if (this.ws) {
            this.ws.close(code, reason);
            this.ws = null;
        }

        // 重置状态
        this._connected.value = false;
        this._connecting.value = false;
        this._reconnectCount.value = 0;
        console.log(`WS工具类：手动关闭连接 → 状态码${code}，原因${reason}`);
    }

    /**
     * 【底层】注册事件回调（纯转发，无业务处理）
     * @param {Object} callbacks 回调集合
     * @param {Function} callbacks.open 连接成功回调
     * @param {Function} callbacks.close 连接关闭回调
     * @param {Function} callbacks.error 连接错误回调
     * @param {Function} callbacks.message 接收消息回调
     */
    on(callbacks = {}) {
        // 仅注册合法的函数回调
        Object.keys(callbacks).forEach(key => {
            if (['open', 'close', 'error', 'message'].includes(key) && typeof callbacks[key] === 'function') {
                this._callbacks[key] = callbacks[key];
            }
        });
    }

    /**
     * 【私有】处理自动重连（纯WS逻辑，无业务依赖）
     */
    _handleReconnect() {
        // 停止重连条件：已连接 / 达到最大重连次数（非无限重连）
        if (this._connected.value || (this.config.maxReconnectTimes !== -1 && this._reconnectCount.value >= this.config.maxReconnectTimes)) {
            if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
            console.log(`WS工具类：停止重连 → 已连接/达到最大重连次数(${this.config.maxReconnectTimes})`);
            return;
        }

        // 触发重连
        this._reconnectCount.value += 1;
        this.reconnectTimer = setTimeout(() => {
            console.log(`WS工具类：第${this._reconnectCount.value}次重连 → ${this.wsUrl}`);
            this.connect(); // 调用底层connect方法
        }, this.config.reconnectInterval);
    }
}

// 导出单例（纯底层WS实例，无任何业务绑定）
export const wsClient = new WebSocketClient({
    reconnectInterval: 3000,
    maxReconnectTimes: 10
});

// 导出类供创建多实例（比如多WS连接场景）
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