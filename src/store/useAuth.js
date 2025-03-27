import { defineStore } from "pinia";
import { ref } from "vue";

export const useAuth = defineStore(
  "Auth",
  () => {
    const token = ref("");
    const refreshToken = ref("");
    const userName = ref("");

    // ✅ Función para establecer token y refresh token
    function set_Token_RefreshToken(accessToken, RefreshToken) {
      if (accessToken && RefreshToken) {
        token.value = accessToken;
        refreshToken.value = RefreshToken;

        // Guardar en localStorage
        localStorage.setItem(
          "Auth",
          JSON.stringify({
            token: accessToken,
            refresh_token: RefreshToken,
          })
        );
      } else {
        console.log("⚠️ No se recibió access_token o refresh_token");
      }
    }

    function setUserName(email){
      userName.value = email;
    }

    // ✅ Función para cerrar sesión
    function logout() {
      token.value = "";
      refreshToken.value = "";
      userName.value = "";

      localStorage.removeItem("Auth");
    }

    // ✅ Función para obtener token y refresh token desde localStorage al cargar la app
    function loadStoredAuth() {
      const storedAuth = JSON.parse(localStorage.getItem("Auth"));
      if (storedAuth) {
        token.value = storedAuth.token || "";
        refreshToken.value = storedAuth.refresh_token || "";
      }
    }

    // Cargar el token almacenado al iniciar la aplicación
    loadStoredAuth();

    return {
      token,
      refreshToken,
      userName,
      set_Token_RefreshToken,
      logout,
      setUserName
    };
  },
  {
    persist: true, // ✅ Permite que Pinia persista los datos
  }
);
