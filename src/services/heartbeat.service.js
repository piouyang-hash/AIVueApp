import { initWsConnectService } from "@/services/connect.service.js";
import { useHeartbeatStore } from '@/stores/heartbeatStore';

/**
 * 【Service层】极简WS连接初始化（仅核心逻辑）
 * 1. 获取WS地址 → 存入Store → 初始化连接
 * 2. 错误自动向上抛出，由调用方处理
 */
export async function initWebSocketService() {
    // 1. 获取WS地址（错误自动抛）
    const wsFullUrl = await initWsConnectService();
    if (!wsFullUrl) throw new Error('未获取到有效的WS连接地址');

    // 2. 存入地址到Store + 初始化WS
    const heartbeatStore = useHeartbeatStore();
    heartbeatStore.setWsUrl(wsFullUrl); // 存地址
    heartbeatStore.initWs(); // 初始化连接

    // 3. 返回Store实例（供调用方后续操作）
    return heartbeatStore;
}