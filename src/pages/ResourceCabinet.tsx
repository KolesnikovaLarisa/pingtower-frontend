import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle, XCircle, Loader2, Lightbulb } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Tooltip as ReactTooltip } from 'react-tooltip'
import Header from '../components/Header'
import { useResourcesStore } from '../store/resourcesStore'
import { getResourceById } from '../api/resources'

const ResourceCabinet = () => {
  const { id } = useParams<{ id: string }>()
  const [isLoading, setIsLoading] = useState(true)
  const [checkInterval, setCheckInterval] = useState('1 ч')
  const { resources } = useResourcesStore()
  
  const resource = resources.find(r => r.id === id)

  // Интервалы проверки ресурса
  const checkIntervals = [
    '30 мин',
    '1 ч', 
    '2 ч',
    '3 ч',
    '6 ч',
    '12 ч',
    '24 ч',
    '48 ч',
    '72 ч'
  ]

  // Расширенный список эндпоинтов для демонстрации прокрутки
  const extendedEndpoints = [
    ...(resource?.endpoints || []),
    { path: '/api/users/profile/settings/notifications', status: 'online' as const, errors24h: 0 },
    { path: '/api/products/categories/subcategories/items/details', status: 'online' as const, errors24h: 1 },
    { path: '/api/orders/history/payments/transactions/refunds', status: 'offline' as const, errors24h: 3 },
    { path: '/api/analytics/dashboard/reports/export/data', status: 'online' as const, errors24h: 0 },
    { path: '/api/admin/users/roles/permissions/access-control', status: 'online' as const, errors24h: 2 },
    { path: '/api/integrations/third-party/webhooks/callbacks', status: 'offline' as const, errors24h: 5 },
    { path: '/api/monitoring/health-checks/status/alerts', status: 'online' as const, errors24h: 0 },
    { path: '/api/authentication/oauth/providers/tokens/refresh', status: 'online' as const, errors24h: 1 },
    { path: '/api/content-management/pages/templates/assets/uploads', status: 'offline' as const, errors24h: 4 },
    { path: '/api/customer-support/tickets/attachments/responses', status: 'online' as const, errors24h: 0 },
    { path: '/api/billing/subscriptions/plans/features/usage', status: 'online' as const, errors24h: 1 },
    { path: '/api/security/audit-logs/compliance/reports/export', status: 'offline' as const, errors24h: 2 }
  ]

  // Mock данные для графика сбоев
  const errorChartData = [
    { time: '12:00', errors: 1 },
    { time: '13:00', errors: 0 },
    { time: '14:00', errors: 2 },
    { time: '15:00', errors: 0 },
    { time: '16:00', errors: 1 },
    { time: '17:00', errors: 0 },
    { time: '18:00', errors: 3 },
    { time: '19:00', errors: 0 },
    { time: '20:00', errors: 1 },
    { time: '21:00', errors: 0 },
  ]

  // Функция для определения цвета точки на основе количества сбоев
  const getDotColor = (errors: number) => {
    const maxErrors = Math.max(...errorChartData.map(d => d.errors))
    const third = maxErrors / 3
    
    if (errors <= third) {
      return '#2D5016' // тёмно-зелёный - мало сбоев
    } else if (errors <= third * 2) {
      return '#B8860B' // тёмно-оранжевый - средние сбои
    } else {
      return '#8B0000' // бордовый - много сбоев
    }
  }

  useEffect(() => {
    const loadResourceData = async () => {
      if (!id) return
      
      try {
        setIsLoading(true)
        // Если ресурс не найден в store, загружаем его с сервера
        if (!resource) {
          await getResourceById(id)
          // Обновляем store с полученными данными
          // Здесь можно добавить логику обновления store
        }
      } catch (error) {
        console.error('Error loading resource:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadResourceData()
  }, [id, resource])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-milky">
        <Header />
        <div className="container py-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-navyDark" />
          </div>
        </div>
      </div>
    )
  }

  if (!resource) {
    return (
      <div className="min-h-screen bg-milky">
        <Header />
        <div className="container py-6">
          <div className="text-center py-12">
            <h1 className="text-2xl font-montserrat font-bold text-navyDark mb-4">Ресурс не найден</h1>
            <Link to="/app/resources" className="btn-primary">
              Вернуться к ресурсам
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const getStatusIcon = (status: 'online' | 'offline') => {
    if (status === 'online') {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    return <XCircle className="h-4 w-4 text-red-500" />
  }

  const getStatusTooltip = (status: 'online' | 'offline') => {
    return status === 'online' ? 'Доступен' : 'Сбой'
  }

  return (
    <div className="min-h-screen bg-milky">
      <Header />
      
      <div className="container py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link
              to="/app/resources"
              className="p-2 rounded-md hover:bg-silverGrad hover:brightness-110 transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5 text-midGray" />
            </Link>
            <div>
              <h1 className="text-2xl font-montserrat font-bold text-navyDark">{resource.name}</h1>
              <p className="text-midGray font-inter">{resource.url}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/*<span className="text-sm text-midGray font-inter">Интервал проверки:</span>*/}
            <select
              value={checkInterval}
              onChange={(e) => setCheckInterval(e.target.value)}
              className="px-3 py-2 border border-lightGray/50 rounded-md focus:outline-none focus:ring-2 focus:ring-midGray focus:border-transparent bg-white text-black font-inter text-sm"
              data-tooltip-id="interval-tooltip"
              data-tooltip-content="Выберите интервал проверки ресурса"
            >
              {checkIntervals.map((interval) => (
                <option key={interval} value={interval}>
                  {interval}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Resource Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-gray-300 to-gray-400 rounded-xl border border-gray-500/30 p-4 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-steelGrad rounded-lg animate-pulse">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-white font-inter font-medium">Время работы</p>
                <p className="text-lg font-inter font-bold text-white">{resource.uptime}%</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-300 to-gray-400 rounded-xl border border-gray-500/30 p-4 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-steelGrad rounded-lg animate-pulse">
                <XCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-white font-inter font-medium">Сбои 24ч</p>
                <p className="text-lg font-inter font-bold text-white">{resource.errors24h}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-300 to-gray-400 rounded-xl border border-gray-500/30 p-4 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-steelGrad rounded-lg animate-pulse">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-white font-inter font-medium">Активные</p>
                <p className="text-lg font-inter font-bold text-white">{resource.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-300 to-gray-400 rounded-xl border border-gray-500/30 p-4 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-steelGrad rounded-lg animate-pulse">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-white font-inter font-medium">SLA</p>
                <p className="text-lg font-inter font-bold text-white">{resource.sla}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Chart */}
        <div className="chart-container mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-inter font-semibold text-navyDark">График сбоев</h2>
            <div className="flex items-center space-x-2 text-sm text-midGray font-inter">
              <Lightbulb className="h-4 w-4 text-navyDark" />
              <span>График показывает тренд сбоев — низкий = всё ок</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={errorChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#A9A9A9" strokeOpacity={0.3} />
                <XAxis 
                  dataKey="time" 
                  stroke="#000000"
                  fontSize={12}
                  fontFamily="Inter"
                />
                <YAxis 
                  stroke="#000000"
                  fontSize={12}
                  fontFamily="Inter"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#F5F5F5',
                    border: '1px solid #C0C0C0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#000000',
                    fontFamily: 'Inter',
                  }}
                  labelFormatter={(value) => `Время: ${value}`}
                  formatter={(value) => [`${value} сбоев`, 'Сбоев за час']}
                />
                <Line
                  type="monotone"
                  dataKey="errors"
                  stroke="url(#steelGradient)"
                  strokeWidth={3}
                  dot={(props) => {
                    const { cx, cy, payload } = props
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={5}
                        fill={getDotColor(payload.errors)}
                        stroke="#C0C0C0"
                        strokeWidth={2}
                      />
                    )
                  }}
                  activeDot={(props: any) => {
                    const { cx, cy, payload } = props
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={7}
                        fill={getDotColor(payload.errors)}
                        stroke="#C0C0C0"
                        strokeWidth={2}
                        filter="brightness(1.2)"
                      />
                    )
                  }}
                  strokeDasharray="0"
                  animationDuration={1000}
                />
                <defs>
                  <linearGradient id="steelGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#808080" />
                    <stop offset="100%" stopColor="#43464B" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Легенда цветовой шкалы */}
          <div className="mt-4 flex items-center justify-center space-x-6 text-sm font-inter">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#2D5016' }}></div>
              <span className="text-midGray">Мало сбоев</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#B8860B' }}></div>
              <span className="text-midGray">Средние сбои</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#8B0000' }}></div>
              <span className="text-midGray">Много сбоев</span>
            </div>
          </div>
        </div>

        {/* Endpoints Table */}
        <div className="bg-white rounded-xl border border-lightGray/40 overflow-hidden shadow-md">
          <div className="px-6 py-4 border-b border-lightGray/40">
            <h2 className="text-lg font-inter font-semibold text-navyDark">URL</h2>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-lightGray sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-inter font-medium text-navyDark uppercase tracking-wider">
                    URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-inter font-medium text-navyDark uppercase tracking-wider">
                    Индикатор
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-inter font-medium text-navyDark uppercase tracking-wider">
                    Сбои 24ч
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-lightGray/30">
                {extendedEndpoints.map((endpoint, index) => (
                  <tr key={index} className="hover:bg-silverGrad hover:brightness-110 transition-all duration-300">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div 
                        className="text-sm font-inter font-medium text-black truncate max-w-xs"
                        title={endpoint.path}
                      >
                        {endpoint.path}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div
                          data-tooltip-id="status-tooltip"
                          data-tooltip-content={getStatusTooltip(endpoint.status)}
                        >
                          {getStatusIcon(endpoint.status)}
                        </div>
                        <span className="text-sm text-midGray font-inter">
                          {endpoint.status === 'online' ? 'Доступен' : 'Сбой'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-inter font-medium ${
                        endpoint.errors24h === 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {endpoint.errors24h}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Tooltips */}
      <ReactTooltip
        id="status-tooltip"
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
      <ReactTooltip
        id="interval-tooltip"
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

export default ResourceCabinet
