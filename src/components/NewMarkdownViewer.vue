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
import hljs from 'highlight.js'        // ← 新增
import 'highlight.js/styles/vs2015.css'

const props = defineProps({
  markdown: { type: String, default: '' },
  renderBlock: { type: Boolean, default: true }
})

defineEmits(['click'])

// ==================== MarkdownIt 配置（新增高亮） ====================
const mdOptions = new MarkdownIt({
  html: false,
  xhtmlOut: false,
  breaks: true,
  linkify: true,
  typographer: true,

  // 🔥 核心：代码高亮配置
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value
      } catch (__) {}
    }
    // 语言没识别时也做转义防止 XSS
    return mdOptions.utils.escapeHtml(str)
  }
})
</script>

<style scoped>
.markdown-render {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  line-height: 1.6;
  font-size: 15px;


}

/* ====================== 表格 ====================== */
:deep(table) {
  width: 100% !important;
  border-collapse: collapse !important;
  margin: 12px 0 !important;
  table-layout: fixed;
}

:deep(th),
:deep(td) {
  border: 1.5px solid #555 !important;     /* 加粗 + 加深 */
  padding: 10px 12px !important;
  word-break: break-word;
}

:deep(th) {
  background: #e0e0e0 !important;
  font-weight: bold;
  color: #222;
}

/* ====================== 代码高亮样式 ====================== */
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

/* 行内代码 */
:deep(:not(pre) > code) {
  background: #ffebee !important;
  color: #d32f2f !important;
  padding: 2px 6px !important;
  border-radius: 4px;
}
</style>