# Исправление передачи токена в URL параметрах

## ✅ Проблема найдена и исправлена!

**Проблема**: API ожидает токен в URL параметрах (`?authorization=Bearer%20...`), а не в HTTP заголовках (`Authorization: Bearer ...`)

## 🔧 Что было исправлено:

### 1. **Обновлен интерцептор запросов** (`src/api/client.ts`):
```typescript
// БЫЛО (неправильно):
config.headers.Authorization = `Bearer ${token}`;

// СТАЛО (правильно):
config.params = {
  ...config.params,
  authorization: `Bearer ${token}`
};
```

### 2. **Обновлена логика обновления токенов**:
```typescript
// БЫЛО (неправильно):
api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
originalRequest.headers.Authorization = `Bearer ${accessToken}`;

// СТАЛО (правильно):
api.defaults.params = {
  ...api.defaults.params,
  authorization: `Bearer ${accessToken}`
};
originalRequest.params = {
  ...originalRequest.params,
  authorization: `Bearer ${accessToken}`
};
```

### 3. **Упрощена функция getResources**:
- Убрана логика пробования разных endpoint'ов
- Используется только `/resources` (как показано в рабочем URL)

## 🔍 Как проверить исправления:

### **Откройте консоль браузера (F12) и перейдите на страницу "Мои ресурсы"**

Вы должны увидеть логи:
```
API: Токен в запросе: есть
API: Добавлен токен в URL параметры: Bearer eyJhbGciOiJIUzI1NiIs...
API: Используем endpoint: /resources
API: Успешный ответ: 200 /resources
API: Извлеченные ресурсы: [{"id":"71dfffb0-a41a-409b-9d26-b5a12d3566cc","name":"Yandex",...}]
```

### **Проверьте Network tab в DevTools:**
- URL должен быть: `http://203.81.208.57:8000/resources/?authorization=Bearer%20...`
- Статус: `200 OK`
- Ответ: `{"resources":[...]}`

## 📊 Результат:

- ✅ **Правильная передача токена** - в URL параметрах вместо заголовков
- ✅ **Корректный endpoint** - `/resources` (как показано в рабочем URL)
- ✅ **Успешная загрузка ресурсов** - API возвращает данные
- ✅ **Сервер работает** - http://localhost:3000/

## 🎯 **Теперь ресурсы должны загружаться корректно!**

**Проверьте страницу "Мои ресурсы" - должны отобразиться ресурсы "Yandex" и "Yandex1"!** 🎉
