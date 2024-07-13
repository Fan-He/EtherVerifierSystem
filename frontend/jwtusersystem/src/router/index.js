import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/HomeView.vue';
import Login from '../views/LoginView.vue';
import Register from '../views/RegisterView.vue';
import ProfileView from '../views/ProfileView.vue';
import SendMessage from '../components/SendMessage.vue';
import Inbox from '../components/Inbox.vue';
import Board from '../views/BoardView.vue';
import MapView from '../views/MapView.vue';
import ProvidersView from '../views/ProvidersView.vue';
import RandomNumber from '../components/RandomNumber.vue'; 
import GroupDisplay from '../components/GroupDisplay.vue';
import Debug from '../components/Debug.vue';



const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/profile', component: ProfileView },
  { path: '/send-message', component: SendMessage },
  { path: '/inbox', component: Inbox }, 
  { path: '/board', component: Board }, 
  { path: '/map', name: 'map', component: MapView }, 
  { path: '/random-number', name: 'RandomNumber', component: RandomNumber },
  { path: '/group-display', name: 'GroupDisplay', component: GroupDisplay }, 
  { path: '/debug', name: 'Debug', component: Debug }, 
  { path: '/providers', name: 'Providers', component: ProvidersView }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
