import { useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Bot } from 'lucide-react'
import { Tooltip } from 'react-tooltip'
import Header from '../components/Header'
import { useResourcesStore, LogEntry } from '../store/resourcesStore'

const ObservationsPage = () => {
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAIModalOpen, setIsAIModalOpen] = useState(false)
  const [timeFilter, setTimeFilter] = useState('all')
  const [resourceFilter, setResourceFilter] = useState('all')

  const { logs, resources } = useResourcesStore()

  // Расширенный список логов для демонстрации прокрутки
  const extendedLogs = [
    ...logs,
    {
      id: '6',
      timestamp: '2024-01-15 14:25:15',
      endpoint: '/api/users/profile/settings/notifications/preferences',
      status: 'success' as const,
      responseTime: 180,
      statusCode: 200
    },
    {
      id: '7',
      timestamp: '2024-01-15 14:24:45',
      endpoint: '/api/products/categories/subcategories/items/details/specifications',
      status: 'error' as const,
      error: 'Database connection timeout exceeded maximum retry limit',
      responseTime: 8000,
      statusCode: 500
    },
    {
      id: '8',
      timestamp: '2024-01-15 14:23:30',
      endpoint: '/api/orders/history/payments/transactions/refunds/processing',
      status: 'success' as const,
      responseTime: 220,
      statusCode: 200
    },
    {
      id: '9',
      timestamp: '2024-01-15 14:22:15',
      endpoint: '/api/analytics/dashboard/reports/export/data/statistics',
      status: 'error' as const,
      error: 'Memory allocation failed due to insufficient heap space',
      responseTime: 12000,
      statusCode: 503
    },
    {
      id: '10',
      timestamp: '2024-01-15 14:21:00',
      endpoint: '/api/admin/users/roles/permissions/access-control/matrix',
      status: 'success' as const,
      responseTime: 195,
      statusCode: 200
    },
    {
      id: '11',
      timestamp: '2024-01-15 14:20:45',
      endpoint: '/api/integrations/third-party/webhooks/callbacks/retry',
      status: 'error' as const,
      error: 'SSL certificate validation failed for external service',
      responseTime: 5000,
      statusCode: 502
    },
    {
      id: '12',
      timestamp: '2024-01-15 14:19:30',
      endpoint: '/api/monitoring/health-checks/status/alerts/notifications',
      status: 'success' as const,
      responseTime: 165,
      statusCode: 200
    },
    {
      id: '13',
      timestamp: '2024-01-15 14:18:15',
      endpoint: '/api/authentication/oauth/providers/tokens/refresh/validation',
      status: 'error' as const,
      error: 'Token signature verification failed with invalid key',
      responseTime: 3000,
      statusCode: 401
    },
    {
      id: '14',
      timestamp: '2024-01-15 14:17:00',
      endpoint: '/api/content-management/pages/templates/assets/uploads/processing',
      status: 'success' as const,
      responseTime: 280,
      statusCode: 200
    },
    {
      id: '15',
      timestamp: '2024-01-15 14:16:45',
      endpoint: '/api/customer-support/tickets/attachments/responses/automated',
      status: 'error' as const,
      error: 'File size exceeds maximum allowed limit for processing',
      responseTime: 15000,
      statusCode: 413
    }
  ]

  const filteredLogs = extendedLogs.filter(log => {
    const now = Date.now()
    const logTime = new Date(log.timestamp).getTime()
    
    const timeMatch = timeFilter === 'all' || 
      (timeFilter === '30min' && logTime > now - 30 * 60 * 1000) ||
      (timeFilter === '1h' && logTime > now - 60 * 60 * 1000) ||
      (timeFilter === '2h' && logTime > now - 2 * 60 * 60 * 1000) ||
      (timeFilter === '3h' && logTime > now - 3 * 60 * 60 * 1000) ||
      (timeFilter === '6h' && logTime > now - 6 * 60 * 60 * 1000) ||
      (timeFilter === '12h' && logTime > now - 12 * 60 * 60 * 1000) ||
      (timeFilter === '24h' && logTime > now - 24 * 60 * 60 * 1000) ||
      (timeFilter === '48h' && logTime > now - 48 * 60 * 60 * 1000) ||
      (timeFilter === '72h' && logTime > now - 72 * 60 * 60 * 1000)
    
    const resourceMatch = resourceFilter === 'all' || 
      resources.some(resource => resource.endpoints.some(ep => ep.path === log.endpoint))
    
    return timeMatch && resourceMatch
  })

  const handleLogClick = (log: LogEntry) => {
    setSelectedLog(log)
    setIsModalOpen(true)
  }

  const getStatusIcon = (status: 'success' | 'error') => {
    if (status === 'success') {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    return <XCircle className="h-4 w-4 text-red-500" />
  }

  const getStatusText = (status: 'success' | 'error') => {
    return status === 'success' ? 'Успех' : 'Ошибка'
  }

  const getAIResponse = (log: LogEntry) => {
    if (log.status === 'success') {
      return {
        analysis: 'Сервис работает стабильно. Время отклика в пределах нормы.',
        recommendation: 'Продолжайте мониторинг. Все показатели в порядке.'
      }
    }

    const responses = {
      'Connection timeout': {
        analysis: 'Таймаут — сервер перегружен или недоступен.',
        recommendation: 'Проверьте хостинг и нагрузку на сервер. Рассмотрите масштабирование.'
      },
      'Server overloaded': {
        analysis: 'Сервер перегружен. Высокое время отклика указывает на проблемы с производительностью.',
        recommendation: 'Оптимизируйте код, добавьте кэширование или увеличьте ресурсы сервера.'
      },
      'Database connection failed': {
        analysis: 'Проблема с подключением к базе данных.',
        recommendation: 'Проверьте состояние БД, сетевые подключения и настройки пула соединений.'
      }
    }

    return responses[log.error as keyof typeof responses] || {
      analysis: 'Обнаружена ошибка в работе сервиса.',
      recommendation: 'Проверьте логи сервера для получения дополнительной информации.'
    }
  }

  return (
    <div className="min-h-screen bg-milky">
      <Header />
      
      <div className="container py-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h1 className="text-2xl font-montserrat font-bold text-navyDark">Наблюдения</h1>
                <p className="text-midGray mt-1 font-inter">Логи и анализ работы ваших сервисов</p>
              </div>
            </div>

            {/* AI Analysis */}
            <div className="bg-milky rounded-xl border border-silverGrad p-6 mb-6 shadow-md animate-fadeIn">
              <div className="flex items-center space-x-2 mb-4">
                <Bot className="h-5 w-5 text-navyDark" />
                <h3 className="text-lg font-inter font-semibold text-navyDark">AI-анализ</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white/60 rounded-lg border border-silverGrad">
                  <h4 className="text-sm font-inter font-medium text-navyDark mb-2">Последний анализ:</h4>
                  <p className="text-sm text-midGray mb-2 font-inter">
                    Таймаут — сервер перегружен. Рекомендация: проверьте хостинг.
                  </p>
                  <button
                    onClick={() => setIsAIModalOpen(true)}
                    className="text-xs text-navyDark hover:text-black font-inter font-medium underline underline-offset-4 transition-colors"
                  >
                    Детали лога →
                  </button>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-400 to-green-600 rounded-lg">
                  <h4 className="text-sm font-inter font-medium text-white mb-2">Статистика:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white font-inter">Успешных запросов:</span>
                      <span className="text-white font-inter font-medium">78%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white font-inter">Средний отклик:</span>
                      <span className="text-white font-inter font-medium">245ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white font-inter">Критических ошибок:</span>
                      <span className="text-white font-inter font-medium">3</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-lightGray/40 p-4 mb-6 shadow-md">
              <div className="flex flex-col sm:flex-row gap-4">
                <div>
                  <label className="block text-sm font-inter font-medium text-black mb-1">
                    Время
                  </label>
                  <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className="input"
                  >
                    <option value="all">Все время</option>
                    <option value="30min">30 минут</option>
                    <option value="1h">1 час</option>
                    <option value="2h">2 часа</option>
                    <option value="3h">3 часа</option>
                    <option value="6h">6 часов</option>
                    <option value="12h">12 часов</option>
                    <option value="24h">24 часа</option>
                    <option value="48h">48 часов</option>
                    <option value="72h">72 часа</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-inter font-medium text-black mb-1">
                    Ресурс
                  </label>
                  <select
                    value={resourceFilter}
                    onChange={(e) => setResourceFilter(e.target.value)}
                    className="input"
                  >
                    <option value="all">Все ресурсы</option>
                    {resources.map(resource => (
                      <option key={resource.id} value={resource.id}>
                        {resource.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-xl border border-lightGray/40 overflow-hidden shadow-md">
              <div className="max-h-80 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-lightGray sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-inter font-medium text-navyDark uppercase tracking-wider">
                        Время
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-inter font-medium text-navyDark uppercase tracking-wider">
                        URL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-inter font-medium text-navyDark uppercase tracking-wider">
                        Статус
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-inter font-medium text-navyDark uppercase tracking-wider">
                        Ошибка
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-lightGray/30">
                    {extendedLogs.map((log) => (
                      <tr 
                        key={log.id} 
                        className="hover:bg-silverGrad hover:brightness-110 transition-all duration-300 cursor-pointer"
                        onClick={() => handleLogClick(log)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black font-inter">
                          {log.timestamp}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div 
                            className="text-sm text-black font-inter truncate max-w-xs"
                            title={log.endpoint}
                          >
                            {log.endpoint}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(log.status)}
                            <span className="text-sm text-black font-inter">
                              {getStatusText(log.status)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div 
                            className="text-sm text-black font-inter truncate max-w-xs"
                            title={log.error || '-'}
                          >
                            {log.error || '-'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {filteredLogs.length === 0 && (
              <div className="text-center py-12">
                <AlertTriangle className="mx-auto h-12 w-12 text-midGray" />
                <h3 className="mt-2 text-sm font-inter font-medium text-navyDark">Логи не найдены</h3>
                <p className="mt-1 text-sm text-midGray font-inter">
                  Попробуйте изменить фильтры или добавьте ресурсы для мониторинга
                </p>
              </div>
            )}
      </div>

      {/* Log Details Modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-deepNavy/50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-milky p-6 text-left align-middle shadow-xl transition-all border border-lightGray/40">
                  <Dialog.Title as="h3" className="text-lg font-inter font-medium leading-6 text-black mb-4">
                    Детали лога
                  </Dialog.Title>

                  {selectedLog && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-inter font-medium text-black">Время</label>
                          <p className="text-sm text-black font-inter">{selectedLog.timestamp}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-inter font-medium text-black">URL</label>
                          <p className="text-sm text-black font-inter">{selectedLog.endpoint}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-inter font-medium text-black">Статус</label>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(selectedLog.status)}
                            <span className="text-sm text-black font-inter">
                              {getStatusText(selectedLog.status)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-inter font-medium text-black">Код ответа</label>
                          <p className="text-sm text-black font-inter">{selectedLog.statusCode}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-inter font-medium text-black">Время отклика</label>
                          <p className="text-sm text-black font-inter">{selectedLog.responseTime}ms</p>
                        </div>
                        {selectedLog.error && (
                          <div>
                            <label className="block text-sm font-inter font-medium text-black">Ошибка</label>
                            <p className="text-sm text-red-600 font-inter">{selectedLog.error}</p>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-lightGray/40">
                        <button
                          onClick={() => {
                            setIsModalOpen(false)
                            setIsAIModalOpen(true)
                          }}
                          className="btn-primary flex items-center space-x-2"
                        >
                          <Bot className="h-4 w-4" />
                          <span>AI-анализ</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="btn-secondary"
                    >
                      Закрыть
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* AI Analysis Modal */}
      <Transition appear show={isAIModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsAIModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-milky p-6 text-left align-middle shadow-xl transition-all border border-lightGray/40">
                  <Dialog.Title as="h3" className="text-lg font-inter font-medium leading-6 text-black mb-4 flex items-center space-x-2">
                    <Bot className="h-5 w-5 text-navyDark" />
                    <span>AI-анализ</span>
                  </Dialog.Title>

                  {selectedLog && (
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg">
                        <h4 className="text-sm font-inter font-medium text-white mb-2">Анализ:</h4>
                        <p className="text-sm text-white font-inter">
                          {getAIResponse(selectedLog).analysis}
                        </p>
                      </div>

                      <div className="p-4 bg-gradient-to-r from-green-400 to-green-600 rounded-lg">
                        <h4 className="text-sm font-inter font-medium text-white mb-2">Рекомендация:</h4>
                        <p className="text-sm text-white font-inter">
                          {getAIResponse(selectedLog).recommendation}
                        </p>
                      </div>

                      <div className="p-4 bg-lightGray rounded-lg border border-silverGrad">
                        <h4 className="text-sm font-inter font-medium text-navyDark mb-2">Дополнительная информация:</h4>
                        <ul className="text-sm text-midGray space-y-1 font-inter">
                          <li>• Время отклика: {selectedLog.responseTime}ms</li>
                          <li>• HTTP статус: {selectedLog.statusCode}</li>
                          <li>• URL: {selectedLog.endpoint}</li>
                          <li>• Время события: {selectedLog.timestamp}</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setIsAIModalOpen(false)}
                      className="btn-secondary"
                    >
                      Закрыть
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Tooltips */}
      <Tooltip
        id="error-tooltip"
        place="top"
        style={{
          backgroundColor: '#F5F5F5',
          color: '#000000',
          borderRadius: '6px',
          fontSize: '12px',
          padding: '6px 8px',
          border: '1px solid #C0C0C0',
          fontFamily: 'Inter',
        }}
      />
    </div>
  )
}

export default ObservationsPage
