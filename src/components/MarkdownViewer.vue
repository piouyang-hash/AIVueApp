<template>
  <!-- 动态容器：适配行内/块级渲染 -->
  <component
      :is="renderBlock ? 'div' : 'span'"
      v-html="safeHtml"
      class="markdown-content"
      :style="containerStyle"
  ></component>
</template>

<script setup>
import { computed } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const props = defineProps({
  markdown: {
    type: String,
    default: ''
  },
  // 🔥 新增开关：默认false，不渲染块级(###)；传true，渲染标题/块级语法
  renderBlock: {
    type: Boolean,
    default: false
  }
})

// 计算属性：动态容器样式（保证无多余间距）
const containerStyle = computed(() => ({
  // 如果要支持标题等块级元素，必须用 block 或 flow-root
  display: props.renderBlock ? 'block' : 'inline',
  lineHeight: '1.5', // 建议给一个标准行高
  margin: 0,
  padding: 0
}))

const safeHtml = computed(() => {
  if (!props.markdown) return ''

  let processed = props.markdown
  if (props.renderBlock) {
    // 移除连续过多的空行（保留最多一个空行作为段落分隔）
    processed = props.markdown.replace(/\n{3,}/g, '\n\n')
  }

  let html
  if (props.renderBlock) {
    marked.setOptions({ gfm: true, breaks: false, headerIds: false })
    html = marked.parse(processed)
  } else {
    marked.setOptions({ gfm: false, breaks: false, headerIds: false })
    html = marked.parseInline(processed)
  }

  const allowedTags = props.renderBlock
      ? ['h1','h2','h3','h4','h5','h6','strong','b','code','em','i','p','ul','ol','li','blockquote']
      : ['strong','b','code','em','i']

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: []
  })
})
</script>

<style scoped>
/* 基础容器 – 保证紧凑 */
.markdown-content {
  display: inline;        /* 会被内联 style 覆盖，但保留兜底 */
  line-height: 1.4;       /* 全局紧凑行高 */
}

/* 穿透 scoped，强力重置所有块级元素的间距 */
:deep(.markdown-content) {
  line-height: 1.4;
}

:deep(.markdown-content p),
:deep(.markdown-content h1),
:deep(.markdown-content h2),
:deep(.markdown-content h3),
:deep(.markdown-content h4),
:deep(.markdown-content h5),
:deep(.markdown-content h6),
:deep(.markdown-content ul),
:deep(.markdown-content ol),
:deep(.markdown-content li),
:deep(.markdown-content blockquote) {
  margin: 0.2em 0 !important;   /* 强制上下间距极小 */
  padding: 0 !important;
}

/* 列表项内部可能有多行，保持紧凑 */
:deep(.markdown-content li) {
  margin: 0.1em 0 !important;
}

/* 标题可以稍微强调一点，但依然紧凑 */
:deep(.markdown-content h3) {
  margin: 0.3em 0 0.1em 0 !important;
  font-size: 1.1em;
}

/* 彻底隐藏由空行产生的孤立 <br>（可选） */
:deep(.markdown-content br) {
  display: none;
}
</style>