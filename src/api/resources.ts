import api from "./client";

export interface Resource {
  id: string;
  name: string;
  url: string;
  overallStatus?: 'ONLINE' | 'OFFLINE' | 'UNKNOWN';
  metrics?: {
    uptime24h: string; // "99.43%"
    avgResponseTime: number; // 460
    incidents24h: number; // 0
    lastCheck: string; // "2025-09-20T11:36:01.204198"
  };
  endpoints?: Array<{
    path: string;
    status: 'online' | 'offline';
    errors24h: number;
  }>;
  status?: 'online' | 'offline';
  uptime?: number;
  errors24h?: number;
  active?: number;
  sla?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateResourceRequest {
  name: string;
  url: string;
}

export interface ResourceStats {
  uptime: number; // Доступность (Uptime %)
  responseTime: number; // Время отклика (Response Time)
  incidents24h: number; // Частота сбоев - Количество инцидентов за период
  mttr?: number; // MTTR (Mean Time To Resolve) - Среднее время от алерта до восстановления
  slaCompliance?: number; // SLA Compliance - % времени, когда сервис соответствовал SLA
}

// Получить все ресурсы
export async function getResources(): Promise<Resource[]> {
  console.log('API: Загружаем ресурсы...');
  console.log('API: Базовый URL:', api.defaults.baseURL);
  console.log('API: Полный URL:', `${api.defaults.baseURL}/resources`);
  
  // Проверяем токен перед запросом
  const token = localStorage.getItem("accessToken");
  console.log('API: Токен перед запросом:', token ? 'есть' : 'отсутствует');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('API: Токен payload:', payload);
      console.log('API: Токен истекает:', new Date(payload.exp * 1000));
      console.log('API: Текущее время:', new Date());
      console.log('API: Токен действителен:', payload.exp * 1000 > Date.now());
    } catch (e) {
      console.log('API: Ошибка декодирования токена:', e);
    }
  }
  
  try {
    console.log('API: Используем endpoint: /resources');
    const response = await api.get("/resources");
    console.log('API: Полный ответ:', response);
    console.log('API: Данные ответа:', response.data);
    
    // Проверяем разные возможные структуры ответа
    let resources: Resource[] = [];
    if (Array.isArray(response.data)) {
      resources = response.data;
    } else if (response.data.resources && Array.isArray(response.data.resources)) {
      resources = response.data.resources;
    } else if (response.data.data && Array.isArray(response.data.data)) {
      resources = response.data.data;
    } else {
      console.warn('API: Неожиданная структура ответа:', response.data);
      resources = [];
    }
    
    console.log('API: Извлеченные ресурсы:', resources);
    return resources;
  } catch (error) {
    console.error('API: Ошибка при загрузке ресурсов:', error);
    throw error;
  }
}

// Создать новый ресурс
export async function createResource(name: string, url: string): Promise<Resource> {
  console.log('API: Создаем ресурс:', { name, url });
  try {
    const response = await api.post("/resources", { name, url });
    console.log('API: Полный ответ при создании:', response);
    console.log('API: Данные ответа при создании:', response.data);
    
    // Проверяем разные возможные структуры ответа
    let resource: Resource;
    if (response.data) {
      resource = response.data;
    } else if (response.data.data) {
      resource = response.data.data;
    } else {
      console.warn('API: Неожиданная структура ответа при создании:', response.data);
      throw new Error('Неожиданная структура ответа API');
    }
    
    console.log('API: Созданный ресурс:', resource);
    return resource;
  } catch (error) {
    console.error('API: Ошибка при создании ресурса:', error);
    throw error;
  }
}

// Обновить ресурс
export async function updateResource(id: string, updates: Partial<CreateResourceRequest>): Promise<Resource> {
  const { data } = await api.put<Resource>(`/resources/${id}`, updates);
  return data;
}

// Удалить ресурс
export async function deleteResource(id: string): Promise<void> {
  await api.delete(`/resources/${id}`);
}

// Получить подробную информацию о ресурсе
export async function getResourceById(id: string): Promise<Resource> {
  const { data } = await api.get<Resource>(`/resources/${id}`);
  return data;
}

// Получить статистику ресурса
export async function getResourceStats(id: string, period: "24h" | "7d" | "30d"): Promise<ResourceStats> {
  const { data } = await api.get<ResourceStats>(`/resources/${id}/stats`, {
    params: { period }
  });
  return data;
}

// Поиск эндпоинтов по URL
export async function searchEndpoints(url: string): Promise<Array<{ path: string; method: string; status: string }>> {
  const { data } = await api.post<{ endpoints: Array<{ path: string; method: string; status: string }> }>("/resources/search-endpoints", { url });
  return data.endpoints;
}