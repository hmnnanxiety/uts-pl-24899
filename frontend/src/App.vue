<script setup lang="ts">
import { useAuth } from './composables/useAuth'
import { ref } from 'vue'
import { router } from './router'
import ToastRegion from './components/ToastRegion.vue'
const auth = useAuth()
const retrying = ref(false)
async function retry() {
  if (retrying.value) return
  retrying.value = true
  await auth.restore()
  if (!auth.sessionError.value) {
    const current = router.currentRoute.value
    if (auth.user.value && current.name === 'login') await router.replace('/')
    else if (!auth.user.value && !current.meta.public) await router.replace('/login')
  }
  retrying.value = false
}
async function signIn() {
  auth.clear()
  await router.replace('/login')
}
</script>
<template>
  <main v-if="auth.sessionError.value || retrying" class="session-recovery" :aria-busy="retrying">
    <p class="eyebrow">CONNECTION INTERRUPTED</p>
    <h1>Your archive is waiting.</h1>
    <p role="alert">{{ retrying ? 'Reconnecting to your studio…' : auth.sessionError.value }}</p>
    <div class="actions">
      <button class="button primary" :disabled="retrying" @click="retry">
        {{ retrying ? 'Reconnecting…' : 'Try again' }}
      </button>
      <button class="button" :disabled="retrying" @click="signIn">Back to sign in</button>
    </div>
  </main>
  <RouterView v-else />
  <ToastRegion />
</template>
