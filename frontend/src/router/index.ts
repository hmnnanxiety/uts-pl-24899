import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'dashboard', component: () => import('../views/DashboardView.vue'), meta: { title: 'Overview' } },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('../views/NotFoundView.vue'), meta: { title: 'Page not found' } },
  ],
  scrollBehavior: (_to, _from, saved) => saved || { top: 0 },
})

router.afterEach(to => { document.title = `${to.meta.title || 'Studio archive'} · FrameVault` })
