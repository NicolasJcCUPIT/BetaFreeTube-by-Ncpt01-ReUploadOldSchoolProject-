import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'  
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js' 
import BootstrapVue3 from 'bootstrap-vue-3'
import 'bootstrap-vue-3/dist/bootstrap-vue-3.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

const app = createApp(App)
app.use(BootstrapVue3)

app.use(router)
app.use(store)  
app.mount('#app')