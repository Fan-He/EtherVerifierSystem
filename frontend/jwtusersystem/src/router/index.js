import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../components/Login.vue';
import Register from '../components/Register.vue';
import ProfileView from '../views/ProfileView.vue';
import SendMessage from '../components/SendMessage.vue';
import Inbox from '../components/Inbox.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/profile', component: ProfileView },
  { path: '/send-message', component: SendMessage },
  { path: '/inbox', component: Inbox }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
