import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';

// 【新增：补充缺失的pathResolve函数】（你代码里用了但没定义）
const pathResolve = (dir) => path.resolve(__dirname, dir);

// https://vite.dev/config/
export default defineConfig({
    // 插件配置（SVG插件 + Vue插件）
    plugins: [
        vue(),
        createSvgIconsPlugin({
            // 指定SVG文件目录（你的 @/static/icons/）
            iconDirs: [pathResolve('src/static/icons')],
            // 指定symbolId格式（和SvgIcon组件xlink:href对应）
            symbolId: 'icon-[name]',
            // 自定义插入位置
            inject: 'body-last',
            // 自定义DOM ID
            customDomId: '__svg__icons__dom__',
        }),
    ],

    // 路径解析配置（@别名）
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    },

    // 【核心修正：server配置从resolve里移出，改为同级】
    server: {
        port: 5175, // 端口改为5175
        open: true, // 启动后自动打开浏览器
        host: '0.0.0.0' // 允许局域网访问
    }
})