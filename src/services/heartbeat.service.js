import { useWebSocketConnectionStore } from '@/stores/websocket-connection';
import { useHeartbeatStore } from '@/stores/heartbeatStore';
import { useAiMessageReceiverStore } from '@/stores/aiMessageReceiver'
import {SERVICE_URLS} from "@/api/constants/serviceUrls.js";

/**
 * 【Service层】全局WS连接初始化（全局唯一连接，仅调用一次）
 * 1. 获取WS地址
 * 2. 初始化心跳业务订阅
 * 3. 初始化全局唯一WebSocket连接
 * 4. 错误自动向上抛出，由调用方处理
 */
export async function initWebSocketService() {
    // ==================== 核心修改 ====================
    // 1. 直接从前端环境变量获取WS地址（删除后端请求）
    const wsFullUrl = SERVICE_URLS.WS_SERVICE;
    if (!wsFullUrl) throw new Error('未获取到有效的WS连接地址');

    // 2. 初始化【全局唯一】WebSocket连接（原有逻辑不动）
    const wsConnStore = useWebSocketConnectionStore();
    wsConnStore.initGlobalConnection(wsFullUrl);

    // 3. 初始化心跳业务（仅订阅消息，不创建连接）
    const heartbeatStore = useHeartbeatStore();
    heartbeatStore.initHeartbeat();

    // 🔥 新增：挂载 AI 消息接收器
    const aiReceiver = useAiMessageReceiverStore()
    aiReceiver.initAiMessageReceiver()

    // 4. 返回Store实例（供调用方后续操作）
    return heartbeatStore;
}