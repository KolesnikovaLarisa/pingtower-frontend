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
    uptime: number
    errors24h: number
    active: number
    sla: number
  }
  addResource: (resource: Omit<Resource, 'id'>) => Promise<void>
  updateResource: (id: string, updates: Partial<Resource>) => Promise<void>
  removeResource: (id: string) => Promise<void>
  loadResources: () => Promise<void>
  searchEndpoints: (url: string) => Promise<Array<{ path: string; method: string; status: string }>>
  
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
    (set) => ({
      // Resources
      resources: [
        {
          id: '1',
          name: 'Мой сайт',
          url: 'https://example.com',
          endpoints: [
            { path: '/login', status: 'online', errors24h: 0 },
            { path: '/home', status: 'online', errors24h: 1 },
            { path: '/api', status: 'offline', errors24h: 3 }
          ],
          status: 'online',
          uptime: 99.2,
          errors24h: 4,
          active: 2,
          sla: 99.5
        }
      ],
      metrics: {
        uptime: 99,
        errors24h: 2,
        active: 3,
        sla: 99.5
      },
      addResource: async (resource) => {
        try {
          const newResource = await apiCreateResource(resource.name, resource.url);
          set((state) => ({
            resources: [...state.resources, newResource]
          }));
        } catch (error) {
          console.error('Error adding resource:', error);
          throw error;
        }
      },
      updateResource: async (id, updates) => {
        try {
          const updatedResource = await apiUpdateResource(id, updates);
          set((state) => ({
            resources: state.resources.map(r => r.id === id ? updatedResource : r)
          }));
        } catch (error) {
          console.error('Error updating resource:', error);
          throw error;
        }
      },
      removeResource: async (id) => {
        try {
          await apiDeleteResource(id);
          set((state) => ({
            resources: state.resources.filter(r => r.id !== id)
          }));
        } catch (error) {
          console.error('Error removing resource:', error);
          throw error;
        }
      },
      loadResources: async () => {
        try {
          const resources = await apiGetResources();
          set({ resources });
        } catch (error) {
          console.error('Error loading resources:', error);
          throw error;
        }
      },
      searchEndpoints: async (url) => {
        try {
          return await apiSearchEndpoints(url);
        } catch (error) {
          console.error('Error searching endpoints:', error);
          throw error;
        }
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
        const user = getCurrentUser();
        if (user) {
          set({ isLoggedIn: true, user });
        } else {
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
