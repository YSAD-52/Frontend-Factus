import axios from "axios";

const backApiClient = axios.create({
     baseURL: "http://localhost:3999/api" 
  /*   baseURL: "https://backapifactus.onrender.com/api"  */
});

backApiClient.interceptors.request.use(
    (config) => {
        const dataStore = JSON.parse(localStorage.getItem("Auth"));
        const token = dataStore?.token || "";
            config.headers.Authorization = `Bearer ${token}`
            config.headers["Content-Type"]= "application/json"
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default backApiClient;