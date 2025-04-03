import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import Invoice from '../views/Invoice.vue'
import Product from '../views/Product.vue'
import Customer from '../views/Customer.vue'
import MainLayout from '../layouts/MainLayout.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
    meta: { noLayout: true }
  },
  {

    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'Login',
        component: Login
      },
      {
        path: 'home',
        name: 'Home',
        component: Home
      },
      {
        path: 'Invoice',
        name: 'Invoice',
        component: Invoice
    
      },
      {
        path: 'product',
        name: 'Product',
        component: Product
      },
      {
        path: 'customer',
        name: 'Customer',
        component: Customer
      },
     
    ]
  },


]

export const router = createRouter({
  history: createWebHistory(),
  routes,
});