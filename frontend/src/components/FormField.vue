<script setup lang="ts">
defineProps<{ name: string; label: string; required?: boolean; error?: string; hint?: string }>()
</script>
<template>
  <div class="field">
    <label :for="`gear-${name}`"
      >{{ label }}<span v-if="required" class="required-mark" aria-hidden="true"> *</span></label
    ><slot
      :id="`gear-${name}`"
      :invalid="!!error"
      :describedby="error ? `error-${name}` : hint ? `hint-${name}` : undefined"
    />
    <p v-if="error" :id="`error-${name}`" class="field-error">{{ error }}</p>
    <p v-else-if="hint" :id="`hint-${name}`" class="field-hint">{{ hint }}</p>
  </div>
</template>
