<script setup lang="ts">
import { useAuth } from './composables/useAuth'
import { router } from './router'
import ToastRegion from './components/ToastRegion.vue'
const auth = useAuth()
async function retry() {
  await auth.restore()
  if (!auth.sessionError.value) await router.replace(router.currentRoute.value.fullPath)
}
async function signIn() {
  auth.clear()
  await router.replace('/login')
}
</script>
<template>
  <main v-if="auth.sessionError.value" class="session-recovery">
    <p class="eyebrow">CONNECTION INTERRUPTED</p>
    <h1>Your archive is waiting.</h1>
    <p role="alert">{{ auth.sessionError.value }}</p>
    <div class="actions">
      <button class="button primary" @click="retry">Try again</button
      ><button class="button" @click="signIn">Back to sign in</button>
    </div>
  </main>
  <RouterView v-else />
  <ToastRegion />
</template>
