import { createRouter, createWebHistory } from 'vue-router';
import Home from './pages/Home.vue';
import Login from './pages/Login.vue';
import Register from './pages/Register.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: Login, meta: { public: true } },
    { path: '/register', component: Register, meta: { public: true } },
    { path: '/', component: Home, meta: { requiresAuth: true } },
  ],
});

router.beforeEach((to) => {
  const token = localStorage.getItem('token');
  if (to.meta && (to.meta as any).requiresAuth && !token) return '/login';
});

export default router;


