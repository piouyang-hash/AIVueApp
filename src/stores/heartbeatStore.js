import { defineStore } from 'pinia';
import { useUserStore } from '@/stores/user';
import { wsClient } from '@/utils/websocketUtil';
import { APP_CONSTANTS } from "@/api/constants/appType.js";

export const useHeartbeatStore = defineStore('heartbeat', {
    state: () => ({
        heartbeatCount: 0,        // 累计心跳次数
        beatInterval: 10,         // 心跳间隔（秒）
        wsUrl: '',                // WS连接地址
        heartbeatTimer: null,     // 心跳定时器（控制倒计时）
        countdownSeconds: 10      // 倒计时秒数
    }),
    getters: {
        isWsConnected: () => wsClient.connected.value,
        formattedCountdown: (state) => `${state.countdownSeconds.toString().padStart(2, '0')}s`,
        beatIntervalMs: (state) => Math.max(1000, state.beatInterval * 1000),
        // 新增：是否允许心跳（登录+WS连接成功）
        canHeartbeat: () => {
            const userStore = useUserStore();
            return userStore.isLogin && wsClient.connected.value;
        }
    },
    actions: {
        // 倒计时递减（仅在允许心跳时执行）
        decrementCountdown() {
            if (!this.canHeartbeat) return; // 未登录/WS未连，不递减

            if (this.countdownSeconds <= 0) {
                this._sendHeartbeatMsg(); // 发送WS心跳包
                this.heartbeatCount++;
                this.countdownSeconds = this.beatInterval;
                return;
            }
            this.countdownSeconds--;
        },

        // 手动触发心跳（仅允许心跳时生效）
        triggerManualBeat() {
            if (!this.canHeartbeat) return;

            this._sendHeartbeatMsg();
            this.heartbeatCount++;
            this.countdownSeconds = this.beatInterval;
        },

        // 启动心跳倒计时（仅外部调用：登录成功后）
        startHeartbeat() {
            this.stopHeartbeat(); // 防止重复启动

            if (this.canHeartbeat) {
                this.heartbeatTimer = setInterval(() => {
                    this.decrementCountdown();
                }, 1000);
                console.log('业务：心跳倒计时启动（已登录+WS连接）');
            }
        },

        // 停止心跳倒计时（外部调用：登出/WS断开）
        stopHeartbeat() {
            if (this.heartbeatTimer) {
                clearInterval(this.heartbeatTimer);
                this.heartbeatTimer = null;
                this.countdownSeconds = this.beatInterval; // 重置倒计时
                console.log('业务：心跳倒计时停止（未登录/WS断开）');
            }
        },

        // 初始化WS（登录后调用）
        initWs() {
            const userStore = useUserStore();
            if (!userStore.isLogin) throw new Error('未登录，无法初始化WS');
            if (!this.wsUrl) throw new Error('未设置WS连接地址');

            wsClient.setWsUrl(this.wsUrl);
            wsClient.on({
                open: () => {
                    this._sendBindMsg();
                    this.startHeartbeat(); // WS连接成功+已登录 → 启动心跳
                },
                close: () => this.stopHeartbeat(),
                error: (err) => console.error('WS业务错误：', err)
            });
            wsClient.connect();
        },

        // 私有：发送绑定消息（登录后才会调用）
        _sendBindMsg() {
            const userStore = useUserStore();
            const bindMsg = `bind|${userStore.userId}|${APP_CONSTANTS.APP_TYPE}`;
            wsClient.send(bindMsg);
        },

        // 私有：发送心跳包（仅允许心跳时生效）
        _sendHeartbeatMsg() {
            const userStore = useUserStore();
            if (!this.canHeartbeat) return;

            const heartbeatMsg = `heartbeat|${userStore.userId}|${APP_CONSTANTS.APP_TYPE}`;
            wsClient.send(heartbeatMsg);
        },

        // 处理WS消息（保持不变）
        _handleWsMessage(rawData) {
            switch (rawData) {
                case 'bind_success': console.log('业务：WS绑定用户成功'); break;
                case 'pong': console.log('业务：心跳包响应成功'); break;
                case 'expired':
                    const userStore = useUserStore();
                    userStore.logout();
                    this.stopHeartbeat();
                    wsClient.close();
                    break;
                default: console.log('业务：收到未知消息', rawData);
            }
        },

        // 其他方法保持不变（setWsUrl、closeWs、resetHeartbeatState）
        setWsUrl(url) { this.wsUrl = url; },
        closeWs() {
            this.stopHeartbeat();
            wsClient.close();
            this.heartbeatCount = 0;
        },
        resetHeartbeatState() {
            this.heartbeatCount = 0;
            this.beatInterval = 10;
            this.countdownSeconds = 10;
            this.stopHeartbeat();
        }
    }
});