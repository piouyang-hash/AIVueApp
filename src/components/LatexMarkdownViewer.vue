<template>
  <div class="markdown-render" v-html="renderedHtml"></div>
</template>

<script setup>
import { computed, watch } from 'vue'
import MarkdownIt from 'markdown-it'
import markdownItKatex from '@ruanyf/markdown-it-katex'
import hljs from 'highlight.js'
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/vs2015.css'

// 接收 AI 传来的 markdown 文本
const props = defineProps({
  markdown: {
    type: String,
    default: ''
  }
})

// 初始化渲染器（你验证成功的配置）
const md = new MarkdownIt({
  html: false,
  breaks: true,
  linkify: true,
  typographer: true,
  // 代码高亮
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value
      } catch (_) {}
    }
    return md.utils.escapeHtml(str)
  }
})

// 注册插件（你成功的写法！）
md.use(markdownItKatex)

// 监听 AI 文本变化，自动渲染
const renderedHtml = computed(() => {
  return md.render(props.markdown || '')
})
</script>

<style scoped>
.markdown-render {
  width: 100%;
  line-height: 1.7;
  font-size: 15px;
}

/* 公式样式 */
:deep(.katex) {
  font-size: 1em;
  margin: 0 2px;
}

:deep(.katex-display) {
  margin: 12px 0;
}

/* 代码块 */
:deep(pre) {
  background: #2d2d2d;
  color: #f0f0f0;
  padding: 14px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 12px 0;
}

/* 行内代码 */
:deep(:not(pre) > code) {
  background: #ffebee;
  color: #d32f2f;
  padding: 2px 4px;
  border-radius: 4px;
}

/* 表格 */
:deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
}

:deep(th), :deep(td) {
  border: 1px solid #ddd;
  padding: 8px 12px;
}

:deep(th) {
  background: #f5f5f5;
  font-weight: bold;
}
</style>