import { HttpAgent } from '@ag-ui/client'
import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useAgUi(url, accessToken = null) {
    const agentConfig = { url }
    if (accessToken) {
        agentConfig.accessToken = accessToken
    }
    const agent = new HttpAgent(agentConfig)
    const messages = ref([])
    const state = ref(null)
    const isThinking = ref(false)

    let subscription = null
    onMounted(() => {
        // subscribe with handler object — the client calls specific handler methods
        subscription = agent.subscribe({
            onRunStartedEvent: ({ event }) => {
                // could capture thread/run ids if needed
                isThinking.value = true
            },
            onTextMessageStartEvent: ({ event }) => {
                const { messageId, role = 'assistant' } = event || {}
                if (!messageId) return
                isThinking.value = false
                messages.value.push({ id: messageId, role, content: '' })
            },
            onTextMessageContentEvent: ({ event }) => {
                const { messageId, delta } = event || {}
                if (!messageId) return
                const m = messages.value.find(x => x.id === messageId)
                if (m) {
                    m.content = (typeof m.content === 'string' ? m.content : '') + (delta || '')
                } else {
                    // fallback: push as new message
                    messages.value.push({ id: messageId, role: 'assistant', content: delta || '' })
                }
            },
            onTextMessageEndEvent: ({ event }) => {
                // message finished — nothing special required here
            },
            onMessagesSnapshotEvent: ({ event }) => {
                if (event && event.messages) {
                    messages.value = event.messages.map(m => ({ id: m.id, role: m.role, content: m.content }))
                }
            },
            onStateSnapshotEvent: ({ event }) => {
                if (!event) return
                state.value = event.snapshot ?? event.state ?? null
            },
            onRunFinishedEvent: ({ event }) => {
                // run finished
                isThinking.value = false
            }
        })
    })

    onBeforeUnmount(() => {
        if (subscription && typeof subscription.unsubscribe === 'function') subscription.unsubscribe()
    })

    const send = async (text) => {
        // Add user message to UI immediately
        messages.value.push({ role: 'user', content: text })
        agent.addMessage({ role: 'user', content: text })
        // Send only the new message - HttpAgent tracks conversation internally
        await agent.runAgent()
    }

    return { messages, state, isThinking, send }
}
