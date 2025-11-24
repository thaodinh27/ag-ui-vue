import { HttpAgent } from '@ag-ui/client'
import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useAgUi(url) {
    const agent = new HttpAgent({ url })
    const messages = ref([])
    const state = ref(null)

    let subscription = null
    onMounted(() => {
        // subscribe with handler object — the client calls specific handler methods
        subscription = agent.subscribe({
            onRunStartedEvent: ({ event }) => {
                // could capture thread/run ids if needed
            },
            onTextMessageStartEvent: ({ event }) => {
                const { messageId, role = 'assistant' } = event || {}
                if (!messageId) return
                messages.value.push({ id: messageId, role, content: '...' })
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

    return { messages, state, send }
}
