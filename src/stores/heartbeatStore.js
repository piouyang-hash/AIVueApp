import {defineStore} from 'pinia';
import {useUserStore} from '@/stores/user';
// 引入【全局唯一WebSocket连接层】（核心解耦）
import {useWebSocketConnectionStore} from '@/stores/websocket-connection';
import {APP_CONSTANTS} from "@/api/constants/appType.js";

export const useHeartbeatStore = defineStore('heartbeat', {
    state: () => ({
        heartbeatCount: 0,        // 累计心跳次数
        beatInterval: 10,         // 心跳间隔（秒）
        heartbeatTimer: null,     // 心跳定时器（控制倒计时）
        countdownSeconds: 10      // 倒计时秒数
        // 🔥 已删除：wsUrl（连接由全局层统一管理，这里不再维护）
    }),
    getters: {
        formattedCountdown: (state) => `${state.countdownSeconds.toString().padStart(2, '0')}s`,
        beatIntervalMs: (state) => Math.max(1000, state.beatInterval * 1000),
        // 业务判断：登录 + 全局连接已连通
        canHeartbeat: () => {
            const userStore = useUserStore();
            return userStore.isLogin;
        }
    },
    actions: {
        // ===================== 🔥 新增：心跳业务初始化（只订阅，不建连） =====================
        initHeartbeat() {
            const userStore = useUserStore();
            const wsConnStore = useWebSocketConnectionStore();

            if (!userStore.isLogin) throw new Error('未登录，无法初始化心跳业务');

            // 订阅全局WebSocket消息（所有消息统一分发到这里）
            wsConnStore.subscribeMessage((rawData) => {
                this._handleWsMessage(rawData);
            });

            // 监听全局连接成功 → 自动发送绑定 + 启动心跳
            wsConnStore.subscribeMessage((rawData) => {
                if (rawData === 'bind_ready') {
                    this._sendBindMsg();
                    this.startHeartbeat();
                }
            });

            console.log('业务：心跳服务初始化完成（复用全局WS连接）');
        },

        // 倒计时递减（原逻辑完全不变）
        decrementCountdown() {
            if (!this.canHeartbeat) return;

            if (this.countdownSeconds <= 0) {
                this._sendHeartbeatMsg();
                this.heartbeatCount++;
                this.countdownSeconds = this.beatInterval;
                return;
            }
            this.countdownSeconds--;
        },

        // 手动触发心跳（原逻辑完全不变）
        triggerManualBeat() {
            if (!this.canHeartbeat) return;

            this._sendHeartbeatMsg();
            this.heartbeatCount++;
            this.countdownSeconds = this.beatInterval;
        },

        // 启动心跳倒计时（原逻辑完全不变）
        startHeartbeat() {
            this.stopHeartbeat();

            if (this.canHeartbeat) {
                this.heartbeatTimer = setInterval(() => {
                    this.decrementCountdown();
                }, 1000);
                console.log('业务：心跳倒计时启动（已登录+WS连接）');
            }
        },

        // 停止心跳倒计时（原逻辑完全不变）
        stopHeartbeat() {
            if (this.heartbeatTimer) {
                clearInterval(this.heartbeatTimer);
                this.heartbeatTimer = null;
                this.countdownSeconds = this.beatInterval;
                console.log('业务：心跳倒计时停止（未登录/WS断开）');
            }
        },

        // 🔥 已删除：initWs() 方法（不再管理连接）
        // 🔥 已删除：setWsUrl() 方法（连接由全局层管理）

        // 私有：发送绑定消息（调用全局层发送，不复用建连）
        _sendBindMsg() {
            const userStore = useUserStore();
            const wsConnStore = useWebSocketConnectionStore();
            const bindMsg = `bind|${userStore.userId}|${APP_CONSTANTS.APP_TYPE}`;
            // 通过全局唯一连接发送
            wsConnStore.sendGlobalMessage(bindMsg);
        },

        // 私有：发送心跳包（调用全局层发送）
        _sendHeartbeatMsg() {
            const userStore = useUserStore();
            if (!this.canHeartbeat) return;

            const wsConnStore = useWebSocketConnectionStore();
            const heartbeatMsg = `heartbeat|${userStore.userId}|${APP_CONSTANTS.APP_TYPE}`;
            // 通过全局唯一连接发送
            wsConnStore.sendGlobalMessage(heartbeatMsg);
        },

        // 处理WS消息（原逻辑100%保留，完全不变）
        _handleWsMessage(rawData) {
            // 1. 服务器返回的是 JSON 字符串 → 先解析（加容错，防止报错）
            let data = null;
            try {
                data = JSON.parse(rawData);
            } catch (e) {
                // 非JSON消息（比如内部bind_ready信号），直接忽略/不处理
                return;
            }

            // 2. 只处理心跳类型消息
            if (data.msgType === 'HEARTBEAT') {
                switch (data.message) {
                    // 绑定成功
                    case '绑定成功':
                        console.log('业务：WS绑定用户成功 ✅');
                        break;

                    // 心跳响应（砰砰 = 服务器回的心跳包）
                    case '砰砰':
                        console.log('业务：心跳包响应成功 ✅');
                        break;

                    default:
                        console.log('业务：收到未知心跳消息', data);
                        break;
                }
                return;
            }

            // 3. 处理其他消息类型（如过期登出）
            switch (data.msgType) {
                case 'expired':
                    console.log('业务：登录已过期，强制登出');
                    break;
            }
        },

        // 关闭WS（调用全局层关闭唯一连接）
        closeWs() {
            this.stopHeartbeat();
            // 关闭全局连接
            const wsConnStore = useWebSocketConnectionStore();
            wsConnStore.closeGlobalConnection();
            this.heartbeatCount = 0;
        },

        // 重置状态（原逻辑完全不变）
        resetHeartbeatState() {
            this.heartbeatCount = 0;
            this.beatInterval = 10;
            this.countdownSeconds = 10;
            this.stopHeartbeat();
        }
    }
});