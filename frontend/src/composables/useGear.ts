import { onMounted, ref } from 'vue'
import { gearApi } from '../api/gear'
import { errorMessage, statusOf } from '../api/errors'
import type { Gear } from '../types'
export function useGear(id: string) {
  const item = ref<Gear | null>(null), loading = ref(true), error = ref(''), missing = ref(false)
  async function load() {
    loading.value = true; error.value = ''; missing.value = false
    try { item.value = await gearApi.get(id) }
    catch (err) { error.value = errorMessage(err); missing.value = statusOf(err) === 404 }
    finally { loading.value = false }
  }
  onMounted(load)
  return { item, loading, error, missing, load }
}
