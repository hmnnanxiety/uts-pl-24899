import { onMounted, ref } from 'vue'
import { gearApi } from '../api/gear'
import { errorMessage } from '../api/errors'
import type { Gear } from '../types'

export function useInventory() {
  const items = ref<Gear[]>([]),
    loading = ref(true),
    error = ref('')
  async function load() {
    loading.value = true
    error.value = ''
    try {
      items.value = await gearApi.list()
    } catch (err) {
      error.value = errorMessage(err)
    } finally {
      loading.value = false
    }
  }
  onMounted(load)
  return { items, loading, error, load }
}
