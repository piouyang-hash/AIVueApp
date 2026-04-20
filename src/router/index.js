import { createRouter, createWebHistory } from 'vue-router'
import {useUserStore} from "@/stores/user.js";
import {usePageStore} from "@/stores/PageStore.js";

// 懒加载组件变量定义（统一格式：const 组件名 = () => import('组件路径')）
const RechargeAgreementPage = () => import('@/components/MyPage/MyHomePageComponents/MyWalletComponents/RechargeAgreementPage.vue');
const PaymentPage = () => import('@/components/MyPage/MyHomePageComponents/MyWalletComponents/PaymentPage.vue');
const MyWallet = () => import('@/components/MyPage/MyHomePageComponents/MyWalletComponents/MyWallet.vue');
const ChatPage = () => import('@/components/MyPage/MyHomePageComponents/MyMessagePageComponents/ChatPage.vue');
const MyMessage = () => import('@/components/MyPage/MyHomePageComponents/MyMessagePageComponents/MyMessage.vue');
const MyHomePageMain = () => import('@/components/MyPage/MyHomePageComponents/MyHomePageMain.vue');
const MockCallbackPage = () => import('@/components/MyPage/MyHomePageComponents/MyWalletComponents/MockCallbackPage.vue');
const EditProfilePage = () => import('@/components/MyPage/MyHomePageComponents/MySettingPageComponents/EditProfilePage.vue');
const ChangePasswordPage = () => import('@/components/MyPage/MyHomePageComponents/MySettingPageComponents/ChangePasswordPage.vue');
const ChangeEmailPage = () => import('@/components/MyPage/MyHomePageComponents/MySettingPageComponents/ChangeEmailPage.vue');
const CancelAccountPage = () => import('@/components/MyPage/MyHomePageComponents/MySettingPageComponents/CancelAccountPage.vue');
const MyHelpCenter = () => import('@/components/MyPage/MyHomePageComponents/MyHelpCenter.vue');
const CollectionPage = () => import('@/components/MyPage/MyHomePageComponents/CollectionPage.vue');
const LoginPage = () => import('@/components/MyPage/LoginPage.vue');
const RegisterPage = () => import('@/components/MyPage/RegisterPage.vue');
const ForgetPassword = () => import('@/components/MyPage/ForgetPassword.vue');
const FeedbackPage = () => import('@/components/MyPage/MyHomePageComponents/FeedbackPage.vue');
const MySettingsPageMain = () => import('@/components/MyPage/MyHomePageComponents/MySettingPageComponents/MySettingPageMain.vue');

// 原有示例（保留参考）
const AppIntroduction = () => import('@/views/AppIntroduction.vue') // 应用介绍主页
const Personal = () => import('@/views/Personal.vue') // 个人中心页面
const LoginRegisterPage = () => import('@/components/SplashPage/LoginRegisterPage.vue') // 登录注册页面组件（路径请根据你的实际文件位置调整）
const HomeLoginPage = () => import('@/components/SplashPage/HomeLoginPage.vue')
const HomeRegisterPage = () => import('@/components/SplashPage/HomeRegisterPage.vue')
const HomeChat = () => import('@/components/SplashPage/HomeChat.vue')

const ChatList = () => import('@/components/AiSession/ChatList.vue') // AI会话列表组件
const AiChat = () => import('@/components/AiSession/AiChat/AIChat.vue') // AI会话列表组件
const AiSettings = () => import('@/components/AiSession/AiChat/AiSettings.vue')

const WeAgent = () => import('@/components/WeAgent/WeAgent.vue')

const ContactList = () => import('@/components/Contact/ContactList.vue')
// 新增：联系人详情页懒加载导入
const ContactProfile = () => import('@/components/Contact/ContactProfile.vue')
const EditProfile = () => import('@/components/Contact/EditProfile.vue') // 🔥 新增

const Message = () => import('@/components/Message/Message.vue') // 消息组件

// 第二步：路由规则配置（引用上述变量 + 添加 meta 配置）
const routes = [
    {
        path: '/',          // 默认根路径
        name: 'AppIntroduction',
        component: AppIntroduction, // 引用懒加载变量
        // 路由 meta 配置（可自定义字段，用于页面标题、权限、描述等）
        meta: {
            title: '应用介绍 - 首页', // 页面标题
            description: '这是应用的介绍主页，展示核心功能与使用说明' // 页面描述
        }
    },
    {
        path: '/personal',
        name: 'Personal',
        component: Personal, // 引用懒加载变量
        meta: {
            title: '个人中心', // 页面标题
            description: '个人中心页面，展示用户信息与设置'
        },
        children: [
            {
                path: '', // 完整路径：/personal/（可自定义路径）
                name: 'LoginRegisterPage',
                component: LoginRegisterPage,
                meta: {
                    title: '登录注册',
                    description: '用户登录与注册页面',
                    branch: 'LoginRegisterPage', // 对应组件的 branch 字段
                    showFooterNav: false
                    // 无需添加 requiresAuth：登录注册页不鉴权（默认 false）
                }
            },
            {
                path: 'home-login', // 完整路径：/splash/home-login
                name: 'HomeLoginPage',
                component: HomeLoginPage,
                meta: {
                    title: '首页登录',
                    description: '首页快捷登录页面',
                    branch: 'HomeLoginPage',
                    showFooterNav: false // 隐藏底部栏
                    // 无需添加 requiresAuth：登录页不鉴权
                }
            },
            {
                path: 'home-register', // 完整路径：/splash/home-register
                name: 'HomeRegisterPage',
                component: HomeRegisterPage,
                meta: {
                    title: '首页注册',
                    description: '首页快捷注册页面',
                    branch: 'HomeRegisterPage',
                    showFooterNav: false // 隐藏底部栏
                    // 无需添加 requiresAuth：注册页不鉴权
                }
            },
            {
                path: 'home-chat', // 完整路径：/splash/home-chat
                name: 'HomeChatPage',
                component: HomeChat,
                meta: {
                    title: '游客聊天页',
                    description: '首页游客版AI聊天页面',
                    branch: 'HomeChatPage',
                    showFooterNav: false, // 隐藏底部栏
                    // 不添加 requiresAuth：游客页不鉴权
                }
            },
            {
                path: 'chat-list', // 完整路径：/personal/chat-list
                name: 'ChatListPage',
                component: ChatList,
                meta: {
                    title: 'AI会话列表',
                   //  keepAlive: true,
                    description: '展示用户的AI会话记录',
                    branch: 'ChatListPage', // 新增branch字段
                    requiresAuth: true // 新增：需要鉴权
                }
            },
            // 微智能路由配置（放在 personal 子路由数组中，和 ChatListPage 同级）
            {
                path: 'we-agent', // 完整路径：/personal/we-agent
                name: 'WeAgentPage',
                component: WeAgent,
                meta: {
                    title: '微智能',
                    description: '微智能功能介绍与开关设置',
                    branch: 'WeAgentPage', // branch 和路由名一致
                    requiresAuth: true // 需要登录鉴权
                }
            },
            {
                path: 'chat-list/chat/:sessionUuid?', // 核心修改：sessionId → sessionUuid，保留?表示非必填
                name: 'AiChat',
                component: AiChat,
                meta: {
                    title: 'AI会话详情',
                    description: '展示单个AI会话的聊天记录',
                    branch: 'ChatListPage',
                    showFooterNav: false,
                    requiresAuth: true // 新增：需要鉴权
                },
                props: true // 保持props:true，组件内可直接通过props接收sessionUuid参数
            },
            {
                path: 'chat-list/chat/settings', // 保持原有扁平化路径不变
                name: 'AiSettings', // 路由名保留，匹配设置页面语义
                component: AiSettings, // 替换为设置页面组件
                meta: {
                    title: 'AI模式设置', // 修正标题：从“AI会话详情”改为“AI模式设置”
                    description: 'AI模式相关配置（回复风格、记忆模式、高级设置等）', // 修正描述匹配设置页面
                    branch: 'ChatListPage', // 保留归属分支，保持激活逻辑统一
                    showFooterNav: false,
                    requiresAuth: true // 新增：需要鉴权
                }
                // 移除 props: true（核心修改：不再开启props传参）
            },
            {
                path: 'contact', // 完整路径：/personal/contact
                name: 'ContactPage', // 定档名称
                component: ContactList,
                meta: {
                    title: '通讯',
                    description: '联系人列表，支持搜索与添加',
                    branch: 'ContactPage', // 匹配导航激活
                    requiresAuth: true
                }
            },
            // 👇 新增：平行嵌套页面（非子路由，同级路由 + 路径嵌套）
            {
                path: 'contact/profile', // 完整路径：/personal/contact/profile（路径嵌套）
                name: 'ContactProfilePage', // 唯一路由名称（避免冲突）
                component: ContactProfile, // 懒加载组件
                meta: {
                    title: '联系人资料',
                    description: '联系人详情查看/编辑',
                    branch: 'ContactPage', // 保持导航激活匹配一致
                    requiresAuth: true
                }
            },
            {
                path: 'contact/edit', // 完整路径：/personal/contact/edit
                name: 'ContactEditProfilePage', // 唯一名称，无冲突
                component: EditProfile, // 懒加载组件
                meta: {
                    title: '编辑联系人资料',
                    description: '联系人资料编辑页面',
                    branch: 'ContactPage', // 导航激活保持一致
                    requiresAuth: true,
                    showFooterNav: false,
                }
            },
            {
                path: 'message', // 完整路径：/personal/message
                name: 'MessagePage',
                component: Message,
                meta: {
                    title: '消息中心',
                    description: '消息中心页面，展示系统通知与用户消息',
                    branch: 'MessagePage', // 新增branch字段
                    requiresAuth: true // 新增：需要鉴权
                }
            },
            {
                path: 'my',
                name: 'MyHomePageMain',
                component: MyHomePageMain,
                meta: {
                    title: '我的',
                    requiresAuth: true, // 已有：保留
                    branch: 'MyPage'
                }
            },
            {
                path: 'my/message',
                name: 'MyMessage',
                component: MyMessage,
                meta: { requiresAuth: true, branch: 'MyPage' } // 新增 branch: MyPage
            },
            {
                path: 'my/message/chat',
                name: 'ChatPage',
                component: ChatPage,
                meta: { requiresAuth: true, branch: 'MyPage' } // 新增 branch: MyPage
            },
            {
                path: 'my/wallet',
                name: 'MyWallet',
                component: MyWallet,
                meta: { requiresAuth: true, branch: 'MyPage' } // 新增 branch: MyPage
            },
            {
                path: 'my/wallet/payment/:orderNo',
                name: 'PaymentPage',
                component: PaymentPage,
                props: true,
                meta: {
                    title: '支付页面',
                    showFooterNav: false,
                    requiresAuth: true,
                    branch: 'MyPage' // 新增 branch: MyPage
                }
            },
            {
                path: 'my/wallet/recharge-agreement',
                name: 'RechargeAgreementPage',
                component: RechargeAgreementPage,
                meta: {
                    title: '充值服务协议',
                    showFooterNav: false,
                    requiresAuth: true,
                    branch: 'MyPage' // 新增 branch: MyPage
                }
            },
            {
                path: 'my/wallet/mock-callback/:orderNo/:payType',
                name: 'MockCallbackPage',
                component: MockCallbackPage,
                props: true,
                meta: {
                    title: '测试版模拟回调',
                    showFooterNav: false,
                    requiresAuth: true,
                    branch: 'MyPage' // 新增 branch: MyPage
                }
            },
            {
                path: 'my/personal-settings',
                name: 'MySettingMain',
                component: MySettingsPageMain,
                meta: { requiresAuth: true, branch: 'MyPage' } // 新增 branch: MyPage
            },
            {
                path: 'my/personal-settings/edit-profile',
                name: 'EditProfile',
                component: EditProfilePage,
                meta: { requiresAuth: true, branch: 'MyPage' } // 新增 branch: MyPage
            },
            {
                path: 'my/personal-settings/change-password',
                name: 'ChangePassword',
                component: ChangePasswordPage,
                meta: { requiresAuth: true, branch: 'MyPage' } // 新增 branch: MyPage
            },
            {
                path: 'my/personal-settings/change-email',
                name: 'ChangeEmail',
                component: ChangeEmailPage,
                meta: { requiresAuth: true, branch: 'MyPage' } // 新增 branch: MyPage
            },
            {
                path: 'my/personal-settings/cancel-account',
                name: 'CancelAccount',
                component: CancelAccountPage,
                meta: { requiresAuth: true, branch: 'MyPage' } // 新增 branch: MyPage
            },
            {
                path: 'my/help-center',
                name: 'MyHelpCenter',
                component: MyHelpCenter,
                meta: { title: '帮助中心', requiresAuth: true, branch: 'MyPage' } // 新增 branch: MyPage
            },
            {
                path: 'my/feedback',
                name: 'MyFeedback',
                component: FeedbackPage,
                meta: { requiresAuth: true, branch: 'MyPage' } // 新增 branch: MyPage
            },
            {
                path: 'my/collection',
                name: 'MyCollection',
                component: CollectionPage,
                meta: { requiresAuth: true, branch: 'MyPage' } // 新增 branch: MyPage
            },
            {
                path: 'my/login',
                name: 'LoginPage',
                component: LoginPage,
                meta: {
                    title: '用户登录',
                    requiresAuth: false,
                    branch: 'MyPage' // 新增 branch: MyPage
                }
            },
            {
                path: 'my/register',
                name: 'MyRegister',
                component: RegisterPage,
                meta: {
                    title: '用户注册',
                    requiresAuth: false,
                    branch: 'MyPage' // 新增 branch: MyPage
                }
            },
            {
                path: 'my/forget-password',
                name: 'ForgetPassword',
                component: ForgetPassword,
                meta: {
                    title: '忘记密码',
                    requiresAuth: false,
                    branch: 'MyPage' // 新增 branch: MyPage
                }
            },
        ]
    }
]

// 创建路由实例
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

// 全局前置守卫：登录校验 + 页面标题 + 底部导航控制
router.beforeEach((to, from, next) => {
    const userStore = useUserStore()
    const pageStore = usePageStore()  // 获取页面状态 store

    // 🌟 核心修改：从路径判断改为路由名称判断
    // 登录页：name === 'LoginPage'
    const isLoginPage = to.name === 'LoginPage'
    // 注册页：name === 'MyRegister'
    const isRegisterPage = to.name === 'MyRegister'
    // 忘记密码页：新增判断（对应 name: 'ForgetPassword'）
    const isForgetPasswordPage = to.name === 'ForgetPassword'

    // 1. 登录/注册/忘记密码页直接放行（包含你新增的忘记密码页）
    if (isLoginPage || isRegisterPage || isForgetPasswordPage) {
        if (to.meta.title) document.title = to.meta.title
        next()
        return
    }

    // 2. 需要登录的页面，未登录跳转登录
    if (to.meta.requiresAuth && !userStore.isLogin) {
        // 跳转时也用名称匹配（更稳定），而非硬编码路径
        next({ name: 'LoginRegisterPage' })
        return  // 记得 return，避免继续往下执行
    }

    // 3. 设置页面标题（所有页面都支持）
    if (to.meta.title) {
        document.title = to.meta.title
    }

    // 4. 新增：根据路由 meta 控制底部导航栏显示/隐藏
    // 如果路由配置了 showFooterNav，就用它；否则默认显示（true）
    const shouldShowFooterNav = to.meta.showFooterNav ?? true
    pageStore.setFooterNavVisible(shouldShowFooterNav)

    // 5. 正常放行
    next()
})

export default router