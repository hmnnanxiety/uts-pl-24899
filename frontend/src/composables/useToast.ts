import { ref } from 'vue'
const messages = ref<{ id: number; message: string }[]>([])
let sequence = 0
export function useToast() {
  function dismiss(id: number) { messages.value = messages.value.filter(item => item.id !== id) }
  function notify(message: string) {
    const id = ++sequence
    messages.value.push({ id, message })
    window.setTimeout(() => dismiss(id), 6000)
  }
  return { messages, notify, dismiss }
}
