<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Trash2, X, LoaderCircle } from '@lucide/vue'
import { gearApi } from '../api/gear'
import { errorMessage, statusOf } from '../api/errors'
import { useToast } from '../composables/useToast'
import type { Gear } from '../types'
const props = defineProps<{ item: Gear }>()
const emit = defineEmits<{ close: []; deleted: [id: number] }>()
const { notify } = useToast()
const dialog = ref<HTMLDialogElement>(),
  busy = ref(false),
  error = ref('')
const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
const previousOverflow = document.body.style.overflow
onMounted(() => {
  dialog.value?.showModal()
  document.body.style.overflow = 'hidden'
})
onBeforeUnmount(() => {
  dialog.value?.close()
  document.body.style.overflow = previousOverflow
  if (opener?.isConnected) opener.focus()
})
function close() {
  if (!busy.value) emit('close')
}
function trapFocus(event: KeyboardEvent) {
  if (event.key !== 'Tab') return
  const controls = dialog.value?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')
  if (!controls?.length) {
    event.preventDefault()
    return
  }
  const first = controls[0],
    last = controls[controls.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last?.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first?.focus()
  }
}
async function remove() {
  if (busy.value) return
  busy.value = true
  error.value = ''
  try {
    await gearApi.remove(props.item.id)
    notify('Equipment removed from the archive.')
    emit('deleted', props.item.id)
  } catch (err) {
    if (statusOf(err) === 404) {
      notify('This equipment was already removed.')
      emit('deleted', props.item.id)
    } else error.value = errorMessage(err)
  } finally {
    busy.value = false
  }
}
</script>
<template>
  <Teleport to="body"
    ><dialog
      ref="dialog"
      class="delete-dialog"
      aria-labelledby="delete-title"
      aria-describedby="delete-description"
      :aria-busy="busy"
      @cancel.prevent="close"
      @keydown="trapFocus"
      @click="
        (event) => {
          if (event.target === dialog) close()
        }
      "
    >
      <div class="dialog-inner">
        <div class="dialog-top">
          <span class="delete-symbol"><Trash2 :size="23" /></span
          ><button
            class="icon-button"
            aria-label="Close delete confirmation"
            :disabled="busy"
            @click="close"
          >
            <X :size="19" />
          </button>
        </div>
        <p class="eyebrow">REMOVE FROM THE ARCHIVE</p>
        <h2 id="delete-title">Retire this record?</h2>
        <p id="delete-description">
          You’re about to permanently delete <strong>{{ item.name }}</strong>
          <span class="mono">({{ item.code }})</span>. This cannot be undone.
        </p>
        <div v-if="error" class="alert" role="alert">{{ error }}</div>
        <div class="dialog-actions">
          <button class="button" autofocus :disabled="busy" @click="close">Keep equipment</button
          ><button class="button danger" :disabled="busy" @click="remove">
            <LoaderCircle v-if="busy" class="spin" :size="16" /><Trash2 v-else :size="16" />{{
              busy ? 'Removing…' : 'Delete equipment'
            }}
          </button>
        </div>
      </div>
    </dialog></Teleport
  >
</template>
