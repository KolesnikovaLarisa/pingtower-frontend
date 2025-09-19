import api from "./client";

export interface Resource {
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

export interface CreateResourceRequest {
  name: string;
  url: string;
}

export interface ResourceStats {
  uptime: number;
  errors24h: number;
  active: number;
  sla: number;
  responseTime: number;
  totalRequests: number;
}

// Получить все ресурсы
export async function getResources(): Promise<Resource[]> {
  const { data } = await api.get<{ resources: Resource[] }>("/resources");
  return data.resources;
}

// Создать новый ресурс
export async function createResource(name: string, url: string): Promise<Resource> {
  const { data } = await api.post<Resource>("/resources", { name, url });
  return data;
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