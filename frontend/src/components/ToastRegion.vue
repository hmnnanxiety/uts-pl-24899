<script setup lang="ts">
import { CheckCircle2, X } from '@lucide/vue'
import { useToast } from '../composables/useToast'
const { messages, dismiss } = useToast()
</script>
<template>
  <div class="toast-region" aria-live="polite" aria-atomic="false">
    <div v-for="item in messages" :key="item.id" class="toast">
      <CheckCircle2 :size="19" /><span>{{ item.message }}</span
      ><button class="icon-button" aria-label="Dismiss notification" @click="dismiss(item.id)">
        <X :size="16" />
      </button>
    </div>
  </div>
</template>
