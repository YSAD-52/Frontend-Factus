import { createApp } from 'vue';
import { Quasar, Notify } from 'quasar'; // ✅ Importamos Notify
import App from './App.vue';
import { router } from './routes/routes';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { createPinia } from 'pinia';
import quasarLang from 'quasar/lang/es';

// 🔹 Importa los estilos de Quasar
import 'quasar/src/css/index.sass';

// 🔹 Importar los íconos de Material Icons
import iconSet from 'quasar/icon-set/material-icons';
import '@quasar/extras/material-icons/material-icons.css'; // ✅ Asegura que los íconos funcionen

const app = createApp(App);

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(Quasar, {
    iconSet, // Usa el set de iconos
    plugins: { Notify }, // ✅ Agregamos Notify
    lang: quasarLang, 
});  

app.use(router);
app.use(pinia);
app.mount('#app');

// ✅ Prueba una notificación en consola para asegurarte de que funciona
Notify.create({
    message: '¡Quasar Notify está funcionando!',
    color: 'positive',
});