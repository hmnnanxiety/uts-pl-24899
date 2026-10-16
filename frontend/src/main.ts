import { createApp } from 'vue'
import App from './App.vue'
import '@fontsource/dm-sans/400.css'
import '@fontsource/dm-sans/500.css'
import '@fontsource/dm-sans/600.css'
import '@fontsource/dm-sans/700.css'
import './styles/base.css'
import './styles/workspace.css'
import './styles/inventory.css'
import './styles/forms.css'
import { router } from './router'

createApp(App).use(router).mount('#app')
