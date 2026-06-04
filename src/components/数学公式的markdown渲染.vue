npm install markdown-it-katex katex

<template>
  <div class="markdown-render" @click="$emit('click', $event)">
    <VueMarkdown
        :source="markdown"
        :options="mdOptions"
    />
  </div>
</template>

<script setup>
import VueMarkdown from 'vue-markdown-render'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/vs2015.css'

// 🔥 新增：LaTeX 公式渲染插件 + 样式
import markdownItKatex from 'markdown-it-katex'
import 'katex/dist/katex.min.css'

const props = defineProps({
  markdown: { type: String, default: '' },
  renderBlock: { type: Boolean, default: true }
})

defineEmits(['click'])

// ==================== MarkdownIt 配置 ====================
const mdOptions = new MarkdownIt({
  html: false,
  xhtmlOut: false,
  breaks: true,
  linkify: true,
  typographer: true,

  // 代码高亮配置（原功能保留）
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value
      } catch (__) {}
    }
    return mdOptions.utils.escapeHtml(str)
  }
})
    // 🔥 核心：注册 LaTeX 插件，自动解析 $...$ 语法
    .use(markdownItKatex)

</script>

<style scoped>
.markdown-render {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  line-height: 1.6;
  font-size: 15px;
}

/* 表格样式（原功能保留） */
:deep(table) {
  width: 100% !important;
  border-collapse: collapse !important;
  margin: 12px 0 !important;
  table-layout: fixed;
}

:deep(th),
:deep(td) {
  border: 1.5px solid #555 !important;
  padding: 10px 12px !important;
  word-break: break-word;
}

:deep(th) {
  background: #e0e0e0 !important;
  font-weight: bold;
  color: #222;
}

/* 代码高亮样式（原功能保留） */
:deep(pre) {
  background: #2d2d2d !important;
  color: #f0f0f0 !important;
  padding: 14px 16px !important;
  border-radius: 8px !important;
  margin: 12px 0 !important;
  overflow-x: auto !important;
  border-left: 5px solid #61afef !important;
}

:deep(pre code) {
  background: none !important;
  font-family: ui-monospace, SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace !important;
  font-size: 0.9em !important;
  line-height: 1.55 !important;
  white-space: pre !important;
}

:deep(:not(pre) > code) {
  background: #ffebee !important;
  color: #d32f2f !important;
  padding: 2px 6px !important;
  border-radius: 4px;
}

/* 🔥 新增：LaTeX 公式行内样式优化 */
:deep(.katex) {
  font-size: 1em !important;
  display: inline-block !important;
  margin: 0 2px !important;
}
</style>