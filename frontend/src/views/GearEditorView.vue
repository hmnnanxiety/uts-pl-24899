<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@lucide/vue'
import GearForm from '../components/GearForm.vue'
import StatePanel from '../components/StatePanel.vue'
import { useGear } from '../composables/useGear'
import type { Gear } from '../types'
const route = useRoute(), router = useRouter()
const editing = route.name === 'gear-edit'
const { item, loading, error, missing, load } = useGear(editing ? String(route.params.id) : undefined)
function saved(record: Gear) { void router.push(`/gear/${record.id}`) }
</script>
<template>
  <RouterLink :to="editing ? `/gear/${route.params.id}` : '/gear'" class="text-link back-link"><ArrowLeft :size="16"/>{{ editing ? 'Back to record' : 'Back to equipment' }}</RouterLink>
  <div class="page-heading"><div><p class="eyebrow">{{ editing ? 'REFINE THE RECORD' : 'MAKE ROOM FOR SOMETHING GOOD' }}</p><h1>{{ editing ? 'Edit equipment' : 'A new addition' }}<span class="accent">.</span></h1><p>{{ editing ? 'Keep the details as considered as the gear itself.' : 'Every great piece deserves a place in the archive.' }}</p></div></div>
  <StatePanel v-if="loading" title="Loading equipment details…" kind="loading"/>
  <StatePanel v-else-if="error" :title="missing ? 'Equipment not found' : 'Couldn’t load this record'" :description="error" kind="error"><RouterLink v-if="missing" to="/gear" class="button">Browse equipment</RouterLink><button v-else class="button" @click="load">Try again</button></StatePanel>
  <div v-else class="editor-layout"><GearForm :initial="item || undefined" @saved="saved"/><aside class="form-aside"><p class="eyebrow">A WELL-KEPT ARCHIVE</p><h2>Small details.<br>Better handovers.</h2><p>A unique inventory code makes every piece easy to find. Keep it consistent with the label on your equipment.</p><div class="form-aside-note"><span>GOOD TO KNOW</span><p>Availability tells the team if a piece is ready to use. Condition describes its physical state.</p></div></aside></div>
</template>
