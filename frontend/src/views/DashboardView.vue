<script setup lang="ts">
import { computed } from 'vue'
import { ArrowUpRight, ArrowRight, Plus, Camera, CircleCheck, Aperture, Wrench } from '@lucide/vue'
import { useAuth } from '../composables/useAuth'
import { useInventory } from '../composables/useInventory'
import { inventoryStats } from '../lib/gear'
import GearCard from '../components/GearCard.vue'
import StatePanel from '../components/StatePanel.vue'
const { user } = useAuth()
const { items, loading, error, load } = useInventory()
const stats = computed(() => inventoryStats(items.value))
const recent = computed(() =>
  [...items.value]
    .sort((a, b) => b.created_at.localeCompare(a.created_at) || b.id - a.id)
    .slice(0, 3),
)
const firstName = computed(() => user.value?.name.trim().split(/\s+/)[0] || 'there')
const metrics = [
  { key: 'total', title: 'Total equipment', caption: 'Pieces in your archive', icon: Camera },
  { key: 'available', title: 'Available', caption: 'Ready for the next frame', icon: CircleCheck },
  { key: 'in_use', title: 'In use', caption: 'Out creating something', icon: Aperture },
  { key: 'maintenance', title: 'Maintenance', caption: 'Getting a little attention', icon: Wrench },
] as const
</script>
<template>
  <div class="page-heading">
    <div>
      <p class="eyebrow">YOUR STUDIO AT A GLANCE</p>
      <h1>Hello, {{ firstName }}<span class="accent">.</span></h1>
      <p>Great work starts with knowing what’s on hand.</p>
    </div>
    <RouterLink to="/gear/new" class="button primary"><Plus :size="17" />Add equipment</RouterLink>
  </div>
  <StatePanel v-if="loading" title="Opening the archive…" kind="loading" />
  <StatePanel
    v-else-if="error"
    title="Couldn’t load your equipment"
    :description="error"
    kind="error"
    ><button class="button" @click="load">Try again</button></StatePanel
  >
  <template v-else>
    <section class="metrics" aria-label="Equipment statistics">
      <RouterLink
        v-for="metric in metrics"
        :key="metric.key"
        :to="metric.key === 'total' ? '/gear' : { path: '/gear', query: { status: metric.key } }"
        class="metric"
        :class="metric.key"
        ><div class="metric-top">
          <span>{{ metric.title }}</span
          ><component :is="metric.icon" :size="18" />
        </div>
        <strong>{{ stats[metric.key].toLocaleString() }}</strong>
        <div class="metric-bottom">
          <span>{{ metric.caption }}</span
          ><ArrowUpRight :size="15" /></div
      ></RouterLink>
    </section>
    <section class="archive-banner">
      <div>
        <p class="eyebrow">LESS SEARCHING. MORE SHOOTING.</p>
        <h2>Everything in its place.<br />Every idea within reach.</h2>
        <RouterLink to="/gear" class="text-link"
          >Explore the equipment archive<ArrowRight :size="16"
        /></RouterLink>
      </div>
      <div class="banner-aperture" aria-hidden="true">
        <Aperture :size="190" :stroke-width="0.6" /><span>THE FRAMEVAULT COLLECTION</span>
      </div>
    </section>
    <section aria-labelledby="recent-heading">
      <div class="section-heading">
        <div>
          <p class="eyebrow">LATEST IN THE ARCHIVE</p>
          <h2 id="recent-heading">
            Recently added<span class="count-tag">{{
              recent.length.toString().padStart(2, '0')
            }}</span>
          </h2>
        </div>
        <RouterLink to="/gear" class="text-link"
          >View all equipment<ArrowUpRight :size="16"
        /></RouterLink>
      </div>
      <div v-if="recent.length" class="gear-grid">
        <GearCard v-for="item in recent" :key="item.id" :item="item" />
      </div>
      <StatePanel
        v-else
        title="Your archive starts here."
        description="Give your first piece of equipment a place to call home."
        ><RouterLink to="/gear/new" class="button primary"
          ><Plus :size="16" />Add your first equipment</RouterLink
        ></StatePanel
      >
    </section>
  </template>
</template>
