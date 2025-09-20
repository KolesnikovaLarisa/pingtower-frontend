import axios, { AxiosResponse } from "axios";

const api = axios.create({
  baseURL: "http://203.81.208.57:8000",
  headers: { "Content-Type": "application/json" }
});

// Интерцептор для добавления токена к запросам
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  console.log('API: Токен в запросе:', token ? 'есть' : 'отсутствует');
  if (token) {
    // Добавляем токен в URL параметры вместо заголовков
    config.params = {
      ...config.params,
      authorization: `Bearer ${token}`
    };
    console.log('API: Добавлен токен в URL параметры:', `Bearer ${token.substring(0, 20)}...`);
  } else {
    console.log('API: Токен отсутствует, запрос без авторизации');
  }
  return config;
});

// Интерцептор для обработки ответов и обновления токенов
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('API: Успешный ответ:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.log('API: Ошибка ответа:', error.response?.status, error.config?.url);
    const originalRequest = error.config;

    // Если ошибка 401 и это не повторный запрос
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('API: Обрабатываем ошибку 401, пытаемся обновить токен');
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      console.log('API: Refresh токен:', refreshToken ? 'есть' : 'отсутствует');
      
      if (refreshToken) {
        try {
          console.log('API: Отправляем запрос на обновление токена');
          const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
            refreshToken
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          console.log('API: Токены обновлены успешно');
          console.log('API: Новый access токен:', accessToken ? 'получен' : 'отсутствует');
          
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", newRefreshToken);
          
          // Проверяем, что токен сохранился
          const savedToken = localStorage.getItem("accessToken");
          console.log('API: Проверяем сохраненный токен:', savedToken ? 'сохранен' : 'не сохранен');
          
          // Обновляем параметры авторизации для всех будущих запросов
          api.defaults.params = {
            ...api.defaults.params,
            authorization: `Bearer ${accessToken}`
          };
          
          // Повторяем оригинальный запрос с новым токеном
          originalRequest.params = {
            ...originalRequest.params,
            authorization: `Bearer ${accessToken}`
          };
          console.log('API: Повторяем оригинальный запрос с новым токеном');
          console.log('API: Параметры авторизации:', originalRequest.params.authorization);
          return api(originalRequest);
        } catch (refreshError) {
          console.log('API: Ошибка при обновлении токена:', refreshError);
          // Если обновление токена не удалось, очищаем localStorage и перенаправляем на авторизацию
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          console.log('API: Перенаправляем на страницу авторизации');
          window.location.href = "/auth";
          return Promise.reject(refreshError);
        }
      } else {
        console.log('API: Refresh токен отсутствует, перенаправляем на авторизацию');
        // Если нет refresh токена, перенаправляем на авторизацию
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/auth";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
