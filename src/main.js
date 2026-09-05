import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles/tokens.css'
import './styles/base.css'
import './styles/h5-site.css'
import './styles/admin-tech.css'
import './styles/admin-aurora.css'

createApp(App).use(router).mount('#app')
