// src/utils/storage.js
// 存储JWT的key（自定义，比如auth_token）
const TOKEN_KEY = 'ai_app_auth_token';

// 保存JWT到本地
export const setToken = (token) => {
    localStorage.setItem(TOKEN_KEY, token);
};

// 从本地获取JWT
export const getToken = () => {
    return localStorage.getItem(TOKEN_KEY) || '';
};

// 清除本地JWT（退出登录时用）
export const removeToken = () => {
    localStorage.removeItem(TOKEN_KEY);
};

// 检查JWT是否存在（非空）
export const hasToken = () => {
    return !!getToken();
};