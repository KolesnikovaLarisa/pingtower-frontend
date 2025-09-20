import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getCurrentUser, logoutUser } from '../api/auth'
import { User } from '../types/api'
import { 
  getResources as apiGetResources, 
  createResource as apiCreateResource, 
  updateResource as apiUpdateResource, 
  deleteResource as apiDeleteResource,
  getResourceById as apiGetResourceById,
  searchEndpoints as apiSearchEndpoints
} from '../api/resources'

export interface Endpoint {
  path: string
  status: 'online' | 'offline'
  errors24h: number
}

export interface Resource {
  id: string
  name: string
  url: string
  overallStatus?: 'ONLINE' | 'OFFLINE' | 'UNKNOWN'
  metrics?: {
    uptime24h: string // "99.43%"
    avgResponseTime: number // 460
    incidents24h: number // 0
    lastCheck: string // "2025-09-20T11:36:01.204198"
  }
  endpoints: Endpoint[]
  status: 'online' | 'offline'
  uptime: number
  errors24h: number
  active: number
  sla: number
}

export interface LogEntry {
  id: string
  timestamp: string
  endpoint: string
  status: 'success' | 'error'
  error?: string
  responseTime: number
  statusCode: number
}

export interface NotificationLog {
  id: string
  timestamp: string
  type: 'email' | 'telegram' | 'slack' | 'webhook'
  message: string
  status: 'sent' | 'failed'
}

// User interface moved to types/api.ts

interface ResourcesState {
  // Resources
  resources: Resource[]
  metrics: {
    uptime: number // Доступность (Uptime %)
    responseTime: number // Время отклика (Response Time)
    incidents24h: number // Частота сбоев - Количество инцидентов за период
    mttr?: number // MTTR (Mean Time To Resolve) - Среднее время от алерта до восстановления
    slaCompliance?: number // SLA Compliance - % времени, когда сервис соответствовал SLA
  }
  addResource: (resource: Omit<Resource, 'id'>) => Promise<void>
  updateResource: (id: string, updates: Partial<Resource>) => Promise<void>
  removeResource: (id: string) => Promise<void>
  loadResources: () => Promise<void>
  searchEndpoints: (url: string) => Promise<Array<{ path: string; method: string; status: string }>>
  clearAllData: () => void
  
  // Auth
  isLoggedIn: boolean
  user: User | null
  login: (user: User) => void
  logout: () => Promise<void>
  checkAuth: () => void
  
  // Logs
  logs: LogEntry[]
  notificationLogs: NotificationLog[]
  addLog: (log: Omit<LogEntry, 'id'>) => void
  addNotificationLog: (log: Omit<NotificationLog, 'id'>) => void
}

export const useResourcesStore = create<ResourcesState>()(
  persist(
    (set, get) => ({
      // Resources
      resources: [],
      metrics: {
        uptime: 0,
        responseTime: 0,
        incidents24h: 0,
        mttr: undefined,
        slaCompliance: 0
      },
      addResource: async (resource) => {
        console.log('Store: Добавляем ресурс:', resource);
        try {
          const newResource = await apiCreateResource(resource.name, resource.url);
          console.log('Store: Ресурс создан через API:', newResource);
          set((state) => {
            const updatedResources = [...state.resources, newResource];
            const metrics = {
              uptime: updatedResources.length > 0 ? updatedResources.reduce((sum, r) => {
                const uptimeValue = r.metrics?.uptime24h ? 
                  parseFloat(r.metrics.uptime24h.replace('%', '')) : 
                  (r.uptime || 0);
                return sum + uptimeValue;
              }, 0) / updatedResources.length : 0,
              responseTime: updatedResources.length > 0 ? updatedResources.reduce((sum, r) => {
                return sum + (r.metrics?.avgResponseTime || 0);
              }, 0) / updatedResources.length : 0,
              incidents24h: updatedResources.reduce((sum, r) => {
                return sum + (r.metrics?.incidents24h || r.errors24h || 0);
              }, 0),
              mttr: undefined,
              slaCompliance: updatedResources.length > 0 ? updatedResources.reduce((sum, r) => {
                const uptimeValue = r.metrics?.uptime24h ? 
                  parseFloat(r.metrics.uptime24h.replace('%', '')) : 
                  (r.uptime || 0);
                return sum + uptimeValue;
              }, 0) / updatedResources.length : 0
            };
            console.log('Store: Обновляем состояние с новым ресурсом:', { updatedResources, metrics });
            return { resources: updatedResources, metrics };
          });
        } catch (error) {
          console.error('Store: Ошибка при добавлении ресурса через API:', error);
          // Fallback: добавляем ресурс локально если API недоступен
          const newResource = {
            ...resource,
            id: Date.now().toString(),
            endpoints: [],
            status: 'online' as const,
            uptime: 100,
            errors24h: 0,
            active: 0,
            sla: 100
          };
          console.log('Store: Добавляем ресурс локально (fallback):', newResource);
          set((state) => {
            const updatedResources = [...state.resources, newResource];
            const metrics = {
              uptime: updatedResources.length > 0 ? updatedResources.reduce((sum, r) => {
                const uptimeValue = r.metrics?.uptime24h ? 
                  parseFloat(r.metrics.uptime24h.replace('%', '')) : 
                  (r.uptime || 0);
                return sum + uptimeValue;
              }, 0) / updatedResources.length : 0,
              responseTime: updatedResources.length > 0 ? updatedResources.reduce((sum, r) => {
                return sum + (r.metrics?.avgResponseTime || 0);
              }, 0) / updatedResources.length : 0,
              incidents24h: updatedResources.reduce((sum, r) => {
                return sum + (r.metrics?.incidents24h || r.errors24h || 0);
              }, 0),
              mttr: undefined,
              slaCompliance: updatedResources.length > 0 ? updatedResources.reduce((sum, r) => {
                const uptimeValue = r.metrics?.uptime24h ? 
                  parseFloat(r.metrics.uptime24h.replace('%', '')) : 
                  (r.uptime || 0);
                return sum + uptimeValue;
              }, 0) / updatedResources.length : 0
            };
            console.log('Store: Обновляем состояние с локальным ресурсом:', { updatedResources, metrics });
            return { resources: updatedResources, metrics };
          });
        }
      },
      updateResource: async (id, updates) => {
        try {
          const updatedResource = await apiUpdateResource(id, updates);
          set((state) => {
            const updatedResources = state.resources.map(r => r.id === id ? updatedResource : r);
            const metrics = {
              uptime: updatedResources.length > 0 ? updatedResources.reduce((sum, r) => {
                const uptimeValue = r.metrics?.uptime24h ? 
                  parseFloat(r.metrics.uptime24h.replace('%', '')) : 
                  (r.uptime || 0);
                return sum + uptimeValue;
              }, 0) / updatedResources.length : 0,
              responseTime: updatedResources.length > 0 ? updatedResources.reduce((sum, r) => {
                return sum + (r.metrics?.avgResponseTime || 0);
              }, 0) / updatedResources.length : 0,
              incidents24h: updatedResources.reduce((sum, r) => {
                return sum + (r.metrics?.incidents24h || r.errors24h || 0);
              }, 0),
              mttr: undefined,
              slaCompliance: updatedResources.length > 0 ? updatedResources.reduce((sum, r) => {
                const uptimeValue = r.metrics?.uptime24h ? 
                  parseFloat(r.metrics.uptime24h.replace('%', '')) : 
                  (r.uptime || 0);
                return sum + uptimeValue;
              }, 0) / updatedResources.length : 0
            };
            return { resources: updatedResources, metrics };
          });
        } catch (error) {
          console.error('Error updating resource:', error);
          throw error;
        }
      },
      removeResource: async (id) => {
        try {
          await apiDeleteResource(id);
          set((state) => {
            const updatedResources = state.resources.filter(r => r.id !== id);
            const metrics = {
              uptime: updatedResources.length > 0 ? updatedResources.reduce((sum, r) => {
                const uptimeValue = r.metrics?.uptime24h ? 
                  parseFloat(r.metrics.uptime24h.replace('%', '')) : 
                  (r.uptime || 0);
                return sum + uptimeValue;
              }, 0) / updatedResources.length : 0,
              responseTime: updatedResources.length > 0 ? updatedResources.reduce((sum, r) => {
                return sum + (r.metrics?.avgResponseTime || 0);
              }, 0) / updatedResources.length : 0,
              incidents24h: updatedResources.reduce((sum, r) => {
                return sum + (r.metrics?.incidents24h || r.errors24h || 0);
              }, 0),
              mttr: undefined,
              slaCompliance: updatedResources.length > 0 ? updatedResources.reduce((sum, r) => {
                const uptimeValue = r.metrics?.uptime24h ? 
                  parseFloat(r.metrics.uptime24h.replace('%', '')) : 
                  (r.uptime || 0);
                return sum + uptimeValue;
              }, 0) / updatedResources.length : 0
            };
            return { resources: updatedResources, metrics };
          });
        } catch (error) {
          console.error('Error removing resource:', error);
          // Fallback: удаляем ресурс локально если API недоступен
          set((state) => {
            const updatedResources = state.resources.filter(r => r.id !== id);
            const metrics = {
              uptime: updatedResources.length > 0 ? updatedResources.reduce((sum, r) => {
                const uptimeValue = r.metrics?.uptime24h ? 
                  parseFloat(r.metrics.uptime24h.replace('%', '')) : 
                  (r.uptime || 0);
                return sum + uptimeValue;
              }, 0) / updatedResources.length : 0,
              responseTime: updatedResources.length > 0 ? updatedResources.reduce((sum, r) => {
                return sum + (r.metrics?.avgResponseTime || 0);
              }, 0) / updatedResources.length : 0,
              incidents24h: updatedResources.reduce((sum, r) => {
                return sum + (r.metrics?.incidents24h || r.errors24h || 0);
              }, 0),
              mttr: undefined,
              slaCompliance: updatedResources.length > 0 ? updatedResources.reduce((sum, r) => {
                const uptimeValue = r.metrics?.uptime24h ? 
                  parseFloat(r.metrics.uptime24h.replace('%', '')) : 
                  (r.uptime || 0);
                return sum + uptimeValue;
              }, 0) / updatedResources.length : 0
            };
            return { resources: updatedResources, metrics };
          });
        }
      },
      loadResources: async () => {
        console.log('Store: Начинаем загрузку ресурсов...');
        try {
          const resources = await apiGetResources();
          console.log('Store: Загружены ресурсы:', resources);
          // Вычисляем метрики на основе загруженных ресурсов
          const metrics = {
            uptime: resources.length > 0 ? resources.reduce((sum, r) => {
              // Парсим uptime24h из строки "99.43%" или используем старый uptime
              const uptimeValue = r.metrics?.uptime24h ? 
                parseFloat(r.metrics.uptime24h.replace('%', '')) : 
                (r.uptime || 0);
              return sum + uptimeValue;
            }, 0) / resources.length : 0,
            responseTime: resources.length > 0 ? resources.reduce((sum, r) => {
              // Используем avgResponseTime из metrics или старый responseTime
              return sum + (r.metrics?.avgResponseTime || 0);
            }, 0) / resources.length : 0,
            incidents24h: resources.reduce((sum, r) => {
              // Используем incidents24h из metrics или старый errors24h
              return sum + (r.metrics?.incidents24h || r.errors24h || 0);
            }, 0),
            mttr: undefined, // Пока не реализовано
            slaCompliance: resources.length > 0 ? resources.reduce((sum, r) => {
              // Используем старый sla или вычисляем на основе uptime
              const uptimeValue = r.metrics?.uptime24h ? 
                parseFloat(r.metrics.uptime24h.replace('%', '')) : 
                (r.uptime || 0);
              return sum + uptimeValue;
            }, 0) / resources.length : 0
          };
          console.log('Store: Устанавливаем ресурсы и метрики:', { resources, metrics });
          set({ resources, metrics });
        } catch (error) {
          console.error('Store: Ошибка при загрузке ресурсов:', error);
          // Fallback: оставляем текущие ресурсы из localStorage
          // Не выбрасываем ошибку, чтобы приложение продолжало работать
        }
      },
      searchEndpoints: async (url) => {
        try {
          return await apiSearchEndpoints(url);
        } catch (error) {
          console.error('Error searching endpoints:', error);
          // Fallback: возвращаем mock эндпоинты если API недоступен
          return [
            { path: '/api/users', method: 'GET', status: 'online' },
            { path: '/api/products', method: 'GET', status: 'online' },
            { path: '/api/orders', method: 'GET', status: 'online' },
            { path: '/api/auth/login', method: 'POST', status: 'online' },
            { path: '/api/auth/register', method: 'POST', status: 'online' },
            { path: '/api/dashboard', method: 'GET', status: 'online' },
            { path: '/api/settings', method: 'GET', status: 'online' },
            { path: '/api/profile', method: 'GET', status: 'online' },
            { path: '/api/notifications', method: 'GET', status: 'online' },
            { path: '/api/reports', method: 'GET', status: 'online' }
          ];
        }
      },

      // Функция для очистки всех данных (для новых пользователей)
      clearAllData: () => {
        set({
          resources: [],
      metrics: {
            uptime: 0,
            responseTime: 0,
            incidents24h: 0,
            mttr: undefined,
            slaCompliance: 0
          },
          logs: [],
          notificationLogs: []
        });
      },

      // Auth
      isLoggedIn: false,
      user: null,
      login: (user) => set({ isLoggedIn: true, user }),
      logout: async () => {
        await logoutUser();
        set({ isLoggedIn: false, user: null });
      },
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

      // Logs
      logs: [
        {
          id: '1',
          timestamp: '2024-01-15 14:30:25',
          endpoint: '/api/users',
          status: 'error',
          error: 'Connection timeout',
          responseTime: 5000,
          statusCode: 500
        },
        {
          id: '2',
          timestamp: '2024-01-15 14:29:15',
          endpoint: '/login',
          status: 'success',
          responseTime: 245,
          statusCode: 200
        },
        {
          id: '3',
          timestamp: '2024-01-15 14:28:05',
          endpoint: '/api/data',
          status: 'error',
          error: 'Server overloaded',
          responseTime: 8000,
          statusCode: 503
        },
        {
          id: '4',
          timestamp: '2024-01-15 14:27:45',
          endpoint: '/home',
          status: 'success',
          responseTime: 156,
          statusCode: 200
        },
        {
          id: '5',
          timestamp: '2024-01-15 14:26:30',
          endpoint: '/api/status',
          status: 'error',
          error: 'Database connection failed',
          responseTime: 3000,
          statusCode: 500
        }
      ],
      notificationLogs: [
        {
          id: '1',
          timestamp: '2024-01-15 14:30:25',
          type: 'email',
          message: 'Alert: Connection timeout on /api/users',
          status: 'sent'
        },
        {
          id: '2',
          timestamp: '2024-01-15 14:28:05',
          type: 'telegram',
          message: 'Server overloaded detected',
          status: 'sent'
        },
        {
          id: '3',
          timestamp: '2024-01-15 14:26:30',
          type: 'slack',
          message: 'Database connection failed',
          status: 'failed'
        },
        {
          id: '4',
          timestamp: '2024-01-15 14:25:15',
          type: 'email',
          message: 'High response time detected on /api/products',
          status: 'sent'
        },
        {
          id: '5',
          timestamp: '2024-01-15 14:24:45',
          type: 'telegram',
          message: 'Memory usage exceeded 90%',
          status: 'sent'
        },
        {
          id: '6',
          timestamp: '2024-01-15 14:23:30',
          type: 'webhook',
          message: 'Service health check failed',
          status: 'failed'
        },
        {
          id: '7',
          timestamp: '2024-01-15 14:22:15',
          type: 'email',
          message: 'Disk space low on server',
          status: 'sent'
        },
        {
          id: '8',
          timestamp: '2024-01-15 14:21:00',
          type: 'slack',
          message: 'API rate limit exceeded',
          status: 'sent'
        },
        {
          id: '9',
          timestamp: '2024-01-15 14:20:45',
          type: 'telegram',
          message: 'SSL certificate expires in 7 days',
          status: 'sent'
        },
        {
          id: '10',
          timestamp: '2024-01-15 14:19:30',
          type: 'email',
          message: 'Backup process completed successfully',
          status: 'sent'
        },
        {
          id: '11',
          timestamp: '2024-01-15 14:18:15',
          type: 'webhook',
          message: 'New deployment detected',
          status: 'sent'
        },
        {
          id: '12',
          timestamp: '2024-01-15 14:17:00',
          type: 'slack',
          message: 'Cache warming completed',
          status: 'sent'
        }
      ],
      addLog: (log) => set((state) => ({
        logs: [{ ...log, id: Date.now().toString() }, ...state.logs]
      })),
      addNotificationLog: (log) => set((state) => ({
        notificationLogs: [{ ...log, id: Date.now().toString() }, ...state.notificationLogs]
      }))
    }),
    {
      name: 'pingtower-storage',
      partialize: (state) => ({ 
        isLoggedIn: state.isLoggedIn, 
        user: state.user,
        resources: state.resources 
      })
    }
  )
)
