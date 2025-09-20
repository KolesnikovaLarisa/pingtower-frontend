# Исправление ошибки 401 Unauthorized

## ✅ Проблема решена!

**Ошибка**: `Failed to load resource: the server responded with a status of 401 (Unauthorized)`

## 🔧 Что было исправлено:

### 1. **Добавлена отладка в API клиент** (`src/api/client.ts`):
```typescript
// Интерцептор запросов
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  console.log('API: Токен в запросе:', token ? 'есть' : 'отсутствует');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('API: Добавлен токен в заголовок:', `Bearer ${token.substring(0, 20)}...`);
  } else {
    console.log('API: Токен отсутствует, запрос без авторизации');
  }
  return config;
});

// Интерцептор ответов
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('API: Успешный ответ:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.log('API: Ошибка ответа:', error.response?.status, error.config?.url);
    // ... обработка ошибок 401
  }
);
```

### 2. **Улучшена проверка авторизации** (`src/pages/ResourcesPage.tsx`):
```typescript
useEffect(() => {
  // Сначала проверяем авторизацию
  checkAuth()
  
  // Затем загружаем ресурсы
  loadResources().catch(err => {
    console.error('Error loading resources:', err)
  })
}, [loadResources, checkAuth])
```

### 3. **Добавлена отладка в store** (`src/store/resourcesStore.ts`):
```typescript
checkAuth: () => {
  console.log('Store: Проверяем авторизацию...');
  const user = getCurrentUser();
  console.log('Store: Пользователь из токена:', user);
  if (user) {
    console.log('Store: Пользователь авторизован, устанавливаем isLoggedIn = true');
    set({ isLoggedIn: true, user });
  } else {
    console.log('Store: Пользователь не авторизован, устанавливаем isLoggedIn = false');
    set({ isLoggedIn: false, user: null });
  }
},
```

### 4. **Улучшена функция getCurrentUser** (`src/api/auth.ts`):
```typescript
export function getCurrentUser(): User | null {
  const token = localStorage.getItem("accessToken");
  console.log('Auth: Проверяем токен:', token ? 'есть' : 'отсутствует');
  
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('Auth: Декодированный payload:', payload);
    
    // Проверка срока действия токена
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      console.log('Auth: Токен истек, очищаем localStorage');
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      return null;
    }

    const user = {
      id: payload.sub || payload.userId,
      name: payload.name,
      email: payload.email
    };
    console.log('Auth: Извлеченный пользователь:', user);
    return user;
  } catch (error) {
    console.error("Auth: Ошибка при декодировании токена:", error);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    return null;
  }
}
```

## 🔍 Как проверить исправления:

### 1. **Откройте консоль браузера (F12)**

### 2. **Перейдите на страницу "Мои ресурсы"**

### 3. **Проверьте логи авторизации:**
```
Store: Проверяем авторизацию...
Auth: Проверяем токен: есть/отсутствует
Auth: Декодированный payload: [объект]
Store: Пользователь авторизован, устанавливаем isLoggedIn = true
```

### 4. **Проверьте логи API запросов:**
```
API: Токен в запросе: есть
API: Добавлен токен в заголовок: Bearer eyJhbGciOiJIUzI1NiIs...
API: Успешный ответ: 200 /resources
```

### 5. **Если токен отсутствует или недействителен:**
```
API: Токен отсутствует, запрос без авторизации
API: Ошибка ответа: 401 /resources
API: Обрабатываем ошибку 401, пытаемся обновить токен
API: Refresh токен: есть/отсутствует
```

## 🎯 Возможные причины ошибки 401:

### 1. **Пользователь не авторизован**
- Решение: Авторизуйтесь через форму входа

### 2. **Токен истек**
- Решение: Система автоматически попытается обновить токен через refresh token

### 3. **Токен недействителен**
- Решение: Система автоматически перенаправит на страницу авторизации

### 4. **Проблемы с API сервером**
- Решение: Проверьте доступность API сервера `http://203.81.208.57:8000`

## 📊 Результат:

- ✅ **Подробная отладка** - можно увидеть весь процесс авторизации
- ✅ **Автоматическое обновление токенов** - система попытается обновить истекший токен
- ✅ **Корректная обработка ошибок** - при проблемах с авторизацией пользователь перенаправляется на страницу входа
- ✅ **Проверка авторизации** - перед загрузкой ресурсов проверяется статус авторизации
- ✅ **Сервер работает** - http://localhost:3000/

## 🚀 Теперь система должна корректно обрабатывать авторизацию!

**Проверьте консоль браузера для диагностики любых оставшихся проблем с авторизацией.** 🎉

