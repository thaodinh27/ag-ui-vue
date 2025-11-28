<script setup>
import { ref } from 'vue'
import { useAgUi } from '../composables/useAgUi'

const { messages, send } = useAgUi('http://localhost:5274/agent')
const input = ref('')

</script>

<template>
  <section class="chat-client">
    <div class="status">Server: {{ status }}</div>

    <div class="messages">
      <div v-for="(m, i) in messages" :key="i" :class="['msg', m.role]">
        <strong>{{ m.role }}:</strong>
        <span>{{ m.content }}</span>
      </div>
    </div>

    <div class="composer">
      <input v-model="input" @keyup.enter="send(input)" placeholder="Type a message..." />
      <button @click="send(input)">Send</button>
    </div>
  </section>
</template>

<style scoped>
.chat-client { padding: 1rem; border: 1px solid var(--color-border); border-radius: 8px; }
.status { margin-bottom: 0.5rem; font-size: 0.9rem }
.messages { max-height: 240px; overflow: auto; margin-bottom: 0.5rem }
.msg { padding: 0.25rem 0 }
.msg.user { text-align: right }
.composer { display:flex; gap:0.5rem }
.composer input { flex:1 }
</style>
