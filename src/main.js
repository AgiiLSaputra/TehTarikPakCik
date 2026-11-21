import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { initSeed } from './services/storage'
import './assets/styles/variables.css'
import './assets/styles/base.css'

// Seed localStorage sebelum aplikasi di-mount (PRD 8.4)
initSeed()

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
