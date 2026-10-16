<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { LayoutDashboard, Grid2X2, LogOut, ArrowUpRight } from '@lucide/vue'
import BrandMark from '../components/BrandMark.vue'
import { useAuth } from '../composables/useAuth'
const { user, logout } = useAuth()
const route = useRoute(),
  router = useRouter(),
  busy = ref(false)
watch(
  () => route.path,
  async () => {
    await nextTick()
    document.getElementById('main-content')?.focus({ preventScroll: true })
  },
)
const initials = computed(
  () =>
    user.value?.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'ST',
)
async function signOut() {
  if (busy.value) return
  busy.value = true
  await logout()
  await router.replace('/login')
  busy.value = false
}
</script>
<template>
  <div class="app-shell">
    <a class="skip-link" href="#main-content">Skip to content</a>
    <aside class="sidebar">
      <RouterLink to="/" aria-label="FrameVault overview"><BrandMark /></RouterLink>
      <div class="workspace-label"><span class="studio-dot"></span> THE STUDIO WORKSPACE</div>
      <nav aria-label="Main navigation">
        <p class="nav-heading">WORKSPACE</p>
        <RouterLink to="/" :class="{ selected: route.name === 'dashboard' }"
          ><LayoutDashboard :size="18" />Overview<span class="nav-index">01</span></RouterLink
        ><RouterLink to="/gear" :class="{ selected: route.path.startsWith('/gear') }"
          ><Grid2X2 :size="18" />Equipment<span class="nav-index">02</span></RouterLink
        >
      </nav>
      <div class="sidebar-note">
        <span class="eyebrow">KEEP CREATING.</span>
        <p>A place for your gear.<br />Space for your next idea.</p>
        <ArrowUpRight :size="21" />
      </div>
      <div class="staff-profile">
        <div class="avatar">{{ initials }}</div>
        <div>
          <strong>{{ user?.name }}</strong
          ><span>Studio staff</span>
        </div>
        <button
          class="icon-button"
          :disabled="busy"
          :aria-label="busy ? 'Signing out' : 'Sign out'"
          @click="signOut"
        >
          <LogOut :size="18" />
        </button>
      </div>
    </aside>
    <div class="workspace-main">
      <header class="topbar">
        <span
          ><span class="muted">Workspace</span><span class="breadcrumb-divider">/</span
          >{{ route.meta.title }}</span
        ><span class="topbar-label">YOUR GEAR. YOUR ARCHIVE.<span class="studio-dot"></span></span>
      </header>
      <main id="main-content" class="page-content" tabindex="-1">
        <RouterView :key="route.path" />
      </main>
      <footer class="workspace-footer">
        <span>FRAMEVAULT®</span><span>Made for the work behind the frame.</span>
      </footer>
    </div>
  </div>
</template>
