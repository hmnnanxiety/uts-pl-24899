import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', name: 'login', component: () => import('../views/LoginView.vue'), meta: { title: 'Sign in', public: true } },
    { path: '/', component: () => import('../layouts/AppLayout.vue'), children: [
      { path: '', name: 'dashboard', component: () => import('../views/DashboardView.vue'), meta: { title: 'Overview' } },
    ] },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('../views/NotFoundView.vue'), meta: { title: 'Page not found' } },
  ],
  scrollBehavior: (_to, _from, saved) => saved || { top: 0 },
})

router.beforeEach(async to => {
  const auth = useAuth()
  await auth.restore()
  if (auth.sessionError.value) return true
  if (!to.meta.public && !auth.user.value) return { name: 'login', query: { redirect: to.fullPath } }
  if (to.name === 'login' && auth.user.value) return { name: 'dashboard' }
})
window.addEventListener('framevault:unauthorized', () => {
  if (router.currentRoute.value.name !== 'login') void router.replace({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
})
router.afterEach(to => { document.title = `${to.meta.title || 'Studio archive'} · FrameVault` })
