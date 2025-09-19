# Интеграция API Resources в PingTower

## Обзор изменений

Проект был обновлен для интеграции с реальным API для работы с ресурсами. Все функции теперь используют HTTP запросы вместо mock данных.

## Структура API

### Файлы API
- `src/api/resources.ts` - функции для работы с ресурсами
- `src/store/resourcesStore.ts` - обновленный store с API интеграцией
- `src/pages/ResourcesPage.tsx` - обновленная страница ресурсов
- `src/pages/ResourceCabinet.tsx` - обновленная страница детального просмотра ресурса

### API Функции

#### Основные функции
```typescript
// Получить все ресурсы
export async function getResources(): Promise<Resource[]>

// Создать новый ресурс
export async function createResource(name: string, url: string): Promise<Resource>

// Обновить ресурс
export async function updateResource(id: string, updates: Partial<CreateResourceRequest>): Promise<Resource>

// Удалить ресурс
export async function deleteResource(id: string): Promise<void>

// Получить ресурс по ID
export async function getResourceById(id: string): Promise<Resource>

// Получить статистику ресурса
export async function getResourceStats(id: string, period: "24h" | "7d" | "30d"): Promise<ResourceStats>

// Поиск эндпоинтов по URL
export async function searchEndpoints(url: string): Promise<Array<{ path: string; method: string; status: string }>>
```

## Обновления Store

### Новые функции в store
```typescript
// Асинхронные функции для работы с API
addResource: (resource: Omit<Resource, 'id'>) => Promise<void>
updateResource: (id: string, updates: Partial<Resource>) => Promise<void>
removeResource: (id: string) => Promise<void>
loadResources: () => Promise<void>
searchEndpoints: (url: string) => Promise<Array<{ path: string; method: string; status: string }>>
```

### Обработка ошибок
Все функции в store теперь включают обработку ошибок:
- Логирование ошибок в консоль
- Проброс ошибок для обработки в компонентах
- Отображение пользователю понятных сообщений об ошибках

## Обновления компонентов

### ResourcesPage
- **Загрузка ресурсов**: Автоматическая загрузка при монтировании компонента
- **Поиск эндпоинтов**: Использует реальный API вместо mock данных
- **Добавление ресурсов**: Асинхронное создание с обработкой ошибок
- **Удаление ресурсов**: Асинхронное удаление с обработкой ошибок

### ResourceCabinet
- **Загрузка данных**: Проверка наличия ресурса в store и загрузка с сервера при необходимости
- **Обработка ошибок**: Корректная обработка ошибок загрузки

## Ожидаемые эндпоинты бэкенда

```
GET /resources
Response: { resources: Resource[] }

POST /resources
Body: { name: string, url: string }
Response: Resource

PUT /resources/:id
Body: { name?: string, url?: string }
Response: Resource

DELETE /resources/:id
Response: 200 OK

GET /resources/:id
Response: Resource

GET /resources/:id/stats?period=24h|7d|30d
Response: ResourceStats

POST /resources/search-endpoints
Body: { url: string }
Response: { endpoints: Array<{ path: string, method: string, status: string }> }
```

## Типы данных

### Resource
```typescript
interface Resource {
  id: string;
  name: string;
  url: string;
  endpoints: Array<{
    path: string;
    status: 'online' | 'offline';
    errors24h: number;
  }>;
  status: 'online' | 'offline';
  uptime: number;
  errors24h: number;
  active: number;
  sla: number;
}
```

### ResourceStats
```typescript
interface ResourceStats {
  uptime: number;
  errors24h: number;
  active: number;
  sla: number;
  responseTime: number;
  totalRequests: number;
}
```

## Обработка ошибок

### В компонентах
- Отображение ошибок пользователю через состояние `error`
- Логирование ошибок в консоль для отладки
- Graceful fallback при недоступности API

### В store
- Try-catch блоки для всех асинхронных операций
- Проброс ошибок для обработки в компонентах
- Сохранение состояния приложения при ошибках

## Тестирование

1. **Загрузка ресурсов**: Проверьте, что ресурсы загружаются при открытии страницы
2. **Добавление ресурса**: Создайте новый ресурс и проверьте, что он появляется в списке
3. **Поиск эндпоинтов**: Введите URL и проверьте поиск эндпоинтов
4. **Удаление ресурса**: Удалите ресурс и проверьте, что он исчезает из списка
5. **Обработка ошибок**: Проверьте отображение ошибок при недоступности API

## Fallback режим

При недоступности API приложение будет:
- Показывать ошибки пользователю
- Сохранять существующие данные в store
- Позволять работать с локальными данными
- Логировать ошибки для отладки

## Безопасность

- Все запросы используют JWT токены через HTTP клиент
- Автоматическое обновление токенов при истечении
- Обработка 401 ошибок с перенаправлением на авторизацию
