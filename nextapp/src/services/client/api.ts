import axios, { isAxiosError, type AxiosRequestConfig } from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3000/api" as string,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export const handleError = (error: unknown) => {
  if (isAxiosError(error)) {
    if (error.response) {
      // Сервер ответил с кодом ошибки
      throw new Error(error.response.data?.message || "Ошибка сервера");
    }
    if (error.request) {
      // Запрос был сделан, но ответ не получен
      throw new Error("Нет ответа от сервера");
    }
    // Ошибка при настройке запроса
    throw new Error("Ошибка при отправке запроса");
  }

  throw new Error(
    error instanceof Error ? error.message : "Неизвестная ошибка"
  );
};

export const getData = async (url: string, options?: AxiosRequestConfig) => {
  const response = await api(url, options);

  if (response.status !== 200) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.data;
};
