<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowUpRight, Eye, EyeOff, LoaderCircle } from '@lucide/vue'
import BrandMark from '../components/BrandMark.vue'
import ArchiveArt from '../components/ArchiveArt.vue'
import { useAuth } from '../composables/useAuth'
import { errorMessage, fieldErrors, statusOf } from '../api/errors'
import type { FieldErrors } from '../types'
const auth = useAuth(), route = useRoute(), router = useRouter()
const email = ref(''), password = ref(''), visible = ref(false), busy = ref(false), error = ref('')
const errors = ref<FieldErrors>({})
async function submit() {
  if (busy.value) return
  busy.value = true; error.value = ''; errors.value = {}
  try {
    await auth.login(email.value.trim(), password.value)
    password.value = ''
    const target = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await router.replace(target.startsWith('/') && !target.startsWith('//') && !target.startsWith('/login') ? target : '/')
  } catch (err) {
    errors.value = fieldErrors(err)
    error.value = statusOf(err) === 401 ? 'That email and password don’t match. Please try again.' : errorMessage(err)
  } finally { busy.value = false }
}
</script>
<template>
  <div class="login-page">
    <section class="login-editorial" aria-label="FrameVault studio archive">
      <BrandMark />
      <div class="editorial-copy"><p class="eyebrow">A HOME FOR EVERY PIECE.</p><h1>Behind every<br>great frame,<br><em>good gear.</em></h1><p>The tools of your craft.<br>All in one considered space.</p></div>
      <div class="login-art"><ArchiveArt /><span class="art-caption">FIG. 01 — TOOLS OF THE TRADE</span><span class="art-index">FV / 001</span></div>
      <footer><span>Your gear. Your archive.</span><span>BUILT FOR THE STUDIO ↗</span></footer>
    </section>
    <main class="login-form-area">
      <BrandMark class="mobile-brand" />
      <div class="login-form-inner">
        <p class="eyebrow">THE STUDIO, ORGANIZED.</p><h2>Welcome back.</h2><p class="muted">Sign in to your studio’s equipment archive.</p>
        <div v-if="auth.notice.value" class="notice" role="status">{{ auth.notice.value }}</div>
        <form @submit.prevent="submit">
          <div v-if="error" class="alert" role="alert">{{ error }}</div>
          <div class="field"><label for="email">Email address</label><input id="email" v-model="email" type="email" autocomplete="username" placeholder="you@studio.com" required :disabled="busy" :aria-invalid="!!errors.email" :aria-describedby="errors.email ? 'email-error' : undefined"><p v-if="errors.email" id="email-error" class="field-error">{{ errors.email[0] }}</p></div>
          <div class="field"><label for="password">Password</label><div class="password-input"><input id="password" v-model="password" :type="visible ? 'text' : 'password'" autocomplete="current-password" placeholder="Enter your password" required :disabled="busy" :aria-invalid="!!errors.password" :aria-describedby="errors.password ? 'password-error' : undefined"><button type="button" class="icon-button" :aria-label="visible ? 'Hide password' : 'Show password'" :aria-pressed="visible" @click="visible = !visible"><EyeOff v-if="visible" :size="18"/><Eye v-else :size="18"/></button></div><p v-if="errors.password" id="password-error" class="field-error">{{ errors.password[0] }}</p></div>
          <button class="button primary login-submit" :disabled="busy"><LoaderCircle v-if="busy" class="spin" :size="18"/>{{ busy ? 'Opening your archive…' : 'Enter the archive' }}<ArrowUpRight v-if="!busy" :size="19"/></button>
        </form>
        <p class="login-help">A private workspace for studio staff.<br>Need access? Contact your studio administrator.</p>
      </div>
      <footer class="login-footer"><span>FRAMEVAULT / INTERNAL WORKSPACE</span><span>© {{ new Date().getFullYear() }}</span></footer>
    </main>
  </div>
</template>
