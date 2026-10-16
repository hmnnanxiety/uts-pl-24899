<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Pencil, MapPin, Trash2 } from '@lucide/vue'
import DeleteGearDialog from '../components/DeleteGearDialog.vue'
import { useGear } from '../composables/useGear'
import { formatDate, labelFor } from '../lib/gear'
import ArchiveArt from '../components/ArchiveArt.vue'
import StatusBadge from '../components/StatusBadge.vue'
import StatePanel from '../components/StatePanel.vue'
const route = useRoute()
const router = useRouter(), deleting = ref(false)
const { item, loading, error, missing, load } = useGear(String(route.params.id))
</script>
<template>
  <RouterLink to="/gear" class="text-link back-link"><ArrowLeft :size="16"/>Back to equipment</RouterLink>
  <StatePanel v-if="loading" title="Opening this record…" kind="loading"/>
  <StatePanel v-else-if="error" :title="missing ? 'This piece is out of frame.' : 'Couldn’t open this record'" :description="error" kind="error"><button v-if="!missing" class="button" @click="load">Try again</button><RouterLink v-else to="/gear" class="button">Browse equipment</RouterLink></StatePanel>
  <template v-else-if="item">
    <div class="page-heading"><div><p class="eyebrow">{{ labelFor(item.category) }} / {{ item.code }}</p><h1>{{ item.name }}</h1><p>{{ item.brand }}<template v-if="item.model"> · {{ item.model }}</template></p></div><div class="actions"><button class="button danger" @click="deleting = true"><Trash2 :size="16"/>Delete</button><RouterLink :to="`/gear/${item.id}/edit`" class="button primary"><Pencil :size="16"/>Edit equipment</RouterLink></div></div>
    <div class="detail-layout"><section class="detail-image"><div class="detail-art"><ArchiveArt :category="item.category"/><span class="detail-art-caption">{{ labelFor(item.category) }} / EQUIPMENT ARCHIVE</span></div><div class="detail-location"><MapPin :size="17"/><div><span>STORAGE LOCATION</span><p>{{ item.storage_location || 'Not recorded' }}</p></div></div></section>
      <section class="detail-info" aria-labelledby="record-heading"><p class="eyebrow">THE DETAILS</p><h2 id="record-heading">Equipment record</h2><dl class="properties"><div><dt>Inventory code</dt><dd class="mono">{{ item.code }}</dd></div><div><dt>Availability</dt><dd><StatusBadge :status="item.status"/></dd></div><div><dt>Category</dt><dd>{{ labelFor(item.category) }}</dd></div><div><dt>Condition</dt><dd :class="{ 'text-danger': item.condition === 'damaged' }">{{ labelFor(item.condition) }}</dd></div><div><dt>Brand</dt><dd>{{ item.brand }}</dd></div><div><dt>Model</dt><dd>{{ item.model || 'Not recorded' }}</dd></div><div><dt>Purchase date</dt><dd>{{ formatDate(item.purchase_date) }}</dd></div><div><dt>Added to archive</dt><dd>{{ formatDate(item.created_at, true) }}</dd></div><div><dt>Last updated</dt><dd>{{ formatDate(item.updated_at, true) }}</dd></div><div><dt>Created by</dt><dd>{{ item.created_by ? `Staff #${item.created_by}` : 'Not recorded' }}</dd></div></dl></section>
    </div><section class="detail-notes"><p class="eyebrow">FROM THE STUDIO</p><h2>Notes & observations</h2><p>{{ item.notes || 'No notes yet. Add care instructions, included accessories, or anything the next person should know.' }}</p></section>
    <DeleteGearDialog v-if="deleting" :item="item" @close="deleting = false" @deleted="router.replace('/gear')"/>
  </template>
</template>
