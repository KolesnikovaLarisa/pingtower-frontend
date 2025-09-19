# JWT Авторизация в PingTower

## Обзор изменений

Проект был обновлен для корректной работы с JWT (JSON Web Token) авторизацией. Все API файлы переименованы в TypeScript и обновлены для работы с токенами.

## Структура API

### Файлы API
- `src/api/client.ts` - HTTP клиент с автоматическим добавлением токенов и обновлением
- `src/api/auth.ts` - функции авторизации (login, register, logout, refresh)
- `src/api/resources.ts` - API для работы с ресурсами
- `src/types/api.ts` - TypeScript типы для API

### Основные функции

#### Авторизация
```typescript
// Вход
const response = await loginUser(email, password);
// response: { accessToken, refreshToken, user }

// Регистрация
const response = await registerUser(email, password, name);

// Выход
await logoutUser(); // Очищает токены и отправляет запрос на сервер

// Получение текущего пользователя из токена
const user = getCurrentUser();
```

#### HTTP Клиент
- Автоматически добавляет `Authorization: Bearer <token>` к запросам
- Автоматически обновляет токены при получении 401 ошибки
- Перенаправляет на `/auth` при неудачном обновлении токена

## Настройка бэкенда

### Ожидаемые эндпоинты

```
POST /auth/login
{
  "email": "user@example.com",
  "password": "password"
}
Response: {
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token", 
  "user": { "id": "1", "name": "User", "email": "user@example.com" }
}

POST /auth/register
{
  "email": "user@example.com",
  "password": "password",
  "name": "User Name"
}
Response: {
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token",
  "user": { "id": "1", "name": "User Name", "email": "user@example.com" }
}

POST /auth/refresh
{
  "refreshToken": "refresh_token"
}
Response: {
  "accessToken": "new_jwt_token",
  "refreshToken": "new_refresh_token"
}

POST /auth/logout
{
  "refreshToken": "refresh_token"
}
Response: 200 OK
```

### JWT Payload структура

Access Token должен содержать:
```json
{
  "sub": "user_id",
  "name": "User Name", 
  "email": "user@example.com",
  "exp": 1234567890,
  "iat": 1234567890
}
```

## Хранение токенов

- **accessToken** - хранится в localStorage, используется для API запросов
- **refreshToken** - хранится в localStorage, используется для обновления accessToken
- Токены автоматически очищаются при logout или истечении срока действия

## Безопасность

- Токены хранятся в localStorage (для демо)
- В продакшене рекомендуется использовать httpOnly cookies
- Access token имеет короткий срок жизни (15-30 минут)
- Refresh token имеет длительный срок жизни (7-30 дней)

## Проверка авторизации

ProtectedRoute автоматически:
1. Проверяет наличие accessToken в localStorage
2. Декодирует токен и проверяет срок действия
3. Обновляет состояние авторизации в store
4. Перенаправляет на /auth при отсутствии токена

## Обновление токенов

HTTP клиент автоматически:
1. Перехватывает 401 ошибки
2. Использует refreshToken для получения нового accessToken
3. Повторяет оригинальный запрос с новым токеном
4. Перенаправляет на /auth при неудачном обновлении

## Тестирование

1. Запустите сервер разработки: `npm run dev`
2. Откройте http://localhost:3000
3. Попробуйте зарегистрироваться или войти
4. Проверьте, что токены сохраняются в localStorage
5. Проверьте, что защищенные маршруты работают корректно
