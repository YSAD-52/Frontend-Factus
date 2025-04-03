<template>
    <div class="q-md" v-if="!$route.meta.noLayout">
      <q-layout view="hHh Lpr lff" container class="shadow-2 rounded-borders"></q-layout>
        <q-header elevated class="header" v-show="$route.path !== '/' && $route.path !== '/'">
          <q-toolbar>
            <q-btn flat @click="drawer = !drawer" round dense icon="menu" v-if="userName"/>
            <q-toolbar-title>Factus</q-toolbar-title>
            
            <q-btn-dropdown  id="dropdown" :label="userName" class="q-py-sm" style="color: white; ">
                
                    <q-list  >
                     
                        <q-item clickable v-close-popup @click="goToSettings">
                            <q-item-section avatar>
                                <q-icon name="settings" />
                            </q-item-section>
                            <q-item-section>Configuración</q-item-section>
                        </q-item>

                        <q-item clickable v-close-popup @click="logout" to="/">
                            <q-item-section avatar>
                                <q-icon name="logout" style="color: gray;"  />
                            </q-item-section>
                            <q-item-section>Cerrar sesión</q-item-section>
                        </q-item>
                    </q-list>
                </q-btn-dropdown>
          </q-toolbar>
        </q-header>
        
  
        <q-drawer 
        v-show="$route.path !== '/' && $route.path !== '/'"
          v-model="drawer"
          show-if-above
          :mini="miniState"
          @mouseenter="miniState = false"
          @mouseleave="miniState = true"
          mini-to-overlay
          :width="200"
          :breakpoint="500"
          bordered
          :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3'"
        >
          <q-scroll-area class="fit" :horizontal-thumb-style="{ opacity: 0 }">
            <q-list padding>
              <q-item clickable v-ripple to="/home">
                <q-item-section avatar>
                  <q-icon name="home" />
                </q-item-section>
  
                <q-item-section>
                  Inicio
                </q-item-section>
              </q-item>
              <q-item clickable v-ripple to="/invoice">
                <q-item-section avatar>
                  <q-icon name="receipt"  />
                </q-item-section>
  
                <q-item-section>
                  Facturas
                </q-item-section>
              </q-item>
  
              <q-item active clickable v-ripple to="/customer">
                <q-item-section avatar>
                  <q-icon name="person" />
                </q-item-section>
  
                <q-item-section>
                  Clientes
                </q-item-section>
              </q-item>
  
              <q-item clickable v-ripple to="/product">
                <q-item-section avatar>
                  <q-icon name="send" />
                </q-item-section>
  
                <q-item-section>
                  Productos
                </q-item-section>
              </q-item>
  
              <q-separator />

            </q-list>
          </q-scroll-area>
        </q-drawer>
  
        <q-page-container>
          <router-view />
        </q-page-container>

    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuth } from '../store/useAuth';
  import { QPageContainer, QIcon } from 'quasar';
  
  const router = useRouter();
  const auth = useAuth();
  const drawer = ref(false);
  const miniState = ref(true);
  let userName = auth.userName
  
  </script>
  <style>
  .header{
    background-color: #2F4F4F;
  }

  #dropdown{
    font-size: 10px;
    font-weight: 700;
    
   
  }

  .q-drawer{
    color: #2F4F4F;;
  }

  

</style>