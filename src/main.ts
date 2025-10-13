import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';
import can from './directives/can'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.directive('can', can)
app.mount('#app')
