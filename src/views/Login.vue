<template>
  <q-page class="flex flex-center column bg-light" style="min-height: 100vh;">
    <q-card class="q-pa-md shadow-4 login-card">
      <q-card-section class="text-center q-pa-none">
        <q-avatar size="70px" class="bg-primary text-white">
          <q-icon name="person" size="40px" />
        </q-avatar>
        <div class="text-h6 q-mt-sm text-primary">Bienvenido</div>
        <div class="text-caption text-grey">Inicia sesión para continuar</div>
      </q-card-section>
      <q-card-section class="q-pa-none">
        <q-form @submit.prevent="login">
          <q-input v-model="email" label="Correo" type="email" filled dense class="q-mb-" :rules="[val => !!val || 'El correo es obligatorio', val => /.+@.+\..+/.test(val) || 'Correo no válido']" />
          <q-input v-model="password" label="Contraseña" type="password" filled dense class="q-mb-sm" :rules="[val => !!val || 'La contraseña es obligatoria', val => val.length >= 6 || 'Mínimo 6 caracteres']" />
          <q-btn label="Ingresar" type="submit" color="primary" class="full-width q-mt-sm" :loading="loading" />
        </q-form>
        <q-btn label="Ingresar con Google" color="red" class="full-width q-mt-sm" outline dense @click="loginWithGoogle" icon="fab fa-google" />
      </q-card-section>
      <q-card-section class="text-center q-pa-none">
        <q-btn flat label="¿Olvidaste tu contraseña?" color="primary" class="q-pa-none" @click="forgotPassword" />
      </q-card-section>
      <q-card-section v-if="error" class="text-negative text-center q-pa-none">
        <q-icon name="warning" class="q-mr-xs" /> {{ error }}
      </q-card-section>
    </q-card>
  </q-page>
</template>
<script setup>
import { ref } from 'vue';
import { QIcon, QAvatar, QCardSection, QInput, QBtn, QForm, QCard, QPage,} from 'quasar';
import { useRouter } from 'vue-router';
import { useAuth } from '../store/useAuth.js';
import { postData } from '../Services/apiClient.js';
const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);
const authStore = useAuth();
const router = useRouter();
const login = async () => {
  if (!email.value || !password.value) {
    error.value = 'Todos los campos son obligatorios';
    return;
  }
  loading.value = true;
  error.value = '';
  try {
    const response = await postData("/oauth/token", {
      grant_type: "password",
      client_id: import.meta.env.VITE_CLIENT_ID,
      client_secret: import.meta.env.VITE_CLIENT_SECRET,
      username: email.value,
      password: password.value
    });
    if (response.access_token) {
      authStore.set_Token_RefreshToken(response.access_token, response.refresh_token);
      router.replace("/home");
    } else {
      error.value = "Credenciales incorrectas";
    }
  } catch (err) {
    error.value = "Error al iniciar sesión. Inténtalo de nuevo.";
    console.error("Error de autenticación:", err);
  } finally {
    loading.value = false;
  }
};
const loginWithGoogle = async () => {
  try {
    console.log("Login con Google en proceso...");
  } catch (err) {
    error.value = "Error al iniciar sesión con Google";
  }
};
const forgotPassword = () => router.push('/forgot-password');
const register = () => router.push('/register');
</script>
<style scoped>
.bg-light { background: #f5f7fa; }
.login-card {
  width: 360px;
  max-width: 90vw;
  background: white;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}
.shadow-4 { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); }
</style>