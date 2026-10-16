<script setup lang="ts">
import { Plus, RefreshCw } from '@lucide/vue'
import { useInventory } from '../composables/useInventory'
import GearCard from '../components/GearCard.vue'
import StatePanel from '../components/StatePanel.vue'
const { items, loading, error, load } = useInventory()
</script>
<template>
  <div class="page-heading"><div><p class="eyebrow">THE TOOLS OF YOUR CRAFT</p><h1>The equipment archive<span class="accent">.</span></h1><p>A considered collection. Ready for whatever comes next.</p></div><RouterLink to="/gear/new" class="button primary"><Plus :size="17"/>Add equipment</RouterLink></div>
  <StatePanel v-if="loading" title="Finding your gear…" kind="loading"/>
  <StatePanel v-else-if="error" title="The archive couldn’t load" :description="error" kind="error"><button class="button" @click="load">Try again</button></StatePanel>
  <template v-else><div class="catalog-summary"><p>{{ items.length }} {{ items.length === 1 ? 'piece' : 'pieces' }} in the archive</p><button class="icon-button" aria-label="Refresh inventory" @click="load"><RefreshCw :size="16"/></button></div><div v-if="items.length" class="gear-grid"><GearCard v-for="item in items" :key="item.id" :item="item"/></div><StatePanel v-else title="An empty shelf. A fresh start." description="Add the cameras, lenses, and everyday essentials that make your studio work."><RouterLink to="/gear/new" class="button primary"><Plus :size="16"/>Add your first equipment</RouterLink></StatePanel></template>
</template>
