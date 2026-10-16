<script setup lang="ts">
defineProps<{ compact?: boolean }>()
</script>
<template>
  <span class="brand"><svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M12 3H3v9m17-9h9v9M3 20v9h9m17-9v9h-9" stroke="currentColor" stroke-width="2"/><path d="m16 9 6 3.5v7L16 23l-6-3.5v-7Z" stroke="currentColor" stroke-width="1.4"/></svg><span v-if="!compact">FrameVault<sup>®</sup></span></span>
</template>
