import axios from "axios";

/*
const isProduction = process.env.NODE_ENV === "production";

// Конфигурация для клиентской и серверной части
const getBaseUrl = () => {
  // На клиенте (браузер)
  return isProduction
    ? "https://ul-backend.vercel.app/" // Относительный путь в продакшене
    : "http://localhost:80/"; // Локальный сервер при разработке
};
*/
// Конфигурация для клиентской и серверной части
export const getBaseUrl = () => "https://ul-backend.vercel.app/"; // Относительный путь в продакшене

export const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

// Интерцептор для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
  },
);


