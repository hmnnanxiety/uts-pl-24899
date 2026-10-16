<script setup lang="ts">
import { labelFor } from '../lib/gear'
defineProps<{ status: string }>()
</script>
<template>
  <span class="status-badge" :class="status"><span></span>{{ labelFor(status) }}</span>
</template>
