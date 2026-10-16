import { computed, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { categories, statuses } from '../lib/gear'
import type { Gear } from '../types'

export function useCatalog(items: Ref<Gear[]>) {
  const route = useRoute(),
    router = useRouter()
  function queryValue(key: string, fallback = '') {
    return typeof route.query[key] === 'string' ? (route.query[key] as string) : fallback
  }
  function filter(key: string, allowed?: string[], fallback = '') {
    return computed({
      get: () => {
        const value = queryValue(key, fallback)
        return !allowed || allowed.includes(value) ? value : fallback
      },
      set: (value: string) => {
        void router.replace({
          query: { ...route.query, [key]: value || undefined, page: undefined },
        })
      },
    })
  }
  const search = filter('q'),
    category = filter(
      'category',
      categories.map((item) => item.value),
    )
  const status = filter(
      'status',
      statuses.map((item) => item.value),
    ),
    sort = filter('sort', ['newest', 'oldest', 'name', 'brand'], 'newest')
  const filtered = computed(() => {
    const query = search.value.trim().toLocaleLowerCase()
    const result = items.value.filter(
      (item) =>
        (!category.value || item.category === category.value) &&
        (!status.value || item.status === status.value) &&
        (!query ||
          [item.name, item.brand, item.model, item.code].some((value) =>
            value?.toLocaleLowerCase().includes(query),
          )),
    )
    return result.sort((a, b) => {
      if (sort.value === 'name' || sort.value === 'brand')
        return a[sort.value].localeCompare(b[sort.value]) || a.id - b.id
      const order = a.created_at.localeCompare(b.created_at) || a.id - b.id
      return sort.value === 'oldest' ? order : -order
    })
  })
  const pageSize = 12
  const pages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
  const page = computed(() => {
    const requested = Number(queryValue('page', '1'))
    return Number.isSafeInteger(requested) ? Math.max(1, Math.min(pages.value, requested)) : 1
  })
  const visible = computed(() =>
    filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize),
  )
  const active = computed(
    () => !!(search.value || category.value || status.value || sort.value !== 'newest'),
  )
  function reset() {
    void router.replace({ query: {} })
  }
  async function goToPage(value: number) {
    await router.replace({
      query: { ...route.query, page: String(Math.max(1, Math.min(pages.value, value))) },
    })
    document.getElementById('catalog-results')?.focus({ preventScroll: true })
    document.getElementById('catalog-results')?.scrollIntoView({ block: 'start' })
  }
  return {
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
  }
}
