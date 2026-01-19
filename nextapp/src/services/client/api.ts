import axios, { type AxiosRequestConfig } from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3000/api" as string,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export const handleError = (error: any) => {
  if (error.response) {
    // Сервер ответил с кодом ошибки
    throw new Error(error.response.data.message || "Ошибка сервера");
  } else if (error.request) {
    // Запрос был сделан, но ответ не получен
    throw new Error("Нет ответа от сервера");
  } else {
    // Ошибка при настройке запроса
    throw new Error("Ошибка при отправке запроса");
  }
};

export const getData = async (url: string, options?: AxiosRequestConfig) => {
  const response = await api(url, options);

  if (response.status !== 200) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.data;
};
