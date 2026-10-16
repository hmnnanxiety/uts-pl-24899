<script setup lang="ts">
import { ref } from 'vue'
import { Plus, RefreshCw, Trash2, Search, X, ChevronLeft, ChevronRight } from '@lucide/vue'
import DeleteGearDialog from '../components/DeleteGearDialog.vue'
import type { Gear } from '../types'
import { useInventory } from '../composables/useInventory'
import { useCatalog } from '../composables/useCatalog'
import { categories, statuses } from '../lib/gear'
import GearCard from '../components/GearCard.vue'
import StatePanel from '../components/StatePanel.vue'
const { items, loading, error, load } = useInventory()
const {
  search,
  category,
  status,
  sort,
  filtered,
  visible,
  active,
  reset,
  page,
  pages,
  pageSize,
  goToPage,
} = useCatalog(items)
const deleting = ref<Gear | null>(null)
function deleted(id: number) {
  items.value = items.value.filter((item) => item.id !== id)
  deleting.value = null
}
</script>
<template>
  <div class="page-heading">
    <div>
      <p class="eyebrow">THE TOOLS OF YOUR CRAFT</p>
      <h1>The equipment archive<span class="accent">.</span></h1>
      <p>A considered collection. Ready for whatever comes next.</p>
    </div>
    <RouterLink to="/gear/new" class="button primary"><Plus :size="17" />Add equipment</RouterLink>
  </div>
  <div class="catalog-controls">
    <div class="search-field">
      <label for="gear-search" class="sr-only">Search equipment</label><Search :size="18" /><input
        id="gear-search"
        v-model="search"
        type="search"
        placeholder="Search name, brand, model, or code…"
        autocomplete="off"
      /><button v-if="search" class="icon-button" aria-label="Clear search" @click="search = ''">
        <X :size="15" />
      </button>
    </div>
    <div class="filter-select">
      <label for="status-filter" class="sr-only">Filter by availability</label
      ><select id="status-filter" v-model="status">
        <option value="">All availability</option>
        <option v-for="option in statuses" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </div>
    <div class="filter-select">
      <label for="sort-order" class="sr-only">Sort equipment</label
      ><select id="sort-order" v-model="sort">
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
        <option value="name">Name A–Z</option>
        <option value="brand">Brand A–Z</option>
      </select>
    </div>
  </div>
  <div class="category-filters" role="group" aria-label="Filter by category">
    <button :aria-pressed="!category" @click="category = ''">All equipment</button
    ><button
      v-for="option in categories"
      :key="option.value"
      :aria-pressed="category === option.value"
      @click="category = option.value"
    >
      {{ option.plural }}
    </button>
  </div>
  <StatePanel v-if="loading" title="Finding your gear…" kind="loading" />
  <StatePanel v-else-if="error" title="The archive couldn’t load" :description="error" kind="error"
    ><button class="button" @click="load">Try again</button></StatePanel
  >
  <template v-else>
    <div id="catalog-results" class="catalog-summary" tabindex="-1">
      <p aria-live="polite">
        {{ filtered.length }} of {{ items.length }} {{ items.length === 1 ? 'piece' : 'pieces'
        }}<span v-if="filtered.length">
          · Showing {{ (page - 1) * pageSize + 1 }}–{{
            Math.min(page * pageSize, filtered.length)
          }}</span
        >
      </p>
      <div class="actions">
        <button v-if="active" class="reset-filters" @click="reset">
          Reset filters<X :size="13" /></button
        ><button class="icon-button" aria-label="Refresh inventory" @click="load">
          <RefreshCw :size="16" />
        </button>
      </div>
    </div>
    <div v-if="visible.length" class="gear-grid">
      <GearCard v-for="item in visible" :key="item.id" :item="item"
        ><button class="icon-button" :aria-label="`Delete ${item.name}`" @click="deleting = item">
          <Trash2 :size="15" /></button
      ></GearCard>
    </div>
    <StatePanel
      v-else-if="items.length"
      title="Nothing in this frame."
      description="Try another name, inventory code, or a different combination of filters."
      ><button class="button" @click="reset">Clear all filters</button></StatePanel
    >
    <StatePanel
      v-else
      title="An empty shelf. A fresh start."
      description="Add the cameras, lenses, and everyday essentials that make your studio work."
      ><RouterLink to="/gear/new" class="button primary"
        ><Plus :size="16" />Add your first equipment</RouterLink
      ></StatePanel
    >
    <nav v-if="pages > 1" class="pagination" aria-label="Equipment pages">
      <button class="button" :disabled="page === 1" @click="goToPage(page - 1)">
        <ChevronLeft :size="16" />Previous</button
      ><span>Page {{ page }} of {{ pages }}</span
      ><button class="button" :disabled="page === pages" @click="goToPage(page + 1)">
        Next<ChevronRight :size="16" />
      </button>
    </nav>
  </template>
  <DeleteGearDialog v-if="deleting" :item="deleting" @close="deleting = null" @deleted="deleted" />
</template>
