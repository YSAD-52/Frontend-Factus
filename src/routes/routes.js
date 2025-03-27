import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Home from '../views/Home.vue';


const routes = [
  { path: '/', component: Login },
  { path: '/home', component: Home},
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});