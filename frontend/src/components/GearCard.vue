<script setup lang="ts">
import { ArrowUpRight, Pencil } from '@lucide/vue'
import ArchiveArt from './ArchiveArt.vue'
import StatusBadge from './StatusBadge.vue'
import { labelFor } from '../lib/gear'
import type { Gear } from '../types'
defineProps<{ item: Gear }>()
</script>
<template>
  <article class="gear-card">
    <RouterLink :to="`/gear/${item.id}`" class="gear-visual" :aria-label="`View ${item.name}`"
      ><span class="gear-category">{{ labelFor(item.category) }}</span
      ><ArchiveArt :category="item.category" /><span class="gear-visual-index">{{ item.code }}</span
      ><ArrowUpRight class="gear-open" :size="18"
    /></RouterLink>
    <div class="gear-card-content">
      <div class="gear-card-meta">
        <span class="inventory-code">{{ item.code }}</span
        ><StatusBadge :status="item.status" />
      </div>
      <h3>
        <RouterLink :to="`/gear/${item.id}`">{{ item.name }}</RouterLink>
      </h3>
      <p class="gear-brand">
        {{ item.brand }}<template v-if="item.model"> · {{ item.model }}</template>
      </p>
      <div class="gear-card-bottom">
        <span
          >Condition
          <strong :class="{ 'text-danger': item.condition === 'damaged' }">{{
            labelFor(item.condition)
          }}</strong></span
        >
        <div class="card-actions">
          <RouterLink
            :to="`/gear/${item.id}/edit`"
            class="icon-button"
            :aria-label="`Edit ${item.name}`"
            ><Pencil :size="15" /></RouterLink
          ><slot />
        </div>
      </div>
    </div>
  </article>
</template>
