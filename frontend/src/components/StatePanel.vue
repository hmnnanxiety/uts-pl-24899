<script setup lang="ts">
import { Archive, AlertCircle, LoaderCircle } from '@lucide/vue'
defineProps<{ title: string; description?: string; kind?: 'loading' | 'error' | 'empty' }>()
</script>
<template>
  <div
    class="state-panel"
    :role="kind === 'error' ? 'alert' : 'status'"
    :aria-busy="kind === 'loading'"
  >
    <LoaderCircle v-if="kind === 'loading'" class="spin" :size="28" /><AlertCircle
      v-else-if="kind === 'error'"
      :size="28"
    /><Archive v-else :size="28" />
    <h2>{{ title }}</h2>
    <p v-if="description">{{ description }}</p>
    <slot />
  </div>
</template>
