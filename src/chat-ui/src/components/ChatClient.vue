<script setup>
import { ref, computed } from 'vue'
import { useAgUi } from '../composables/useAgUi'
import { useEnv } from '../composables/useEnv'
import { marked } from 'marked'

const { serverUrl, accessToken, loadEnv } = useEnv()

// Ensure runtime .env (if present at /\.env) is loaded before creating the HttpAgent.
// We use top-level await here so `useAgUi` can register its `onMounted` handlers correctly.
await loadEnv()

const { messages, send, isThinking } = useAgUi(serverUrl.value || '', accessToken.value || '')
const input = ref('')

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true
})

const renderedMessages = computed(() => {
  return messages.value.map(m => ({
    ...m,
    html: marked.parse(m.content || '')
  }))
})

const handleSend = async () => {
  if (!input.value.trim()) return
  await send(input.value)
  input.value = ''
}

</script>

<template>
  <section class="chat-client">
    <div class="status">Server: {{ status }}</div>

    <div class="messages">
      <div v-for="(m, i) in renderedMessages" :key="i" :class="['msg', m.role]">
        <strong>{{ m.role }}:</strong>
        <div class="content" v-html="m.html"></div>
      </div>
      <div v-if="isThinking" class="msg assistant thinking">
        <strong>assistant:</strong>
        <div class="content">
          <span class="dots">...</span>
        </div>
      </div>
    </div>

    <div class="composer">
      <textarea v-model="input" @keyup.enter.exact="handleSend" placeholder="Type a message..." rows="3"></textarea>
      <button @click="handleSend">Send</button>
    </div>
  </section>
</template>

<style scoped>
.chat-client { padding: 1rem; border: 1px solid var(--color-border); border-radius: 8px; }
.status { margin-bottom: 0.5rem; font-size: 0.9rem }
.messages { max-height: 240px; overflow: auto; margin-bottom: 0.5rem }
.msg { padding: 0.25rem 0 }
.msg.user { text-align: right }
.msg .content { display: inline-block; text-align: left; max-width: 100% }
.msg .content :deep(pre) { background: #f5f5f5; padding: 0.5rem; border-radius: 4px; overflow-x: auto }
.msg .content :deep(code) { background: #f5f5f5; padding: 0.125rem 0.25rem; border-radius: 2px; font-family: monospace }
.msg .content :deep(pre code) { background: none; padding: 0 }
.msg .content :deep(p) { margin: 0.25rem 0 }
.msg .content :deep(ul), .msg .content :deep(ol) { margin: 0.25rem 0; padding-left: 1.5rem }
.msg.thinking .dots { animation: blink 1.4s infinite }
@keyframes blink {
  0%, 20% { opacity: 0.2 }
  50% { opacity: 1 }
  100% { opacity: 0.2 }
}
.composer { display:flex; gap:0.5rem; align-items: flex-start }
.composer textarea { flex:1; resize: vertical; font-family: inherit; padding: 0.5rem }
</style>
